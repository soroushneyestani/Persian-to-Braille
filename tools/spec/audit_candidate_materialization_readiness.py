from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]

ADMISSION = (
    ROOT / "spec" / "fa-ir" / "adjudications"
    / "candidate-admission-manifest.json"
)
RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "records"

EXPECTED_ELIGIBLE = 138


class AuditError(RuntimeError):
    pass


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise AuditError(f"Missing file: {path.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise AuditError(
            f"Invalid JSON: {path.relative_to(ROOT)}:"
            f"{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def valid_cell(cell: str) -> bool:
    if cell == "0":
        return True
    if not re.fullmatch(r"[1-6]{1,6}", cell):
        return False
    if len(set(cell)) != len(cell):
        return False
    return list(cell) == sorted(cell, key=int)


def split_cells(value):
    if value is None:
        return None
    if not isinstance(value, str):
        return None
    if value == "":
        return []
    return value.split("-")


def proposed_rule_id(decision_id: str) -> str:
    if decision_id.startswith("FA-LATIN-MODE-"):
        return "FA-G1-LATIN-MODE-" + decision_id.rsplit("-", 1)[1]
    if decision_id.startswith("FA-LATIN-"):
        return "FA-G1-LATIN-" + decision_id.rsplit("-", 1)[1]

    m = re.fullmatch(r"FA-DIGIT-(ASCII|PERSIAN|ARABIC-INDIC)-([0-9])", decision_id)
    if m:
        family, digit = m.groups()
        return f"FA-G1-DIGIT-{family}-{int(digit):03d}"

    if decision_id.startswith("FA-NUMRULE-"):
        return "FA-G1-NUMRULE-" + decision_id.rsplit("-", 1)[1]

    if decision_id == "FA-PUNC-013":
        return "FA-G1-PUNC-UNICODE-ELLIPSIS-001"

    if decision_id.startswith("FA-PUNC-"):
        return "FA-G1-PUNC-SCALAR-" + decision_id.rsplit("-", 1)[1]

    if decision_id == "FA-SEQ-001":
        return "FA-G1-ORTHO-EZAFE-SEQUENCE-001"

    if decision_id == "FA-FMT-001":
        return "FA-G1-NORM-ZWNJ-001"

    if decision_id.startswith("FA-WS-"):
        return "FA-G1-LAYOUT-" + decision_id.rsplit("-", 1)[1]

    raise AuditError(f"No proposed stable rule ID for {decision_id}")


def proposed_vector_id(rule_id: str) -> str:
    return "FA-CONF-" + rule_id.removeprefix("FA-G1-")


def candidate_cells(decision_id: str, packet: dict):
    comparison = packet["stableDraftComparison"]
    stable = comparison.get("stable")
    draft = comparison.get("draft")

    if decision_id.startswith("FA-LATIN-"):
        if decision_id.startswith("FA-LATIN-MODE-"):
            return None
        if not isinstance(draft, dict):
            return None
        return split_cells(draft.get("dots"))

    if decision_id.startswith("FA-DIGIT-"):
        if not isinstance(stable, dict):
            return None
        return split_cells(stable.get("dots"))

    if decision_id == "FA-PUNC-013":
        if not isinstance(draft, dict):
            return None
        return split_cells(draft.get("dots"))

    if decision_id.startswith("FA-PUNC-"):
        if not isinstance(stable, dict):
            return None
        return split_cells(stable.get("dots"))

    if decision_id == "FA-SEQ-001":
        if not isinstance(draft, dict):
            return None
        return split_cells(draft.get("dots"))

    if decision_id.startswith("FA-NUMRULE-"):
        if decision_id == "FA-NUMRULE-001":
            if not isinstance(stable, dict):
                return None
            return split_cells(stable.get("dots"))
        if not isinstance(stable, dict):
            return None
        return split_cells(stable.get("dots"))

    # Normalization and layout are represented structurally, not as direct cells.
    if decision_id == "FA-FMT-001" or decision_id.startswith("FA-WS-"):
        return None

    return None


def classify_representation(decision_id: str, entry: dict, packet: dict):
    target_type = entry["targetRuleType"]

    if target_type in {"normalization", "layout"}:
        return "structural", None

    if target_type == "mode":
        if decision_id == "FA-LATIN-MODE-001":
            return "structural", None

        stage = packet.get("stageEvidenceRecord", {})
        if decision_id.startswith("FA-LATIN-MODE-"):
            value = stage.get("liblouisDraft", {}).get("value")
            cells = split_cells(value)
        else:
            cells = candidate_cells(decision_id, packet)

        if cells is None or not cells or not all(valid_cell(cell) for cell in cells):
            return "blocked", f"mode output is not a canonical six-dot cell sequence: {cells!r}"
        return "cells", cells

    cells = candidate_cells(decision_id, packet)
    if cells is None:
        return "blocked", "no deterministic cell output could be derived from approved evidence"

    if not cells:
        return "blocked", "empty cell output for a non-structural accepted rule"

    bad = [cell for cell in cells if not valid_cell(cell)]
    if bad:
        return (
            "blocked",
            "non-Braille/virtual Liblouis operand cannot be emitted by the current "
            f"six-dot rule schema: {bad!r}",
        )

    return "cells", cells


def main() -> int:
    try:
        admission = read_json(ADMISSION)
        entries = admission["entries"]

        if len(entries) != EXPECTED_ELIGIBLE:
            raise AuditError(
                f"Expected {EXPECTED_ELIGIBLE} admission entries, found {len(entries)}"
            )

        existing_rule_ids = set()
        for path in RULE_DIR.glob("*.json"):
            existing_rule_ids.add(read_json(path)["id"])

        existing_vector_ids = set()
        for path in CONF_DIR.glob("*.json"):
            existing_vector_ids.add(read_json(path)["id"])

        rows = []
        proposed_rule_ids = set()
        proposed_vector_ids = set()

        for entry in entries:
            decision_id = entry["decisionItemId"]
            record_path = ROOT / entry["adjudicationRecordPath"]
            record = read_json(record_path)
            packet_path = ROOT / record["basis"]["evidencePacketPath"]
            packet = read_json(packet_path)

            rule_id = proposed_rule_id(decision_id)
            vector_id = proposed_vector_id(rule_id)

            if rule_id in proposed_rule_ids:
                raise AuditError(f"Duplicate proposed rule ID: {rule_id}")
            if vector_id in proposed_vector_ids:
                raise AuditError(f"Duplicate proposed conformance ID: {vector_id}")

            proposed_rule_ids.add(rule_id)
            proposed_vector_ids.add(vector_id)

            representation, detail = classify_representation(
                decision_id, entry, packet
            )

            rows.append(
                {
                    "decisionId": decision_id,
                    "targetType": entry["targetRuleType"],
                    "ruleId": rule_id,
                    "vectorId": vector_id,
                    "representation": representation,
                    "detail": detail,
                    "ruleCollision": rule_id in existing_rule_ids,
                    "vectorCollision": vector_id in existing_vector_ids,
                }
            )

        representation_counts = Counter(
            row["representation"] for row in rows
        )
        type_counts = Counter(row["targetType"] for row in rows)
        blocked = [row for row in rows if row["representation"] == "blocked"]
        collisions = [
            row for row in rows
            if row["ruleCollision"] or row["vectorCollision"]
        ]

        print("PHASE 2.14 — CANDIDATE MATERIALIZATION READINESS AUDIT")
        print("=" * 88)
        print(f"Admission entries             : {len(rows)}")
        print(f"Existing base rule IDs        : {len(existing_rule_ids)}")
        print(f"Existing base vector IDs      : {len(existing_vector_ids)}")
        print()

        print("Target types:")
        for key, value in sorted(type_counts.items()):
            print(f"  {key:<18}: {value}")
        print()

        print("Representation readiness:")
        for key, value in sorted(representation_counts.items()):
            print(f"  {key:<18}: {value}")
        print(f"  ID collisions      : {len(collisions)}")
        print()

        if collisions:
            print("COLLISIONS")
            print("-" * 88)
            for row in collisions:
                print(
                    f"{row['decisionId']}: {row['ruleId']} / {row['vectorId']}"
                )
            print()

        if blocked:
            print("BLOCKERS")
            print("-" * 88)
            for row in blocked:
                print(f"{row['decisionId']} -> {row['ruleId']}")
                print(f"  target type : {row['targetType']}")
                print(f"  reason      : {row['detail']}")
                print()

        print("READY EXAMPLES")
        print("-" * 88)
        for row in rows[:12]:
            if row["representation"] != "blocked":
                print(
                    f"{row['decisionId']:<22} "
                    f"{row['targetType']:<14} "
                    f"{row['representation']:<10} "
                    f"{row['ruleId']}"
                )

        print()
        if blocked or collisions:
            print("Materialization readiness: BLOCKED")
            print(
                "No rule/conformance artifact was written. Resolve the blocker(s) "
                "before assigning published candidate IDs."
            )
            return 2

        print("Materialization readiness: PASS")
        print("No rule/conformance artifact was written.")
        return 0

    except AuditError as exc:
        print("Materialization readiness audit: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
