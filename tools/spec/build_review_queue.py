from __future__ import annotations

from collections import Counter, defaultdict
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
QUEUE_JSON = ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json"
QUEUE_MD = ROOT / "docs" / "specification" / "phase-2.11-review-queue.md"

EXPECTED_TOTAL = 290
EXPECTED_CONSENSUS = 37
EXPECTED_REVIEW = 252
EXPECTED_UNRESOLVED = 1
EXPECTED_QUEUE = 253

EXPECTED_STAGE_COUNTS = {
    "1.3": 27,
    "1.4": 57,
    "1.5": 56,
    "1.6": 27,
    "1.7": 86,
}

STAGE_META = {
    "1.3": {
        "category": "orthographic-variants",
        "title": "Orthographic variants",
        "priority": 1,
        "reason": "Normalization and orthographic behavior affect canonical text handling.",
    },
    "1.4": {
        "category": "numbers-punctuation",
        "title": "Numbers and punctuation",
        "priority": 2,
        "reason": "Numeric and punctuation semantics are required for practical Grade-1 text.",
    },
    "1.5": {
        "category": "mixed-latin",
        "title": "Mixed Latin",
        "priority": 3,
        "reason": "Mixed-script mode behavior has broad interoperability impact.",
    },
    "1.6": {
        "category": "whitespace-layout",
        "title": "Whitespace and layout",
        "priority": 4,
        "reason": "Whitespace and layout policy must be separated from host rendering behavior.",
    },
    "1.7": {
        "category": "remaining-coverage",
        "title": "Remaining coverage",
        "priority": 5,
        "reason": "Remaining marks, symbols, emphasis, and special cases complete the review surface.",
    },
}


