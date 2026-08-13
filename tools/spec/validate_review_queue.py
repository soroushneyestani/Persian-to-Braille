from __future__ import annotations

from collections import Counter
from pathlib import Path
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
QUEUE = ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

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
    "1.3": ("orthographic-variants", 1),
    "1.4": ("numbers-punctuation", 2),
    "1.5": ("mixed-latin", 3),
    "1.6": ("whitespace-layout", 4),
    "1.7": ("remaining-coverage", 5),
}


class ValidationFailure(RuntimeError):
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
        raise ValidationFailure(f"missing file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise ValidationFailure(
            f"invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def fail(message: str) -> None:
    raise ValidationFailure(message)


def expect(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def classification(item: dict) -> str:
    value = item.get("classification")
    expect(isinstance(value, str), f"decision {item.get('id')} lacks classification")
    return value


def normalize_stage(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if text in STAGE_META:
        return text
    match = re.search(r"(?:phase\s*)?1[.\-_ ]([234567])", text, re.I)
    if match:
        return f"1.{match.group(1)}"
    return None


def infer_stage(item: dict) -> str:
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

    if decision_id.startswith("FA-VAR-"):
        return "1.3"
    if decision_id.startswith(("FA-DIGIT-", "FA-NUM-", "FA-PUNC-", "FA-CTX-")):
        return "1.4"
    if decision_id.startswith(("FA-LATIN-", "FA-MODE-", "FA-MIXED-")):
        return "1.5"
    if decision_id.startswith(
        ("FA-WS-", "FA-SPACE-", "FA-WHITESPACE-", "FA-LAYOUT-")
    ):
        return "1.6"

    if classification(item) in {"REVIEW-REQUIRED", "UNRESOLVED"}:
        return "1.7"

    fail(f"unable to infer Phase 1 stage for {decision_id}")


def main() -> int:
    try:
        master = read_json(MASTER)
        queue_doc = read_json(QUEUE)
        profile = read_json(PROFILE)

        items = master.get("items")
        expect(isinstance(items, list), "master matrix items must be an array")
        expect_equal(len(items), EXPECTED_TOTAL, "master decision count")

        master_by_id = {item.get("id"): item for item in items}
        expect_equal(len(master_by_id), len(items), "master decision IDs must be unique")

        master_counts = Counter(classification(item) for item in items)
        expect_equal(
            master_counts.get("CONSENSUS-CANDIDATE", 0),
            EXPECTED_CONSENSUS,
            "master consensus count",
        )
        expect_equal(
            master_counts.get("REVIEW-REQUIRED", 0),
            EXPECTED_REVIEW,
            "master review-required count",
        )
        expect_equal(
            master_counts.get("UNRESOLVED", 0),
            EXPECTED_UNRESOLVED,
            "master unresolved count",
        )

        expect_equal(queue_doc.get("schemaVersion"), 1, "queue schema version")
        expect_equal(queue_doc.get("stage"), "2.11", "queue stage")
        expect_equal(queue_doc.get("status"), "planning-only", "queue status")

        source = queue_doc.get("source", {})
        expect_equal(source.get("path"), rel(MASTER), "queue source path")
        expect_equal(source.get("sha256"), sha256(MASTER), "queue source SHA-256")
        expect_equal(
            source.get("totalDecisionItems"),
            EXPECTED_TOTAL,
            "queue source decision count",
        )

        scope = queue_doc.get("scope", {})
        expect_equal(scope.get("reviewRequired"), EXPECTED_REVIEW, "scope review count")
        expect_equal(scope.get("unresolved"), EXPECTED_UNRESOLVED, "scope unresolved count")
        expect_equal(scope.get("queueSize"), EXPECTED_QUEUE, "scope queue size")
        expect_equal(
            scope.get("consensusBaselineExcluded"),
            EXPECTED_CONSENSUS,
            "scope consensus exclusion",
        )
        expect_equal(scope.get("automaticPromotion"), False, "automatic promotion")
        expect_equal(scope.get("profileStatusChange"), False, "profile status change")

        expect_equal(profile.get("status"), "draft", "fa-ir-g1 profile must remain draft")

        queue = queue_doc.get("queue")
        expect(isinstance(queue, list), "queue must be an array")
        expect_equal(len(queue), EXPECTED_QUEUE, "review queue size")

        expected_ids = [
            item["id"]
            for item in items
            if classification(item) in {"REVIEW-REQUIRED", "UNRESOLVED"}
        ]
        expected_id_set = set(expected_ids)

        actual_decision_ids = [row.get("decisionItemId") for row in queue]
        expect_equal(
            len(set(actual_decision_ids)),
            EXPECTED_QUEUE,
            "queue decision IDs must be unique",
        )
        expect_equal(
            set(actual_decision_ids),
            expected_id_set,
            "queue decision set must exactly match unresolved/review-required master decisions",
        )

        stage_counts = Counter()
        unresolved_count = 0
        review_count = 0

        computed_order = []

        for index, row in enumerate(queue, start=1):
            expected_queue_id = f"FA-REVIEW-{index:03d}"
            expect_equal(row.get("queueId"), expected_queue_id, "sequential queue ID")

            decision_id = row.get("decisionItemId")
            expect(decision_id in master_by_id, f"unknown queued decision {decision_id}")
            master_item = master_by_id[decision_id]

            expected_class = classification(master_item)
            expect_equal(row.get("classification"), expected_class, f"classification {decision_id}")

            expected_stage = infer_stage(master_item)
            expect_equal(row.get("phase1Stage"), expected_stage, f"stage {decision_id}")

            expected_category, stage_priority = STAGE_META[expected_stage]
            expect_equal(row.get("category"), expected_category, f"category {decision_id}")

            expected_priority = 0 if expected_class == "UNRESOLVED" else stage_priority
            expect_equal(row.get("priority"), expected_priority, f"priority {decision_id}")

            expect_equal(
                row.get("status"),
                "pending-adjudication",
                f"queue status {decision_id}",
            )

            adjudication = row.get("adjudication")
            expect(isinstance(adjudication, dict), f"adjudication object {decision_id}")
            expect_equal(
                adjudication.get("recommendedDisposition"),
                None,
                f"recommended disposition {decision_id}",
            )
            expect_equal(
                adjudication.get("maintainerDecision"),
                None,
                f"maintainer decision {decision_id}",
            )
            expect_equal(
                adjudication.get("decisionRationale"),
                None,
                f"decision rationale {decision_id}",
            )
            expect_equal(
                adjudication.get("promotionEligible"),
                False,
                f"promotion eligibility {decision_id}",
            )

            stage_counts[expected_stage] += 1
            if expected_class == "UNRESOLVED":
                unresolved_count += 1
            else:
                review_count += 1

            computed_order.append(
                (
                    0 if expected_class == "UNRESOLVED" else 1,
                    stage_priority,
                    decision_id,
                )
            )

        expect_equal(dict(sorted(stage_counts.items())), EXPECTED_STAGE_COUNTS, "stage counts")
        expect_equal(unresolved_count, EXPECTED_UNRESOLVED, "queued unresolved count")
        expect_equal(review_count, EXPECTED_REVIEW, "queued review-required count")

        expect_equal(
            computed_order,
            sorted(computed_order),
            "queue ordering policy",
        )

        unresolved_rows = [
            row for row in queue if row.get("classification") == "UNRESOLVED"
        ]
        expect_equal(len(unresolved_rows), 1, "single unresolved queue row")
        expect_equal(
            unresolved_rows[0].get("decisionItemId"),
            "FA-VAR-013",
            "known unresolved decision",
        )
        expect_equal(
            queue[0].get("decisionItemId"),
            "FA-VAR-013",
            "unresolved decision must be first",
        )

        summary = queue_doc.get("categorySummary")
        expect(isinstance(summary, list), "categorySummary must be an array")
        expect_equal(len(summary), 5, "category summary size")

        by_stage = {row.get("phase1Stage"): row for row in summary}
        expect_equal(set(by_stage), set(EXPECTED_STAGE_COUNTS), "category summary stages")

        for stage, expected_count in EXPECTED_STAGE_COUNTS.items():
            row = by_stage[stage]
            category, priority = STAGE_META[stage]
            expect_equal(row.get("category"), category, f"summary category {stage}")
            expect_equal(row.get("priority"), priority, f"summary priority {stage}")
            expect_equal(row.get("count"), expected_count, f"summary count {stage}")

        print("Phase 2.11 review queue validation: PASS")
        print(f"masterDecisionItems             : {len(items)}")
        print(f"queueItems                      : {len(queue)}")
        print(f"reviewRequired                  : {review_count}")
        print(f"unresolved                      : {unresolved_count}")
        print(f"consensusExcluded               : {EXPECTED_CONSENSUS}")
        print(f"profileStatus                   : {profile['status']}")
        print(f"automaticPromotion              : {scope['automaticPromotion']}")
        print(f"promotionEligibleQueueItems     : 0")
        print(f"semanticErrors                  : 0")
        return 0

    except ValidationFailure as exc:
        print("Phase 2.11 review queue validation: FAIL")
        print(f"semanticErrors                  : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
