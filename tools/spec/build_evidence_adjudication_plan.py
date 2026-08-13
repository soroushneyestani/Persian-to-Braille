from __future__ import annotations

from collections import Counter, defaultdict
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
PROMOTION_POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

PLAN = (
    ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
)
DOC = (
    ROOT / "docs" / "specification" / "phase-2.13-evidence-adjudication-plan.md"
)

EXPECTED_ITEMS = 253
EXPECTED_REVIEW_REQUIRED = 252
EXPECTED_UNRESOLVED = 1

TRACKS = {
    "unresolved": {
        "priority": 0,
        "title": "Unresolved decisions",
        "reason": (
            "Phase 1 could not establish a project decision. Evidence must be "
            "examined before any disposition can be proposed."
        ),
    },
    "evidence-gap": {
        "priority": 1,
        "title": "Evidence gaps",
        "reason": (
            "Stable/draft comparison is insufficient to support a review "
            "disposition without additional evidence analysis."
        ),
    },
    "implementation-conflict": {
        "priority": 2,
        "title": "Implementation conflicts",
        "reason": (
            "Observed stable and draft implementations differ and require "
            "explicit adjudication."
        ),
    },
    "implementation-alignment": {
        "priority": 3,
        "title": "Implementation alignment",
        "reason": (
            "Observed stable and draft implementations align, but the Phase 1 "
            "decision remains REVIEW-REQUIRED and therefore still requires "
            "human adjudication."
        ),
    },
}

DISPOSITION_VOCABULARY = [
    {
        "id": "accept-rule",
        "description": "Accept a forward translation rule for project specification.",
    },
    {
        "id": "accept-normalization",
        "description": "Resolve through explicit Unicode/text normalization behavior.",
    },
    {
        "id": "accept-context-rule",
        "description": "Resolve through context-sensitive translation behavior.",
    },
    {
        "id": "accept-mode-rule",
        "description": "Resolve through a translation mode boundary or mode marker rule.",
    },
    {
        "id": "accept-layout-policy",
        "description": "Resolve as project layout/whitespace policy rather than a character rule.",
    },
    {
        "id": "ignore-format-control",
        "description": "Explicitly ignore a format/control scalar in the selected profile.",
    },
    {
        "id": "explicitly-unsupported",
        "description": "Record that the selected profile intentionally does not support the item.",
    },
    {
        "id": "out-of-scope",
        "description": "Record that the item is outside the selected profile/specification scope.",
    },
    {
        "id": "defer-pending-evidence",
        "description": "Keep the item unresolved pending stronger evidence.",
    },
]


