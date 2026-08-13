from __future__ import annotations

from collections import Counter
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]

MANIFEST = ROOT / "spec" / "fa-ir" / "adjudications" / "manifest.json"
RECORD_DIR = ROOT / "spec" / "fa-ir" / "adjudications" / "records"
POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

EXPECTED_SUMMARY = {
    "plannedDecisions": 253,
    "adjudicationRecords": 253,
    "approved": 153,
    "deferred": 100,
    "unadjudicated": 0,
    "promotionEligible": 0,
    "normativeRulesCreated": 0,
}

EXPECTED_DISPOSITIONS = {
    "accept-context-rule": 6,
    "accept-layout-policy": 27,
    "accept-mode-rule": 5,
    "accept-normalization": 1,
    "accept-rule": 100,
    "defer-pending-evidence": 100,
    "explicitly-unsupported": 1,
    "ignore-format-control": 11,
    "out-of-scope": 2,
}

EXPECTED_TRACKS = {
    "implementation-alignment": 176,
    "implementation-conflict": 76,
    "unresolved": 1,
}

EXPECTED_RESULTS_BY_TRACK = {
    "implementation-alignment": {"approved": 79, "deferred": 97},
    "implementation-conflict": {"approved": 73, "deferred": 3},
    "unresolved": {"approved": 1},
}

EXPECTED_ARTIFACT_DECISIONS = 139


class CompletionError(RuntimeError):
    pass


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise CompletionError(f"Missing file: {path.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise CompletionError(
            f"Invalid JSON: {path.relative_to(ROOT)}:"
            f"{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def expect_equal(actual, expected, label: str) -> None:
    if actual != expected:
        raise CompletionError(
            f"{label}: expected={expected!r}, actual={actual!r}"
        )


def main() -> int:
    try:
        manifest = read_json(MANIFEST)
        policy = read_json(POLICY)
        profile = read_json(PROFILE)

        record_paths = sorted(RECORD_DIR.glob("*.json"))
        records = [read_json(path) for path in record_paths]

        expect_equal(manifest["stage"], "2.14", "manifest stage")
        expect_equal(manifest["status"], "execution-complete", "manifest status")
        expect_equal(
            {key: manifest["summary"][key] for key in EXPECTED_SUMMARY},
            EXPECTED_SUMMARY,
            "manifest summary",
        )
        expect_equal(
            manifest["summary"]["dispositionCounts"],
            EXPECTED_DISPOSITIONS,
            "manifest disposition counts",
        )
        expect_equal(len(records), 253, "record file count")

        decision_ids = [record["decisionItemId"] for record in records]
        expect_equal(len(set(decision_ids)), 253, "unique adjudicated decision count")

        results = Counter(record["decision"]["result"] for record in records)
        expect_equal(
            dict(sorted(results.items())),
            {"approved": 153, "deferred": 100},
            "decision result totals",
        )

        dispositions = Counter(record["disposition"] for record in records)
        expect_equal(
            dict(sorted(dispositions.items())),
            EXPECTED_DISPOSITIONS,
            "record disposition totals",
        )

        tracks = Counter(record["track"] for record in records)
        expect_equal(dict(sorted(tracks.items())), EXPECTED_TRACKS, "track totals")

        results_by_track = {}
        for track in EXPECTED_TRACKS:
            counter = Counter(
                record["decision"]["result"]
                for record in records
                if record["track"] == track
            )
            results_by_track[track] = dict(sorted(counter.items()))
        expect_equal(results_by_track, EXPECTED_RESULTS_BY_TRACK, "results by track")

        artifact_records = [
            record
            for record in records
            if record["materialization"]["createsSpecificationArtifact"]
        ]
        future_governance = [
            record
            for record in records
            if record["materialization"]["requiresFuturePromotionGovernance"]
        ]

        expect_equal(
            len(artifact_records),
            EXPECTED_ARTIFACT_DECISIONS,
            "accepted artifact decisions",
        )
        expect_equal(
            len(future_governance),
            EXPECTED_ARTIFACT_DECISIONS,
            "future-promotion-governance decisions",
        )

        expect_equal(
            sum(
                bool(record["materialization"]["promotionEligible"])
                for record in records
            ),
            0,
            "promotion-eligible records",
        )
        expect_equal(
            sum(bool(record["scope"]["projectNormativeRule"]) for record in records),
            0,
            "project-normative records",
        )
        expect_equal(
            sum(
                bool(record["scope"]["officialIranianStandardClaim"])
                for record in records
            ),
            0,
            "official Iranian standard claims",
        )
        expect_equal(
            sum(
                bool(record["scope"]["phase1ClassificationRewritten"])
                for record in records
            ),
            0,
            "Phase 1 classification rewrites",
        )

        expect_equal(
            policy["authority"]["explicitDecisionRequired"],
            True,
            "explicit adjudication authority",
        )
        expect_equal(
            policy["authority"]["automaticAdjudicationAllowed"],
            False,
            "automatic adjudication boundary",
        )
        expect_equal(
            policy["promotionBoundary"]["adjudicationIsNormativePromotion"],
            False,
            "adjudication/promotion separation",
        )
        expect_equal(
            policy["promotionBoundary"]["adjudicationMaySetPromotionEligible"],
            False,
            "promotion eligibility boundary",
        )
        expect_equal(profile["status"], "draft", "fa-ir-g1 profile status")

        print("Phase 2.14 completion validation: PASS")
        print("plannedDecisions                 : 253")
        print("adjudicationRecords              : 253")
        print("approved                         : 153")
        print("deferred                         : 100")
        print("unadjudicated                    : 0")
        print("acceptedArtifactDecisions        : 139")
        print("promotionEligible                : 0")
        print("projectNormativeRules            : 0")
        print("officialIranianStandardClaims    : 0")
        print("profileStatus                    : draft")
        print("completionErrors                 : 0")
        return 0

    except CompletionError as exc:
        print("Phase 2.14 completion validation: FAIL")
        print("completionErrors                 : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