class QueueError(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise QueueError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise QueueError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def fail(message: str) -> None:
    raise QueueError(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def classification_of(item: dict) -> str:
    value = item.get("classification")
    if not isinstance(value, str):
        fail(f"Decision {item.get('id')} has no classification")
    return value


def normalize_stage(value) -> str | None:
    if value is None:
        return None

    if isinstance(value, (int, float)):
        value = str(value)

    if isinstance(value, str):
        text = value.strip()
        match = re.search(r"(?:phase\s*)?1[.\-_ ]([234567])", text, re.I)
        if match:
            return f"1.{match.group(1)}"
        if text in STAGE_META:
            return text

    return None


def infer_stage(item: dict) -> str:
    # Prefer explicit metadata if the master matrix already carries it.
    for key in (
        "stage",
        "phase1Stage",
        "sourceStage",
        "auditStage",
        "decisionStage",
        "originStage",
    ):
        stage = normalize_stage(item.get(key))
        if stage:
            return stage

    origin = item.get("origin")
    if isinstance(origin, dict):
        for key in ("stage", "phase1Stage", "sourceStage"):
            stage = normalize_stage(origin.get(key))
            if stage:
                return stage

    decision_id = str(item.get("id", ""))

    # Deterministic fallback based on decision families established in Phase 1.
    if decision_id.startswith("FA-VAR-"):
        return "1.3"

    if decision_id.startswith(
        (
            "FA-DIGIT-",
            "FA-NUM-",
            "FA-PUNC-",
            "FA-CTX-",
        )
    ):
        return "1.4"

    if decision_id.startswith(
        (
            "FA-LATIN-",
            "FA-MODE-",
            "FA-MIXED-",
        )
    ):
        return "1.5"

    if decision_id.startswith(
        (
            "FA-WS-",
            "FA-SPACE-",
            "FA-WHITESPACE-",
            "FA-LAYOUT-",
        )
    ):
        return "1.6"

    # Phase 1.7 is the terminal remaining-coverage sweep. For queue items only,
    # anything not belonging to the earlier reviewed families is expected here.
    if classification_of(item) in {"REVIEW-REQUIRED", "UNRESOLVED"}:
        return "1.7"

    fail(f"Unable to infer Phase 1 stage for decision {decision_id}")


def extract_source_ids(item: dict) -> list[str]:
    candidates = []

    direct = item.get("sourceIds")
    if isinstance(direct, list):
        candidates.extend(value for value in direct if isinstance(value, str))

    evidence = item.get("evidence")
    if isinstance(evidence, dict):
        nested = evidence.get("sourceIds")
        if isinstance(nested, list):
            candidates.extend(value for value in nested if isinstance(value, str))

    sources = item.get("sources")
    if isinstance(sources, list):
        for source in sources:
            if isinstance(source, str):
                candidates.append(source)
            elif isinstance(source, dict):
                source_id = source.get("id") or source.get("sourceId")
                if isinstance(source_id, str):
                    candidates.append(source_id)

    return sorted(set(candidates))


def evidence_hints(item: dict) -> dict:
    # Keep this intentionally conservative: preserve only fields that already
    # exist in the Phase 1 master decision, without inventing adjudication.
    result = {}

    for key in (
        "subject",
        "input",
        "character",
        "sequence",
        "codePoint",
        "codePoints",
        "stable",
        "draft",
        "manual",
        "legacy",
        "notes",
        "rationale",
    ):
        if key in item:
            result[key] = item[key]

    return result


def build_queue_entry(index: int, item: dict) -> dict:
    stage = infer_stage(item)
    meta = STAGE_META[stage]
    classification = classification_of(item)

    priority = meta["priority"]
    if classification == "UNRESOLVED":
        priority = 0

    return {
        "queueId": f"FA-REVIEW-{index:03d}",
        "decisionItemId": item["id"],
        "classification": classification,
        "phase1Stage": stage,
        "category": meta["category"],
        "priority": priority,
        "status": "pending-adjudication",
        "sourceIds": extract_source_ids(item),
        "evidenceHints": evidence_hints(item),
        "adjudication": {
            "recommendedDisposition": None,
            "maintainerDecision": None,
            "decisionRationale": None,
            "promotionEligible": False,
        },
    }


def main() -> int:
    try:
        master = read_json(MASTER)
        items = master.get("items")

        if not isinstance(items, list):
            fail("Master decision matrix must contain an items array")

        ids = [item.get("id") for item in items]
        assert_equal(len(items), EXPECTED_TOTAL, "Master decision count")
        assert_equal(len(set(ids)), len(ids), "Decision IDs must be unique")

        counts = Counter(classification_of(item) for item in items)

        assert_equal(
            counts.get("CONSENSUS-CANDIDATE", 0),
            EXPECTED_CONSENSUS,
            "CONSENSUS-CANDIDATE count",
        )
        assert_equal(
            counts.get("REVIEW-REQUIRED", 0),
            EXPECTED_REVIEW,
            "REVIEW-REQUIRED count",
        )
        assert_equal(
            counts.get("UNRESOLVED", 0),
            EXPECTED_UNRESOLVED,
            "UNRESOLVED count",
        )

        queue_items = [
            item
            for item in items
            if classification_of(item) in {"REVIEW-REQUIRED", "UNRESOLVED"}
        ]
        assert_equal(len(queue_items), EXPECTED_QUEUE, "Review queue size")

        staged = defaultdict(list)
        for item in queue_items:
            staged[infer_stage(item)].append(item)

        actual_stage_counts = {
            stage: len(staged.get(stage, []))
            for stage in sorted(STAGE_META)
        }
        assert_equal(
            actual_stage_counts,
            EXPECTED_STAGE_COUNTS,
            "Review queue Phase 1 stage distribution",
        )

        # Unresolved decisions are sorted first, then by stage priority and ID.
        ordered = sorted(
            queue_items,
            key=lambda item: (
                0 if classification_of(item) == "UNRESOLVED" else 1,
                STAGE_META[infer_stage(item)]["priority"],
                item["id"],
            ),
        )

        queue = [
            build_queue_entry(index, item)
            for index, item in enumerate(ordered, start=1)
        ]

        unresolved = [
            row for row in queue if row["classification"] == "UNRESOLVED"
        ]
        assert_equal(len(unresolved), 1, "Unresolved queue entries")

        review_required = [
            row for row in queue if row["classification"] == "REVIEW-REQUIRED"
        ]
        assert_equal(
            len(review_required),
            EXPECTED_REVIEW,
            "Review-required queue entries",
        )

        category_summary = []
        for stage in sorted(STAGE_META, key=lambda s: STAGE_META[s]["priority"]):
            rows = [row for row in queue if row["phase1Stage"] == stage]
            category_summary.append(
                {
                    "phase1Stage": stage,
                    "category": STAGE_META[stage]["category"],
                    "title": STAGE_META[stage]["title"],
                    "priority": STAGE_META[stage]["priority"],
                    "count": len(rows),
                    "reviewRequired": sum(
                        row["classification"] == "REVIEW-REQUIRED"
                        for row in rows
                    ),
                    "unresolved": sum(
                        row["classification"] == "UNRESOLVED"
                        for row in rows
                    ),
                }
            )

        output = {
            "schemaVersion": 1,
            "stage": "2.11",
            "status": "planning-only",
            "source": {
                "path": rel(MASTER),
                "sha256": sha256(MASTER),
                "totalDecisionItems": len(items),
            },
            "scope": {
                "reviewRequired": EXPECTED_REVIEW,
                "unresolved": EXPECTED_UNRESOLVED,
                "queueSize": EXPECTED_QUEUE,
                "consensusBaselineExcluded": EXPECTED_CONSENSUS,
                "automaticPromotion": False,
                "profileStatusChange": False,
            },
            "orderingPolicy": [
                "UNRESOLVED first",
                "then Phase 1 review stage priority",
                "then lexical decisionItemId",
            ],
            "categorySummary": category_summary,
            "queue": queue,
        }

        write_json(QUEUE_JSON, output)

        lines = [
            "# Phase 2.11 — Review Queue Planning",
            "",
            "Phase 2.11 converts the unresolved Phase 1 decision surface into a "
            "deterministic, planning-only adjudication queue.",
            "",
            "This stage does not promote rules, does not change the "
            "`fa-ir-g1` profile, and does not manufacture missing evidence.",
            "",
            "## Scope",
            "",
            f"- Master decision items: {len(items)}",
            f"- Consensus baseline excluded: {EXPECTED_CONSENSUS}",
            f"- REVIEW-REQUIRED queued: {EXPECTED_REVIEW}",
            f"- UNRESOLVED queued: {EXPECTED_UNRESOLVED}",
            f"- Total review queue: {EXPECTED_QUEUE}",
            "",
            "## Category plan",
            "",
            "| Priority | Phase 1 stage | Category | REVIEW-REQUIRED | UNRESOLVED | Total |",
            "|---:|---|---|---:|---:|---:|",
        ]

        for row in category_summary:
            lines.append(
                f"| {row['priority']} | {row['phase1Stage']} | "
                f"{row['title']} | {row['reviewRequired']} | "
                f"{row['unresolved']} | {row['count']} |"
            )

        lines += [
            "",
            "## Adjudication contract",
            "",
            "Every queue entry begins as `pending-adjudication`.",
            "",
            "A future adjudication stage must record a recommended disposition, "
            "a maintainer decision, a decision rationale, and whether the "
            "decision has become promotion-eligible.",
            "",
            "No queue entry is promotion-eligible merely because it appears in "
            "this planning artifact.",
            "",
            "## Queue",
            "",
            "| Queue ID | Decision | Classification | Stage | Category | Priority |",
            "|---|---|---|---|---|---:|",
        ]

        for row in queue:
            lines.append(
                f"| `{row['queueId']}` | `{row['decisionItemId']}` | "
                f"{row['classification']} | {row['phase1Stage']} | "
                f"{row['category']} | {row['priority']} |"
            )

        lines += [
            "",
            "## Safety boundary",
            "",
            "The 37 already-promoted consensus-baseline decisions are excluded "
            "from this queue.",
            "",
            "The `fa-ir-g1` profile remains `draft` until the remaining review "
            "surface has been adjudicated and separately validated.",
        ]

        write_text(QUEUE_MD, "\n".join(lines))

        print("Phase 2.11 review queue built.")
        print(f"Master decisions          : {len(items)}")
        print(f"Consensus excluded        : {EXPECTED_CONSENSUS}")
        print(f"REVIEW-REQUIRED queued    : {len(review_required)}")
        print(f"UNRESOLVED queued         : {len(unresolved)}")
        print(f"Total queue               : {len(queue)}")
        print("")
        for row in category_summary:
            print(
                f"{row['phase1Stage']} {row['title']:<24} "
                f": {row['count']}"
            )
        print("")
        print(f"Queue JSON SHA-256        : {sha256(QUEUE_JSON)}")
        print(f"Queue Markdown SHA-256    : {sha256(QUEUE_MD)}")
        return 0

    except QueueError as exc:
        print("Phase 2.11 review queue: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