class PlanError(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def fail(message: str) -> None:
    raise PlanError(message)


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise PlanError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise PlanError(
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


def contains_dot78(value) -> bool:
    if isinstance(value, dict):
        if value.get("usesDot7Or8") is True:
            return True
        for key, child in value.items():
            if key == "dots":
                if isinstance(child, str) and any(ch in child for ch in "78"):
                    return True
                if isinstance(child, list):
                    for cell in child:
                        text = str(cell)
                        if "7" in text or "8" in text:
                            return True
            if contains_dot78(child):
                return True
        return False

    if isinstance(value, list):
        return any(contains_dot78(child) for child in value)

    return False


def track_for(packet: dict) -> str:
    if packet.get("classification") == "UNRESOLVED":
        return "unresolved"

    relationship = packet.get("stableDraftComparison", {}).get("relationship")

    if relationship == "insufficient-data":
        return "evidence-gap"
    if relationship == "different-observed-behavior":
        return "implementation-conflict"
    if relationship == "same-observed-behavior":
        return "implementation-alignment"

    fail(
        f"Unknown stable/draft relationship for {packet.get('decisionItemId')}: "
        f"{relationship!r}"
    )


def review_signals(packet: dict) -> dict:
    channels = packet.get("evidenceChannels", {})
    presence = channels.get("presence", {})
    supplemental = packet.get("supplementalStageEvidenceRecords", [])

    dot78 = (
        contains_dot78(packet.get("stageEvidenceRecord"))
        or contains_dot78(supplemental)
        or contains_dot78(packet.get("masterDecision"))
    )

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
        "dot78Signal": dot78,
        "formatOrLayoutSignal": (
            packet.get("decisionItemId", "").startswith(("FA-FMT-", "FA-WS-"))
            or packet.get("category") == "whitespace-layout"
        ),
        "mixedLatinSignal": packet.get("category") == "mixed-latin",
    }


def main() -> int:
    try:
        queue_doc = read_json(QUEUE)
        manifest = read_json(PACKET_MANIFEST)
        policy = read_json(PROMOTION_POLICY)
        profile = read_json(PROFILE)

        queue = queue_doc.get("queue")
        assert_true(isinstance(queue, list), "Review queue must be an array")
        assert_equal(len(queue), EXPECTED_ITEMS, "Review queue item count")

        manifest_entries = manifest.get("packets")
        assert_true(
            isinstance(manifest_entries, list),
            "Evidence packet manifest must contain packets",
        )
        assert_equal(
            len(manifest_entries),
            EXPECTED_ITEMS,
            "Evidence packet manifest count",
        )

        assert_equal(profile.get("status"), "draft", "fa-ir-g1 profile status")
        assert_equal(
            manifest.get("status"),
            "evidence-only",
            "Evidence packet manifest status",
        )
        assert_equal(
            manifest.get("summary", {}).get("promotionEligible"),
            0,
            "Evidence packet promotion-eligible count",
        )
        assert_equal(
            manifest.get("summary", {}).get("maintainerDecisionsRecorded"),
            0,
            "Evidence packet maintainer decision count",
        )

        queue_by_id = {row["queueId"]: row for row in queue}
        manifest_by_queue = {row["queueId"]: row for row in manifest_entries}

        assert_equal(
            len(queue_by_id),
            EXPECTED_ITEMS,
            "Unique queue IDs",
        )
        assert_equal(
            set(queue_by_id),
            set(manifest_by_queue),
            "Queue / evidence manifest coverage",
        )

        policy_version = policy.get("version") or policy.get("policyVersion")
        assert_true(
            isinstance(policy_version, str) and policy_version,
            "Normative promotion policy must expose a version",
        )

        plan_items = []
        track_counts = Counter()
        relationship_counts = Counter()
        category_counts = Counter()
        flag_counts = Counter()

        for queue_id in sorted(queue_by_id):
            queue_row = queue_by_id[queue_id]
            manifest_row = manifest_by_queue[queue_id]

            packet_path = ROOT / manifest_row["path"]
            assert_true(packet_path.is_file(), f"Missing packet: {rel(packet_path)}")
            assert_equal(
                sha256(packet_path),
                manifest_row["sha256"],
                f"Evidence packet hash {queue_row['decisionItemId']}",
            )

            packet = read_json(packet_path)

            decision_id = queue_row["decisionItemId"]
            assert_equal(
                packet.get("decisionItemId"),
                decision_id,
                f"Packet decision ID {queue_id}",
            )
            assert_equal(
                packet.get("classification"),
                queue_row["classification"],
                f"Packet classification {decision_id}",
            )
            assert_equal(
                packet.get("review", {}).get("promotionEligible"),
                False,
                f"Packet promotion eligibility {decision_id}",
            )
            assert_equal(
                packet.get("review", {}).get("maintainerDecision"),
                None,
                f"Packet maintainer decision {decision_id}",
            )

            track = track_for(packet)
            signals = review_signals(packet)
            track_meta = TRACKS[track]

            item = {
                "adjudicationItemId": queue_id.replace(
                    "FA-REVIEW-",
                    "FA-ADJ-PLAN-",
                ),
                "queueId": queue_id,
                "packetId": packet["packetId"],
                "decisionItemId": decision_id,
                "classification": packet["classification"],
                "phase1Stage": packet["phase1Stage"],
                "category": packet["category"],
                "track": track,
                "trackPriority": track_meta["priority"],
                "reviewSignals": signals,
                "evidencePacket": {
                    "path": rel(packet_path),
                    "sha256": sha256(packet_path),
                },
                "status": "planned-for-adjudication",
                "adjudication": {
                    "selectedDisposition": None,
                    "maintainerDecision": None,
                    "decisionRationale": None,
                    "promotionEligible": False,
                },
            }

            plan_items.append(item)
            track_counts[track] += 1
            relationship_counts[signals["stableDraftRelationship"]] += 1
            category_counts[packet["category"]] += 1

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
                    flag_counts[flag] += 1

            if signals["supplementalEvidenceRecords"]:
                flag_counts["hasSupplementalEvidence"] += 1

        class_counts = Counter(item["classification"] for item in plan_items)
        assert_equal(
            class_counts["REVIEW-REQUIRED"],
            EXPECTED_REVIEW_REQUIRED,
            "Planned REVIEW-REQUIRED count",
        )
        assert_equal(
            class_counts["UNRESOLVED"],
            EXPECTED_UNRESOLVED,
            "Planned UNRESOLVED count",
        )

        # Sort by adjudication track, dot7/8 escalation, original queue priority,
        # Phase 1 stage, then decision ID. This changes planning order only.
        plan_items.sort(
            key=lambda item: (
                item["trackPriority"],
                0 if item["reviewSignals"]["dot78Signal"] else 1,
                item["phase1Stage"],
                item["decisionItemId"],
            )
        )

        batches = []
        grouped: dict[str, list[dict]] = defaultdict(list)
        for item in plan_items:
            grouped[item["track"]].append(item)

        for track in sorted(TRACKS, key=lambda key: TRACKS[key]["priority"]):
            rows = grouped.get(track, [])
            if not rows:
                continue

            batches.append(
                {
                    "batchId": f"FA-ADJ-BATCH-{TRACKS[track]['priority']:02d}",
                    "track": track,
                    "title": TRACKS[track]["title"],
                    "priority": TRACKS[track]["priority"],
                    "reason": TRACKS[track]["reason"],
                    "itemCount": len(rows),
                    "decisionItemIds": [row["decisionItemId"] for row in rows],
                    "automaticAdjudication": False,
                    "promotionEligibleByPlanning": False,
                }
            )

        plan = {
            "schemaVersion": 1,
            "stage": "2.13",
            "status": "planning-only",
            "profile": {
                "id": profile["id"],
                "version": profile["version"],
                "status": profile["status"],
            },
            "inputs": {
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
            },
            "governanceConstraints": {
                "automaticAdjudication": False,
                "automaticPromotion": False,
                "planningCreatesPromotionEligibility": False,
                "reviewRequiredEligibleUnderCurrentPromotionPolicy": False,
                "unresolvedEligibleUnderCurrentPromotionPolicy": False,
                "phase213ModifiesPromotionPolicy": False,
                "phase213ModifiesProfile": False,
                "officialIranianStandardClaim": False,
                "note": (
                    "An approved future adjudication does not itself satisfy "
                    "the current normative-promotion policy. A later governance "
                    "stage must define any adjudication-based eligibility route "
                    "without rewriting Phase 1 historical classifications."
                ),
            },
            "dispositionVocabulary": DISPOSITION_VOCABULARY,
            "summary": {
                "plannedItems": len(plan_items),
                "reviewRequired": class_counts["REVIEW-REQUIRED"],
                "unresolved": class_counts["UNRESOLVED"],
                "batches": len(batches),
                "promotionEligible": 0,
                "maintainerDecisions": 0,
                "trackCounts": dict(
                    sorted(
                        track_counts.items(),
                        key=lambda pair: TRACKS[pair[0]]["priority"],
                    )
                ),
                "stableDraftRelationships": dict(
                    sorted(relationship_counts.items())
                ),
                "categories": dict(sorted(category_counts.items())),
                "reviewSignalCounts": dict(sorted(flag_counts.items())),
            },
            "batches": batches,
            "items": plan_items,
        }

        write_json(PLAN, plan)

        lines = [
            "# Phase 2.13 — Evidence Adjudication Planning",
            "",
            "Phase 2.13 converts the 253 deterministic Phase 2.12 evidence "
            "packets into an ordered human-adjudication plan.",
            "",
            "This stage does not adjudicate decisions, does not modify the "
            "promotion policy, does not promote rules, and does not change "
            "the `fa-ir-g1` profile.",
            "",
            "## Summary",
            "",
            f"- Planned adjudication items: {len(plan_items)}",
            f"- REVIEW-REQUIRED: {class_counts['REVIEW-REQUIRED']}",
            f"- UNRESOLVED: {class_counts['UNRESOLVED']}",
            f"- Adjudication batches: {len(batches)}",
            "- Promotion-eligible items created by planning: 0",
            "- Maintainer decisions recorded: 0",
            f"- Profile status: `{profile['status']}`",
            f"- Current promotion-policy version: `{policy_version}`",
            "",
            "## Adjudication tracks",
            "",
            "| Priority | Track | Items | Purpose |",
            "|---:|---|---:|---|",
        ]

        for batch in batches:
            lines.append(
                f"| {batch['priority']} | `{batch['track']}` | "
                f"{batch['itemCount']} | {batch['reason']} |"
            )

        lines += [
            "",
            "## Stable/draft evidence relationships",
            "",
        ]

        for relationship, count in sorted(relationship_counts.items()):
            lines.append(f"- `{relationship}`: {count}")

        lines += [
            "",
            "## Review signals",
            "",
        ]

        for flag, count in sorted(flag_counts.items()):
            lines.append(f"- `{flag}`: {count}")

        lines += [
            "",
            "## Candidate disposition vocabulary",
            "",
            "The vocabulary below defines possible future adjudication outcomes. "
            "No outcome is selected in Phase 2.13.",
            "",
        ]

        for disposition in DISPOSITION_VOCABULARY:
            lines.append(
                f"- `{disposition['id']}` — {disposition['description']}"
            )

        lines += [
            "",
            "## Governance boundary",
            "",
            "Phase 1 classifications remain historical evidence and are not "
            "rewritten by adjudication planning.",
            "",
            "Under the current promotion policy, REVIEW-REQUIRED and UNRESOLVED "
            "items do not become promotion-eligible merely because a future "
            "adjudication approves a disposition. Any adjudication-based "
            "promotion route requires a separate governance stage.",
            "",
            "The project continues to make no claim that these decisions are "
            "the current official Iranian national Braille standard.",
            "",
            "## Planned items",
            "",
            "| Plan item | Decision | Track | Stage | Category | Dot7/8 |",
            "|---|---|---|---|---|---|",
        ]

        for item in plan_items:
            lines.append(
                f"| `{item['adjudicationItemId']}` | "
                f"`{item['decisionItemId']}` | `{item['track']}` | "
                f"{item['phase1Stage']} | {item['category']} | "
                f"{'yes' if item['reviewSignals']['dot78Signal'] else 'no'} |"
            )

        write_text(DOC, "\n".join(lines))

        print("Phase 2.13 evidence adjudication plan built.")
        print(f"Planned items             : {len(plan_items)}")
        print(f"REVIEW-REQUIRED           : {class_counts['REVIEW-REQUIRED']}")
        print(f"UNRESOLVED                : {class_counts['UNRESOLVED']}")
        print(f"Batches                    : {len(batches)}")
        print("Promotion eligible        : 0")
        print("Maintainer decisions      : 0")
        print(f"Profile                   : {profile['id']} ({profile['status']})")
        print(f"Promotion policy          : {policy_version}")
        print("")
        print("Track counts:")
        for batch in batches:
            print(
                f"  {batch['priority']} {batch['track']:<28}: "
                f"{batch['itemCount']}"
            )
        print("")
        print("Stable/draft relationships:")
        for relationship, count in sorted(relationship_counts.items()):
            print(f"  {relationship:<30}: {count}")
        print("")
        print("Review signals:")
        for flag, count in sorted(flag_counts.items()):
            print(f"  {flag:<30}: {count}")
        print("")
        print(f"Plan SHA-256              : {sha256(PLAN)}")
        print(f"Documentation SHA-256     : {sha256(DOC)}")
        return 0

    except PlanError as exc:
        print("Phase 2.13 evidence adjudication planning: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
