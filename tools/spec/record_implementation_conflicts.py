from __future__ import annotations

from pathlib import Path
import hashlib
import json

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]

PLAN = ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "adjudication-record.schema.json"
RECORD_DIR = ROOT / "spec" / "fa-ir" / "adjudications" / "records"

EXPECTED_PLAN_SHA256 = (
    "FB5E7AA363EDB25B6CAC9556BFD9636FBAC6F7F5D797EE8D6A9C55E1CC1C6F26"
)
EXPECTED_CONFLICT_COUNT = 76


class RecordError(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RecordError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise RecordError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise RecordError(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        raise RecordError(
            f"{message}: expected={expected!r}, actual={actual!r}"
        )


def record_id(decision_id: str) -> str:
    return f"FA-ADJ-{decision_id.removeprefix('FA-')}-001"


def output_path(decision_id: str) -> Path:
    return RECORD_DIR / f"{record_id(decision_id).lower()}.json"


def artifact_decision(
    disposition: str,
    kind: str,
    target_rule_type: str,
    rationale: str,
) -> dict:
    return {
        "disposition": disposition,
        "result": "approved",
        "materialization": {
            "kind": kind,
            "createsSpecificationArtifact": True,
            "targetRuleType": target_rule_type,
            "promotionEligible": False,
            "requiresFuturePromotionGovernance": True,
        },
        "unresolvedEvidenceGaps": [],
        "rationale": rationale,
    }


def non_artifact_decision(
    disposition: str,
    kind: str,
    rationale: str,
) -> dict:
    return {
        "disposition": disposition,
        "result": "approved",
        "materialization": {
            "kind": kind,
            "createsSpecificationArtifact": False,
            "targetRuleType": None,
            "promotionEligible": False,
            "requiresFuturePromotionGovernance": False,
        },
        "unresolvedEvidenceGaps": [],
        "rationale": rationale,
    }


def deferred_decision(rationale: str, evidence_gap: str) -> dict:
    return {
        "disposition": "defer-pending-evidence",
        "result": "deferred",
        "materialization": {
            "kind": "deferred",
            "createsSpecificationArtifact": False,
            "targetRuleType": None,
            "promotionEligible": False,
            "requiresFuturePromotionGovernance": False,
        },
        "unresolvedEvidenceGaps": [evidence_gap],
        "rationale": rationale,
    }


def build_decisions() -> dict[str, dict]:
    decisions: dict[str, dict] = {}

    latin_rationale = (
        "The preserved Iranian manual evidence reports six-dot uncontracted "
        "English inside a Latin span. The draft Liblouis implementation follows "
        "that model, while the stable implementation encodes Latin letter case "
        "with dot 7 or dot 8. The project accepts the six-dot Latin character "
        "mapping and keeps capitalization/span semantics in the Latin mode layer. "
        "This is a project specification decision, not a claim of current "
        "official Iranian national-standard status."
    )
    for index in range(1, 53):
        decision_id = f"FA-LATIN-{index:03d}"
        decisions[decision_id] = artifact_decision(
            "accept-rule",
            "rule",
            "character",
            latin_rationale,
        )

    mode_rationale = (
        "The preserved Iranian manual evidence reports a six-dot English span, "
        "dot-25 span boundaries, and a dot-6 capital indicator. The draft "
        "Liblouis implementation supplies the corresponding Latin mode machinery, "
        "while the stable implementation lacks it. The project therefore accepts "
        "the draft-style Latin mode architecture, subject to later specification "
        "materialization governance."
    )
    for index in range(1, 5):
        decision_id = f"FA-LATIN-MODE-{index:03d}"
        decisions[decision_id] = artifact_decision(
            "accept-mode-rule",
            "mode-rule",
            "mode",
            mode_rationale,
        )

    format_rationale = (
        "This Unicode bidirectional formatting control carries text-layout or "
        "directional metadata rather than a Persian Braille cell. The stable "
        "implementation leaves it unmapped and the draft implementation explicitly "
        "removes it from Braille output. The project adopts non-emitting format-"
        "control behavior rather than inventing a Braille mapping."
    )
    for index in range(2, 13):
        decision_id = f"FA-FMT-{index:03d}"
        decisions[decision_id] = non_artifact_decision(
            "ignore-format-control",
            "ignore",
            format_rationale,
        )

    decisions["FA-FMT-001"] = artifact_decision(
        "accept-normalization",
        "normalization",
        "normalization",
        (
            "ZERO WIDTH NON-JOINER is an orthographic boundary in Persian text, "
            "not a Braille cell. The stable implementation emits dot 8, while the "
            "draft implementation treats ZWNJ as non-emitting context. The project "
            "accepts a normalization-level policy in which ZWNJ emits no Braille "
            "cell but may be preserved long enough for sequence/context analysis "
            "instead of being blindly discarded before structural processing."
        ),
    )

    decisions["FA-WS-027"] = artifact_decision(
        "accept-layout-policy",
        "layout-policy",
        "layout",
        (
            "At the host/layout layer, ZERO WIDTH NON-JOINER may remain present in "
            "source text as a Persian orthographic boundary, but translation output "
            "must not emit a Braille cell for it. Its structural role may be "
            "consumed by normalization or context processing. This complements the "
            "FA-FMT-001 normalization decision without rewriting Phase 1 evidence."
        ),
    )

    decisions["FA-SEQ-001"] = artifact_decision(
        "accept-rule",
        "rule",
        "sequence",
        (
            "For the Ezafe spelling هٔ, the draft implementation provides the "
            "explicit sequence 125-0-24 and the preserved Iranian manual evidence "
            "reports a separate Yeh for Ezafe. The project accepts a sequence-level "
            "rule rather than inventing an independent standalone U+0654 mapping."
        ),
    )

    decisions["FA-PUNC-013"] = artifact_decision(
        "accept-rule",
        "rule",
        "character",
        (
            "For HORIZONTAL ELLIPSIS, the stable implementation uses 3-3-3 while "
            "the draft implementation uses 6-6-6. The preserved Iranian manual "
            "evidence reports 6-6-6, so the project accepts the draft-aligned "
            "ellipsis mapping."
        ),
    )

    decisions["FA-PUNC-015"] = non_artifact_decision(
        "out-of-scope",
        "out-of-scope",
        (
            "The preserved manual evidence establishes slash dots 34 specifically "
            "for numeric fractions, not an unconditional scalar slash mapping. "
            "Numeric fraction behavior is handled by its context-level decision, "
            "so a general scalar mapping for slash is outside this decision's "
            "normative scope."
        ),
    )

    decisions["FA-PUNC-014"] = non_artifact_decision(
        "out-of-scope",
        "out-of-scope",
        (
            "The preserved manual evidence describes a context-sensitive asterisk "
            "run rule rather than one unconditional scalar mapping. The project "
            "therefore leaves the generic scalar mapping outside this decision's "
            "normative scope and handles the meaningful behavior through the "
            "separate context/run decisions."
        ),
    )

    decisions["FA-PUNC-012"] = deferred_decision(
        (
            "The stable implementation leaves EM DASH unmapped and the draft "
            "implementation proposes 6-36, but the focused preserved manual audit "
            "does not establish this sign. The project defers the scalar mapping "
            "rather than selecting one implementation without sufficient evidence."
        ),
        (
            "No sufficiently authoritative preserved evidence currently establishes "
            "the Persian Braille mapping for EM DASH."
        ),
    )

    decisions["FA-SEQ-003"] = deferred_decision(
        (
            "The draft implementation gives ه‌ی the same explicit Ezafe sequence "
            "shape used for هٔ, but the preserved print-era manual does not directly "
            "define this Unicode spelling. The project defers this spelling-specific "
            "sequence until normalization-equivalence or direct evidence is formally "
            "established."
        ),
        (
            "The preserved print-era manual does not directly establish the Unicode "
            "spelling ه‌ی or its exact normalization relationship for this rule."
        ),
    )

    decisions["FA-VAR-011"] = deferred_decision(
        (
            "The draft implementation maps scalar ۀ to 125-0-24 while the stable "
            "implementation leaves it unmapped. The preserved evidence does not yet "
            "establish this scalar independently, so the project defers it rather "
            "than promoting a draft-only scalar mapping."
        ),
        (
            "The preserved evidence does not yet establish an independent Persian "
            "Braille mapping for scalar ۀ."
        ),
    )

    return decisions


def main() -> int:
    try:
        plan = read_json(PLAN)
        policy = read_json(POLICY)
        schema = read_json(SCHEMA)

        expect_equal(
            sha256(PLAN),
            EXPECTED_PLAN_SHA256,
            "Adjudication plan SHA-256",
        )

        plan_items = {
            item["decisionItemId"]: item
            for item in plan["items"]
        }
        conflict_ids = {
            item["decisionItemId"]
            for item in plan["items"]
            if item["track"] == "implementation-conflict"
        }

        decisions = build_decisions()

        expect_equal(
            len(conflict_ids),
            EXPECTED_CONFLICT_COUNT,
            "Implementation-conflict count",
        )
        expect_equal(
            set(decisions),
            conflict_ids,
            "Explicit approval / implementation-conflict coverage",
        )

        validator = Draft202012Validator(
            schema,
            format_checker=FormatChecker(),
        )

        created = 0
        matched = 0
        disposition_counts: dict[str, int] = {}

        for decision_id in sorted(decisions):
            spec = decisions[decision_id]
            item = plan_items[decision_id]

            expect_equal(
                item["track"],
                "implementation-conflict",
                f"Track {decision_id}",
            )
            expect_equal(
                item["reviewSignals"]["stableDraftRelationship"],
                "different-observed-behavior",
                f"Stable/draft relationship {decision_id}",
            )
            expect_equal(
                item["reviewSignals"]["manualEvidenceObserved"],
                True,
                f"Manual evidence signal {decision_id}",
            )

            packet_path = ROOT / item["evidencePacket"]["path"]
            packet = read_json(packet_path)
            actual_packet_hash = sha256(packet_path)

            expect_equal(
                actual_packet_hash,
                item["evidencePacket"]["sha256"],
                f"Evidence packet SHA-256 {decision_id}",
            )
            expect_equal(
                packet["decisionItemId"],
                decision_id,
                f"Evidence packet decision ID {decision_id}",
            )
            expect_equal(
                packet["stableDraftComparison"]["relationship"],
                "different-observed-behavior",
                f"Evidence relationship {decision_id}",
            )

            record = {
                "schemaVersion": 1,
                "id": record_id(decision_id),
                "policyVersion": policy["policyVersion"],
                "profileId": "fa-ir-g1",
                "decisionItemId": decision_id,
                "queueId": item["queueId"],
                "packetId": item["packetId"],
                "planItemId": item["adjudicationItemId"],
                "phase1Classification": item["classification"],
                "track": item["track"],
                "disposition": spec["disposition"],
                "decision": {
                    "result": spec["result"],
                    "authority": "project-maintainer",
                    "recordedBy": "Soroush Neyestani",
                    "recordedAt": None,
                },
                "basis": {
                    "evidencePacketPath": rel(packet_path),
                    "evidencePacketSha256": actual_packet_hash,
                    "sourceIds": packet["sourceIds"],
                    "stableDraftRelationship": (
                        packet["stableDraftComparison"]["relationship"]
                    ),
                    "unresolvedEvidenceGaps": spec["unresolvedEvidenceGaps"],
                },
                "materialization": spec["materialization"],
                "scope": {
                    "projectSpecificationDecision": True,
                    "projectNormativeRule": False,
                    "officialIranianStandardClaim": False,
                    "phase1ClassificationRewritten": False,
                },
                "rationale": spec["rationale"],
            }

            errors = sorted(
                validator.iter_errors(record),
                key=lambda error: list(error.path),
            )
            if errors:
                first = errors[0]
                location = ".".join(str(part) for part in first.path) or "<root>"
                raise RecordError(
                    f"Schema validation failed for {decision_id} at "
                    f"{location}: {first.message}"
                )

            path = output_path(decision_id)
            if path.exists():
                existing = read_json(path)
                expect_equal(
                    existing,
                    record,
                    f"Existing adjudication record {decision_id}",
                )
                matched += 1
            else:
                write_json(path, record)
                created += 1

            disposition_counts[spec["disposition"]] = (
                disposition_counts.get(spec["disposition"], 0) + 1
            )

        approved = sum(
            1 for spec in decisions.values()
            if spec["result"] == "approved"
        )
        deferred = sum(
            1 for spec in decisions.values()
            if spec["result"] == "deferred"
        )

        print("Phase 2.14 implementation-conflict adjudications recorded.")
        print(f"Plan SHA-256              : {EXPECTED_PLAN_SHA256}")
        print(f"Conflict decisions        : {len(decisions)}")
        print(f"New records               : {created}")
        print(f"Existing exact matches    : {matched}")
        print(f"Approved                  : {approved}")
        print(f"Deferred                  : {deferred}")
        print("Promotion eligible        : 0")
        print("Project normative rules   : 0")
        print("")
        print("Disposition counts:")
        for disposition, count in sorted(disposition_counts.items()):
            print(f"  {disposition:<28}: {count}")
        return 0

    except RecordError as exc:
        print("Phase 2.14 implementation-conflict recording: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
