from __future__ import annotations

from collections import Counter
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]

QUEUE = ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json"
PACKET_MANIFEST = (
    ROOT / "spec" / "fa-ir" / "review" / "evidence-packets" / "manifest.json"
)
PACKET_DIR = (
    ROOT / "spec" / "fa-ir" / "review" / "evidence-packets" / "records"
)
PLAN = (
    ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
)
PROMOTION_POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

EXPECTED_ITEMS = 253
EXPECTED_REVIEW_REQUIRED = 252
EXPECTED_UNRESOLVED = 1
EXPECTED_TRACK_COUNTS = {
    "unresolved": 1,
    "evidence-gap": 27,
    "implementation-conflict": 75,
    "implementation-alignment": 150,
}
EXPECTED_RELATIONSHIPS = {
    "different-observed-behavior": 75,
    "insufficient-data": 27,
    "same-observed-behavior": 151,
}
EXPECTED_CATEGORIES = {
    "mixed-latin": 56,
    "numbers-punctuation": 57,
    "orthographic-variants": 27,
    "remaining-coverage": 86,
    "whitespace-layout": 27,
}
EXPECTED_SIGNAL_COUNTS = {
    "dot78Signal": 80,
    "formatOrLayoutSignal": 39,
    "hasSupplementalEvidence": 18,
    "legacyEvidenceObserved": 114,
    "manualEvidenceObserved": 192,
    "mixedLatinSignal": 56,
    "researchAudit2053Observed": 180,
}

TRACK_PRIORITIES = {
    "unresolved": 0,
    "evidence-gap": 1,
    "implementation-conflict": 2,
    "implementation-alignment": 3,
}

EXPECTED_DISPOSITIONS = {
    "accept-rule",
    "accept-normalization",
    "accept-context-rule",
    "accept-mode-rule",
    "accept-layout-policy",
    "ignore-format-control",
    "explicitly-unsupported",
    "out-of-scope",
    "defer-pending-evidence",
}


class ValidationFailure(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def fail(message: str) -> None:
    raise ValidationFailure(message)


def expect(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


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


def contains_dot78(value) -> bool:
    if isinstance(value, dict):
        if value.get("usesDot7Or8") is True:
            return True
        for key, child in value.items():
            if key == "dots":
                if isinstance(child, str) and ("7" in child or "8" in child):
                    return True
                if isinstance(child, list):
                    if any("7" in str(cell) or "8" in str(cell) for cell in child):
                        return True
            if contains_dot78(child):
                return True
        return False
    if isinstance(value, list):
        return any(contains_dot78(child) for child in value)
    return False


def expected_track(packet: dict) -> str:
    classification = packet.get("classification")
    relationship = packet.get("stableDraftComparison", {}).get("relationship")

    if classification == "UNRESOLVED":
        return "unresolved"
    if relationship == "insufficient-data":
        return "evidence-gap"
    if relationship == "different-observed-behavior":
        return "implementation-conflict"
    if relationship == "same-observed-behavior":
        return "implementation-alignment"

    fail(
        f"unsupported track inputs for {packet.get('decisionItemId')}: "
        f"classification={classification!r}, relationship={relationship!r}"
    )


def expected_signals(packet: dict) -> dict:
    channels = packet.get("evidenceChannels", {})
    presence = channels.get("presence", {})
    supplemental = packet.get("supplementalStageEvidenceRecords", [])

    return {
        "stableDraftRelationship": (
            packet.get("stableDraftComparison", {}).get("relationship")
        ),
        "sourceCount": len(packet.get("sourceIds", [])),
        "observedEvidenceChannels": list(channels.get("observed", [])),
        "missingEvidenceChannels": list(channels.get("notObserved", [])),
        "manualEvidenceObserved": bool(presence.get("iranianManual")),
        "legacyEvidenceObserved": bool(presence.get("legacyV1")),
        "unicodeEvidenceObserved": bool(presence.get("unicodeBraille")),
        "researchAudit2053Observed": bool(presence.get("researchAudit2053")),
        "supplementalEvidenceRecords": len(supplemental),
        "dot78Signal": (
            contains_dot78(packet.get("stageEvidenceRecord"))
            or contains_dot78(supplemental)
            or contains_dot78(packet.get("masterDecision"))
        ),
        "formatOrLayoutSignal": (
            packet.get("decisionItemId", "").startswith(("FA-FMT-", "FA-WS-"))
            or packet.get("category") == "whitespace-layout"
        ),
        "mixedLatinSignal": packet.get("category") == "mixed-latin",
    }


def main() -> int:
    try:
        queue_doc = read_json(QUEUE)
        packet_manifest = read_json(PACKET_MANIFEST)
        plan = read_json(PLAN)
        policy = read_json(PROMOTION_POLICY)
        profile = read_json(PROFILE)

        expect_equal(plan.get("schemaVersion"), 1, "plan schemaVersion")
        expect_equal(plan.get("stage"), "2.13", "plan stage")
        expect_equal(plan.get("status"), "planning-only", "plan status")
        expect_equal(profile.get("status"), "draft", "fa-ir-g1 profile status")

        policy_version = policy.get("version") or policy.get("policyVersion")
        expect(isinstance(policy_version, str) and policy_version, "promotion policy version")

        expected_inputs = {
            "reviewQueue": {
                "path": rel(QUEUE),
                "sha256": sha256(QUEUE),
            },
            "evidencePacketManifest": {
                "path": rel(PACKET_MANIFEST),
                "sha256": sha256(PACKET_MANIFEST),
            },
            "normativePromotionPolicy": {
                "path": rel(PROMOTION_POLICY),
                "sha256": sha256(PROMOTION_POLICY),
                "version": policy_version,
            },
        }
        expect_equal(plan.get("inputs"), expected_inputs, "plan inputs")

        expect_equal(
            plan.get("profile"),
            {
                "id": profile["id"],
                "version": profile["version"],
                "status": profile["status"],
            },
            "plan profile",
        )

        constraints = plan.get("governanceConstraints", {})
        required_false = [
            "automaticAdjudication",
            "automaticPromotion",
            "planningCreatesPromotionEligibility",
            "reviewRequiredEligibleUnderCurrentPromotionPolicy",
            "unresolvedEligibleUnderCurrentPromotionPolicy",
            "phase213ModifiesPromotionPolicy",
            "phase213ModifiesProfile",
            "officialIranianStandardClaim",
        ]
        for key in required_false:
            expect_equal(constraints.get(key), False, f"governance constraint {key}")

        disposition_rows = plan.get("dispositionVocabulary")
        expect(isinstance(disposition_rows, list), "dispositionVocabulary must be an array")
        disposition_ids = {row.get("id") for row in disposition_rows}
        expect_equal(disposition_ids, EXPECTED_DISPOSITIONS, "disposition vocabulary")
        expect_equal(len(disposition_rows), len(EXPECTED_DISPOSITIONS), "disposition count")
        for row in disposition_rows:
            expect(
                isinstance(row.get("description"), str) and row["description"].strip(),
                f"disposition description {row.get('id')}",
            )

        queue = queue_doc.get("queue")
        expect(isinstance(queue, list), "review queue must be an array")
        expect_equal(len(queue), EXPECTED_ITEMS, "review queue size")
        queue_by_id = {row["queueId"]: row for row in queue}
        expect_equal(len(queue_by_id), EXPECTED_ITEMS, "unique queue IDs")

        manifest_entries = packet_manifest.get("packets")
        expect(isinstance(manifest_entries, list), "packet manifest packets must be an array")
        expect_equal(len(manifest_entries), EXPECTED_ITEMS, "packet manifest count")
        manifest_by_queue = {row["queueId"]: row for row in manifest_entries}
        expect_equal(set(manifest_by_queue), set(queue_by_id), "manifest / queue coverage")

        items = plan.get("items")
        expect(isinstance(items, list), "plan items must be an array")
        expect_equal(len(items), EXPECTED_ITEMS, "plan item count")

        plan_by_queue = {}
        track_counts = Counter()
        relationship_counts = Counter()
        category_counts = Counter()
        signal_counts = Counter()
        class_counts = Counter()

        sort_keys = []

        for item in items:
            queue_id = item.get("queueId")
            expect(queue_id in queue_by_id, f"unknown queueId in plan: {queue_id}")
            expect(queue_id not in plan_by_queue, f"duplicate plan queueId: {queue_id}")
            plan_by_queue[queue_id] = item

            queue_row = queue_by_id[queue_id]
            manifest_row = manifest_by_queue[queue_id]
            packet_path = ROOT / manifest_row["path"]
            expect(packet_path.is_file(), f"missing packet {rel(packet_path)}")
            expect_equal(
                sha256(packet_path),
                manifest_row["sha256"],
                f"packet manifest hash {queue_row['decisionItemId']}",
            )

            packet = read_json(packet_path)
            decision_id = queue_row["decisionItemId"]

            expect_equal(item.get("decisionItemId"), decision_id, f"decision ID {queue_id}")
            expect_equal(item.get("packetId"), packet["packetId"], f"packet ID {decision_id}")
            expect_equal(item.get("classification"), packet["classification"], f"classification {decision_id}")
            expect_equal(item.get("phase1Stage"), packet["phase1Stage"], f"phase1Stage {decision_id}")
            expect_equal(item.get("category"), packet["category"], f"category {decision_id}")

            expected_item_id = queue_id.replace("FA-REVIEW-", "FA-ADJ-PLAN-")
            expect_equal(item.get("adjudicationItemId"), expected_item_id, f"adjudication item ID {decision_id}")

            track = expected_track(packet)
            expect_equal(item.get("track"), track, f"track {decision_id}")
            expect_equal(item.get("trackPriority"), TRACK_PRIORITIES[track], f"track priority {decision_id}")

            signals = expected_signals(packet)
            expect_equal(item.get("reviewSignals"), signals, f"review signals {decision_id}")

            expect_equal(
                item.get("evidencePacket"),
                {
                    "path": rel(packet_path),
                    "sha256": sha256(packet_path),
                },
                f"packet provenance {decision_id}",
            )
            expect_equal(
                item.get("status"),
                "planned-for-adjudication",
                f"plan item status {decision_id}",
            )

            adjudication = item.get("adjudication", {})
            expect_equal(adjudication.get("selectedDisposition"), None, f"selected disposition {decision_id}")
            expect_equal(adjudication.get("maintainerDecision"), None, f"maintainer decision {decision_id}")
            expect_equal(adjudication.get("decisionRationale"), None, f"decision rationale {decision_id}")
            expect_equal(adjudication.get("promotionEligible"), False, f"promotion eligibility {decision_id}")

            class_counts[item["classification"]] += 1
            track_counts[track] += 1
            relationship_counts[signals["stableDraftRelationship"]] += 1
            category_counts[item["category"]] += 1

            for flag in (
                "manualEvidenceObserved",
                "legacyEvidenceObserved",
                "unicodeEvidenceObserved",
                "researchAudit2053Observed",
                "dot78Signal",
                "formatOrLayoutSignal",
                "mixedLatinSignal",
            ):
                if signals[flag]:
                    signal_counts[flag] += 1

            if signals["supplementalEvidenceRecords"]:
                signal_counts["hasSupplementalEvidence"] += 1

            sort_keys.append(
                (
                    TRACK_PRIORITIES[track],
                    0 if signals["dot78Signal"] else 1,
                    item["phase1Stage"],
                    decision_id,
                )
            )

        expect_equal(set(plan_by_queue), set(queue_by_id), "plan / queue coverage")
        expect_equal(class_counts["REVIEW-REQUIRED"], EXPECTED_REVIEW_REQUIRED, "review-required items")
        expect_equal(class_counts["UNRESOLVED"], EXPECTED_UNRESOLVED, "unresolved items")
        expect_equal(dict(track_counts), EXPECTED_TRACK_COUNTS, "track counts")
        expect_equal(dict(relationship_counts), EXPECTED_RELATIONSHIPS, "relationship counts")
        expect_equal(dict(category_counts), EXPECTED_CATEGORIES, "category counts")
        expect_equal(dict(signal_counts), EXPECTED_SIGNAL_COUNTS, "review signal counts")
        expect_equal(sort_keys, sorted(sort_keys), "plan item ordering")

        summary = plan.get("summary", {})
        expect_equal(summary.get("plannedItems"), EXPECTED_ITEMS, "summary planned items")
        expect_equal(summary.get("reviewRequired"), EXPECTED_REVIEW_REQUIRED, "summary review-required")
        expect_equal(summary.get("unresolved"), EXPECTED_UNRESOLVED, "summary unresolved")
        expect_equal(summary.get("batches"), 4, "summary batches")
        expect_equal(summary.get("promotionEligible"), 0, "summary promotionEligible")
        expect_equal(summary.get("maintainerDecisions"), 0, "summary maintainer decisions")
        expect_equal(summary.get("trackCounts"), EXPECTED_TRACK_COUNTS, "summary track counts")
        expect_equal(summary.get("stableDraftRelationships"), EXPECTED_RELATIONSHIPS, "summary relationships")
        expect_equal(summary.get("categories"), EXPECTED_CATEGORIES, "summary categories")
        expect_equal(summary.get("reviewSignalCounts"), EXPECTED_SIGNAL_COUNTS, "summary review signals")

        batches = plan.get("batches")
        expect(isinstance(batches, list), "batches must be an array")
        expect_equal(len(batches), 4, "batch count")

        expected_batch_ids = [
            "FA-ADJ-BATCH-00",
            "FA-ADJ-BATCH-01",
            "FA-ADJ-BATCH-02",
            "FA-ADJ-BATCH-03",
        ]
        expect_equal([row.get("batchId") for row in batches], expected_batch_ids, "batch IDs")

        item_ids_by_track = {
            track: [
                item["decisionItemId"]
                for item in items
                if item["track"] == track
            ]
            for track in TRACK_PRIORITIES
        }

        for batch in batches:
            track = batch.get("track")
            expect(track in TRACK_PRIORITIES, f"unknown batch track {track}")
            expect_equal(batch.get("priority"), TRACK_PRIORITIES[track], f"batch priority {track}")
            expect_equal(batch.get("itemCount"), EXPECTED_TRACK_COUNTS[track], f"batch item count {track}")
            expect_equal(
                batch.get("decisionItemIds"),
                item_ids_by_track[track],
                f"batch decision IDs {track}",
            )
            expect_equal(batch.get("automaticAdjudication"), False, f"batch automatic adjudication {track}")
            expect_equal(batch.get("promotionEligibleByPlanning"), False, f"batch promotion eligibility {track}")
            expect(
                isinstance(batch.get("reason"), str) and batch["reason"].strip(),
                f"batch reason {track}",
            )

        unresolved = [
            item for item in items if item["classification"] == "UNRESOLVED"
        ]
        expect_equal(len(unresolved), 1, "single unresolved item")
        expect_equal(unresolved[0]["decisionItemId"], "FA-VAR-013", "known unresolved decision")
        expect_equal(unresolved[0]["track"], "unresolved", "unresolved track")

        print("Phase 2.13 evidence adjudication plan validation: PASS")
        print(f"plannedItems                    : {len(items)}")
        print(f"reviewRequired                  : {class_counts['REVIEW-REQUIRED']}")
        print(f"unresolved                      : {class_counts['UNRESOLVED']}")
        print(f"batches                         : {len(batches)}")
        print(f"unresolvedTrack                 : {track_counts['unresolved']}")
        print(f"evidenceGapTrack                : {track_counts['evidence-gap']}")
        print(f"implementationConflictTrack     : {track_counts['implementation-conflict']}")
        print(f"implementationAlignmentTrack    : {track_counts['implementation-alignment']}")
        print("promotionEligible               : 0")
        print("maintainerDecisions             : 0")
        print(f"profileStatus                    : {profile['status']}")
        print(f"promotionPolicyVersion           : {policy_version}")
        print("semanticErrors                   : 0")
        return 0

    except ValidationFailure as exc:
        print("Phase 2.13 evidence adjudication plan validation: FAIL")
        print("semanticErrors                   : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
