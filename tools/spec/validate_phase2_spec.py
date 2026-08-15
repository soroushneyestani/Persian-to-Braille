from __future__ import annotations

from pathlib import Path
from collections import Counter
import hashlib
import json
import re
import sys

try:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import SchemaError, ValidationError
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: jsonschema\n"
        "Install it with:\n"
        '  py -3 -m pip install "jsonschema>=4.20,<5"\n'
    ) from exc


ROOT = Path(__file__).resolve().parents[2]

REGISTRY = ROOT / "spec" / "sources" / "registry.json"
MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"

RULE_SCHEMA_PATH = ROOT / "spec" / "fa-ir" / "schema" / "rule.schema.json"
PROFILE_SCHEMA_PATH = ROOT / "spec" / "fa-ir" / "schema" / "profile.schema.json"
CONF_SCHEMA_PATH = ROOT / "spec" / "fa-ir" / "schema" / "conformance.schema.json"

PROFILE_PATH = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
MANIFEST_PATH = (
    ROOT / "spec" / "fa-ir" / "manifests" / "fa-ir-g1-materialization.json"
)
PROMOTION_DIR = ROOT / "spec" / "fa-ir" / "promotions"

ADMISSION_PATH = (
    ROOT / "spec" / "fa-ir" / "adjudications"
    / "candidate-admission-manifest.json"
)
ADJUDICATION_RECORD_DIR = (
    ROOT / "spec" / "fa-ir" / "adjudications" / "records"
)

RELEASE_CORRECTION_DIR = (
    ROOT / "spec" / "fa-ir" / "governance" / "release-corrections"
)

RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "records"

REPORT_DIR = ROOT / "spec" / "fa-ir" / "validation"
REPORT_JSON = REPORT_DIR / "phase-2.2-validation.json"
REPORT_MD = ROOT / "docs" / "specification" / "phase-2.3-validation.md"

EXPECTED_PROFILE = "fa-ir-g1"
EXPECTED_PROFILE_VERSION = "0.1.0"
EXPECTED_RULE_COUNT = 176
EXPECTED_VECTOR_COUNT = 176
EXPECTED_DECISION_COUNT = 176
EXPECTED_MANIFEST_STAGE = "2.14"
EXPECTED_NORMATIVE_RULES = 37
EXPECTED_CANDIDATE_RULES = 139
EXPECTED_ACTIVE_VECTORS = 37
EXPECTED_DRAFT_VECTORS = 139
EXPECTED_STRUCTURAL_RULES = 29
EXPECTED_CONSENSUS_DECISIONS = 37
EXPECTED_ADJUDICATED_DECISIONS = 138
EXPECTED_RELEASE_CORRECTIONS = 1
EXPECTED_CANDIDATE_TYPES = {
    "character": 98,
    "context": 6,
    "layout": 27,
    "mode": 5,
    "normalization": 1,
    "sequence": 1,
}


def candidate_rule_id(decision_id: str) -> str:
    if decision_id.startswith("FA-LATIN-MODE-"):
        return "FA-G1-LATIN-MODE-" + decision_id.rsplit("-", 1)[1]
    if decision_id.startswith("FA-LATIN-"):
        return "FA-G1-LATIN-" + decision_id.rsplit("-", 1)[1]

    match = re.fullmatch(
        r"FA-DIGIT-(ASCII|PERSIAN|ARABIC-INDIC)-([0-9])",
        decision_id,
    )
    if match:
        family, digit = match.groups()
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

    fail(f"No deterministic candidate rule ID mapping for {decision_id}")


def candidate_vector_id(rule_id: str) -> str:
    return "FA-CONF-" + rule_id.removeprefix("FA-G1-")


class SpecValidationError(RuntimeError):
    pass


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SpecValidationError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise SpecValidationError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


def fail(message: str) -> None:
    raise SpecValidationError(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def code_points(text: str) -> list[str]:
    return [f"U+{ord(ch):04X}" for ch in text]


def canonical_cell(cell: str) -> bool:
    if cell == "0":
        return True
    if not re.fullmatch(r"[1-8]{1,8}", cell):
        return False
    if len(set(cell)) != len(cell):
        return False
    return list(cell) == sorted(cell, key=int)


def braille_char(cell: str) -> str:
    if cell == "0":
        return chr(0x2800)

    if not canonical_cell(cell):
        fail(f"Non-canonical Braille cell: {cell!r}")

    bits = 0
    for digit in cell:
        bits |= 1 << (int(digit) - 1)
    return chr(0x2800 + bits)


def unicode_braille(cells: list[str]) -> str:
    return "".join(braille_char(cell) for cell in cells)


def schema_validate(schema_path: Path, schema: dict, instance_path: Path, instance) -> None:
    try:
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema).validate(instance)
    except SchemaError as exc:
        fail(f"Invalid JSON Schema {rel(schema_path)}: {exc.message}")
    except ValidationError as exc:
        location = "/".join(str(part) for part in exc.absolute_path)
        suffix = f" at {location}" if location else ""
        fail(
            f"Schema validation failed for {rel(instance_path)}{suffix}: "
            f"{exc.message}"
        )


def match_signature(rule: dict) -> tuple:
    input_obj = rule["input"]
    return (
        rule["profile"],
        rule["type"],
        input_obj["kind"],
        input_obj.get("text"),
        input_obj.get("before"),
        input_obj.get("after"),
        input_obj.get("tokenClass"),
    )


def context_signature(input_obj: dict) -> tuple:
    return (
        input_obj.get("before"),
        input_obj.get("after"),
        input_obj.get("tokenClass"),
    )


def character_matches_context_class(ch: str, context_class: str) -> bool:
    """
    Conservative lexical check used only for prefix-overlap validation.

    Known context classes are evaluated directly. Unknown classes return True
    so the validator never suppresses a possible collision merely because it
    does not understand a future context vocabulary.
    """
    if context_class == "digit":
        return ch.isdigit()
    if context_class in {"letter", "alpha"}:
        return ch.isalpha()
    if context_class in {"space", "whitespace"}:
        return ch.isspace()
    return True


def prefix_rules_can_overlap(
    shorter_rule: dict,
    shorter_text: str,
    longer_rule: dict,
    longer_text: str,
) -> bool:
    """
    Return True only when the shorter textual trigger can actually match at
    the same start position as the longer trigger.

    A pure text-prefix test is too broad once Phase 2.14 introduces context
    rules. Example: numeric decimal '.' requires after='digit', so it cannot
    match the first cell of the literal ellipsis '...' because the immediately
    following character is another '.', not a digit.
    """
    if not longer_text.startswith(shorter_text):
        return False

    short_input = shorter_rule["input"]
    long_input = longer_rule["input"]

    # Both rules begin at the same position, therefore they observe the same
    # preceding token. Mutually incompatible explicit 'before' constraints
    # cannot overlap.
    short_before = short_input.get("before")
    long_before = long_input.get("before")
    if (
        short_before is not None
        and long_before is not None
        and short_before != long_before
    ):
        return False

    # Because the shorter trigger is a strict prefix of the longer trigger,
    # the shorter rule's immediate right context is already known: it is the
    # next character inside the longer trigger itself.
    short_after = short_input.get("after")
    if short_after is not None:
        next_char = longer_text[len(shorter_text)]
        if not character_matches_context_class(next_char, short_after):
            return False

    # If both rules explicitly declare different token classes, treat them as
    # separate match domains. A missing tokenClass remains unconstrained.
    short_token_class = short_input.get("tokenClass")
    long_token_class = long_input.get("tokenClass")
    if (
        short_token_class is not None
        and long_token_class is not None
        and short_token_class != long_token_class
    ):
        return False

    return True


def load_release_corrections() -> dict[str, dict]:
    result: dict[str, dict] = {}
    if not RELEASE_CORRECTION_DIR.exists():
        return result

    for path in sorted(RELEASE_CORRECTION_DIR.glob("*.json")):
        correction = read_json(path)
        decision = correction.get("maintainerDecision", {})
        if decision.get("decision") != "admit-candidate-direct-character-rule":
            continue

        if (
            correction.get("stage") != "11-release-correction"
            or decision.get("ruleStatus") != "candidate"
            or decision.get("normativePromotion") is not False
            or correction.get("materialization", {}).get("promotionEligible") is not False
        ):
            fail(f"Invalid release-correction governance record: {path.name}")

        rule_id = correction.get("materialization", {}).get("ruleId")
        conformance_id = correction.get("materialization", {}).get("conformanceId")
        decision_id = correction.get("subject", {}).get("decisionItemId")
        if not all(isinstance(value, str) and value for value in (
            rule_id,
            conformance_id,
            decision_id,
        )):
            fail(f"Incomplete release-correction materialization: {path.name}")
        if rule_id in result:
            fail(f"Duplicate release-correction rule ID: {rule_id}")

        result[rule_id] = {
            "id": correction["id"],
            "decisionItemId": decision_id,
            "conformanceId": conformance_id,
            "path": rel(path),
            "sha256": sha256(path),
        }

    return result


def validate() -> dict:
    registry = read_json(REGISTRY)
    master = read_json(MASTER)

    rule_schema = read_json(RULE_SCHEMA_PATH)
    profile_schema = read_json(PROFILE_SCHEMA_PATH)
    conf_schema = read_json(CONF_SCHEMA_PATH)

    # Validate the schemas themselves once, independently of the package generator.
    for schema_path, schema in (
        (RULE_SCHEMA_PATH, rule_schema),
        (PROFILE_SCHEMA_PATH, profile_schema),
        (CONF_SCHEMA_PATH, conf_schema),
    ):
        try:
            Draft202012Validator.check_schema(schema)
        except SchemaError as exc:
            fail(f"Invalid JSON Schema {rel(schema_path)}: {exc.message}")

    profile = read_json(PROFILE_PATH)
    manifest = read_json(MANIFEST_PATH)
    admission = read_json(ADMISSION_PATH) if ADMISSION_PATH.exists() else None

    promotion_paths = (
        sorted(PROMOTION_DIR.glob("*.json"))
        if PROMOTION_DIR.exists()
        else []
    )
    promotions = [read_json(path) for path in promotion_paths]
    promotion_keys = {
        (row.get("ruleId"), row.get("ruleVersion"))
        for row in promotions
    }

    rule_paths = sorted(RULE_DIR.glob("*.json"))
    vector_paths = sorted(CONF_DIR.glob("*.json"))

    assert_equal(len(rule_paths), EXPECTED_RULE_COUNT, "Candidate rule file count")
    assert_equal(
        len(vector_paths), EXPECTED_VECTOR_COUNT, "Conformance vector file count"
    )

    rules = {path: read_json(path) for path in rule_paths}
    vectors = {path: read_json(path) for path in vector_paths}

    # Formal schema validation.
    schema_validate(PROFILE_SCHEMA_PATH, profile_schema, PROFILE_PATH, profile)
    for path, rule in rules.items():
        schema_validate(RULE_SCHEMA_PATH, rule_schema, path, rule)
    for path, vector in vectors.items():
        schema_validate(CONF_SCHEMA_PATH, conf_schema, path, vector)

    # Identity registries.
    source_ids = {row["id"] for row in registry["sources"]}
    master_items = {row["id"]: row for row in master["items"]}

    rule_by_id = {}
    for path, rule in rules.items():
        rule_id = rule["id"]
        if rule_id in rule_by_id:
            fail(f"Duplicate rule ID: {rule_id}")
        rule_by_id[rule_id] = (path, rule)

    vector_by_id = {}
    for path, vector in vectors.items():
        vector_id = vector["id"]
        if vector_id in vector_by_id:
            fail(f"Duplicate conformance vector ID: {vector_id}")
        vector_by_id[vector_id] = (path, vector)

    assert_equal(
        len(rule_by_id), EXPECTED_RULE_COUNT, "Unique materialized rule count"
    )
    assert_equal(
        len(vector_by_id), EXPECTED_VECTOR_COUNT, "Unique conformance vector count"
    )

    # Profile contract.
    assert_equal(profile["id"], EXPECTED_PROFILE, "Profile ID")
    assert_equal(profile["version"], EXPECTED_PROFILE_VERSION, "Profile version")
    assert_equal(profile["status"], "draft", "Incomplete profile status")
    assert_equal(profile["cellSize"], 6, "fa-ir-g1 cell size")
    assert_equal(profile["direction"], "print-to-braille", "Profile direction")
    assert_equal(
        profile["fallbackPolicy"]["unknownCharacter"],
        "error",
        "Unknown-character fail-closed policy",
    )
    assert_equal(
        profile["fallbackPolicy"]["unknownSequence"],
        "error",
        "Unknown-sequence fail-closed policy",
    )
    assert_equal(
        profile["normalizationPolicy"]["unicodeForm"],
        "none",
        "Phase 2 normalization policy",
    )
    assert_equal(
        profile["evidenceBaseline"]["minimumClassification"],
        "REVIEW-REQUIRED",
        "Combined package evidence baseline",
    )

    profile_rule_ids = profile["ruleIds"]
    assert_equal(
        len(profile_rule_ids), EXPECTED_RULE_COUNT, "Profile rule ID count"
    )
    assert_equal(
        set(profile_rule_ids),
        set(rule_by_id),
        "Profile rule IDs must resolve exactly to materialized rule files",
    )

    # Manifest integrity and exact file coverage.
    assert_equal(manifest["stage"], EXPECTED_MANIFEST_STAGE, "Manifest stage")
    assert_equal(
        manifest["status"],
        "materialized-package",
        "Manifest materialization status",
    )
    assert_equal(manifest["profileNormative"], False, "Draft profile normative flag")
    assert_equal(
        manifest["profile"]["id"], profile["id"], "Manifest profile ID"
    )
    assert_equal(
        manifest["profile"]["version"],
        profile["version"],
        "Manifest profile version",
    )
    assert_equal(
        manifest["profile"]["path"], rel(PROFILE_PATH), "Manifest profile path"
    )
    assert_equal(
        manifest["profile"]["sha256"],
        sha256(PROFILE_PATH),
        "Manifest profile SHA-256",
    )

    manifest_rule_entries = {row["id"]: row for row in manifest["rules"]}
    manifest_vector_entries = {
        row["id"]: row for row in manifest["conformanceVectors"]
    }

    assert_equal(
        set(manifest_rule_entries),
        set(rule_by_id),
        "Manifest rule IDs must match generated rules",
    )
    assert_equal(
        set(manifest_vector_entries),
        set(vector_by_id),
        "Manifest vector IDs must match generated vectors",
    )

    for rule_id, entry in manifest_rule_entries.items():
        path, _ = rule_by_id[rule_id]
        assert_equal(entry["path"], rel(path), f"Manifest rule path {rule_id}")
        assert_equal(
            entry["sha256"], sha256(path), f"Manifest rule hash {rule_id}"
        )
        assert_equal(
            entry["status"],
            rule_by_id[rule_id][1]["status"],
            f"Manifest rule status {rule_id}",
        )

    for vector_id, entry in manifest_vector_entries.items():
        path, _ = vector_by_id[vector_id]
        assert_equal(entry["path"], rel(path), f"Manifest vector path {vector_id}")
        assert_equal(
            entry["sha256"], sha256(path), f"Manifest vector hash {vector_id}"
        )
        assert_equal(
            entry["status"],
            vector_by_id[vector_id][1]["status"],
            f"Manifest vector status {vector_id}",
        )

    summary = manifest["summary"]
    assert_equal(
        summary["decisionItemsConsumed"],
        EXPECTED_DECISION_COUNT,
        "Manifest decision count",
    )
    assert_equal(summary["rules"], EXPECTED_RULE_COUNT, "Manifest rule count")
    assert_equal(
        summary["conformanceVectors"],
        EXPECTED_VECTOR_COUNT,
        "Manifest vector count",
    )
    assert_equal(summary["coreAlphabetRules"], 32, "Manifest core rule count")
    assert_equal(summary["orthographicRules"], 1, "Baseline orthographic count")
    assert_equal(
        summary["punctuationOrNumberRules"],
        4,
        "Baseline punctuation/number count",
    )
    assert_equal(summary["dot78Rules"], 0, "Manifest dot-7/dot-8 count")
    assert_equal(
        summary["phase1ConsensusRules"],
        EXPECTED_CONSENSUS_DECISIONS,
        "Manifest Phase 1 consensus-rule count",
    )
    assert_equal(
        summary["adjudicatedCandidateRules"],
        EXPECTED_ADJUDICATED_DECISIONS,
        "Manifest adjudicated-candidate count",
    )
    assert_equal(
        summary["releaseCorrectionRules"],
        EXPECTED_RELEASE_CORRECTIONS,
        "Manifest release-correction count",
    )
    assert_equal(
        summary["structuralRules"],
        EXPECTED_STRUCTURAL_RULES,
        "Manifest structural-rule count",
    )
    assert_equal(
        summary["candidateTargetTypes"],
        EXPECTED_CANDIDATE_TYPES,
        "Manifest candidate target-type counts",
    )
    assert_equal(
        summary["candidateAdmissionManifest"],
        rel(ADMISSION_PATH),
        "Manifest candidate-admission path",
    )

    candidate_count = sum(
        1 for _, rule in rule_by_id.values() if rule["status"] == "candidate"
    )
    normative_count = sum(
        1 for _, rule in rule_by_id.values() if rule["status"] == "normative"
    )
    active_vector_count = sum(
        1 for _, vector in vector_by_id.values() if vector["status"] == "active"
    )
    draft_vector_count = sum(
        1 for _, vector in vector_by_id.values() if vector["status"] == "draft"
    )

    assert_equal(
        candidate_count,
        EXPECTED_CANDIDATE_RULES,
        "Combined package candidate-rule count",
    )
    assert_equal(
        normative_count,
        EXPECTED_NORMATIVE_RULES,
        "Combined package normative-rule count",
    )
    assert_equal(
        active_vector_count,
        EXPECTED_ACTIVE_VECTORS,
        "Combined package active-vector count",
    )
    assert_equal(
        draft_vector_count,
        EXPECTED_DRAFT_VECTORS,
        "Combined package draft-vector count",
    )

    assert_equal(summary["candidateRules"], candidate_count, "Manifest candidate count")
    assert_equal(summary["normativeRules"], normative_count, "Manifest normative count")
    assert_equal(
        summary["activeConformanceVectors"],
        active_vector_count,
        "Manifest active-vector count",
    )
    assert_equal(
        summary["draftConformanceVectors"],
        draft_vector_count,
        "Manifest draft-vector count",
    )
    assert_equal(
        summary["promotionRecordsApplied"],
        len(promotions),
        "Manifest promotion-record count",
    )

    # Rule-level semantic validation.
    consumed_decisions = []
    consumed_consensus = []
    consumed_adjudicated = []
    consumed_release_corrections = []
    referenced_sources = set()
    exact_signatures = {}
    rule_input_texts = []
    structural_rule_ids = set()
    adjudicated_rule_ids = set()
    release_corrections_by_rule = load_release_corrections()
    assert_equal(
        len(release_corrections_by_rule),
        EXPECTED_RELEASE_CORRECTIONS,
        "Release-correction record count",
    )

    admission_by_decision = {}
    if admission is not None:
        assert_equal(admission["stage"], "2.14", "Admission manifest stage")
        assert_equal(
            admission["status"],
            "route-ready",
            "Admission manifest status",
        )
        assert_equal(
            len(admission["entries"]),
            EXPECTED_ADJUDICATED_DECISIONS,
            "Admission entry count",
        )
        admission_by_decision = {
            row["decisionItemId"]: row
            for row in admission["entries"]
        }
        assert_equal(
            len(admission_by_decision),
            EXPECTED_ADJUDICATED_DECISIONS,
            "Unique admission decision count",
        )

    for rule_id, (path, rule) in rule_by_id.items():
        assert_equal(rule["profile"], profile["id"], f"Rule profile {rule_id}")
        assert_true(
            rule["status"] in {"candidate", "normative"},
            f"Rule {rule_id} has unsupported materialized status {rule['status']!r}",
        )

        promotion_key = (rule_id, rule["version"])
        if rule["status"] == "normative":
            assert_true(
                promotion_key in promotion_keys,
                f"Normative rule {rule_id} has no promotion record",
            )
        else:
            assert_true(
                promotion_key not in promotion_keys,
                f"Candidate rule {rule_id} has an applied promotion record",
            )
        assert_equal(rule["direction"], "forward", f"Rule direction {rule_id}")

        expected_filename = rule_id.lower() + ".json"
        assert_equal(path.name, expected_filename, f"Rule filename {rule_id}")

        input_obj = rule["input"]
        text = input_obj.get("text")
        if text is not None:
            assert_equal(
                input_obj["codePoints"],
                code_points(text),
                f"Rule code points {rule_id}",
            )
            rule_input_texts.append((rule_id, text, rule))

        cells = rule["output"]["cells"]
        for cell in cells:
            assert_true(
                canonical_cell(cell),
                f"Rule {rule_id} contains non-canonical Braille cell {cell!r}",
            )
            if profile["cellSize"] == 6:
                assert_true(
                    not re.search(r"[78]", cell),
                    f"Six-dot profile rule {rule_id} contains dot 7/8: {cell}",
                )

        structural_token = rule["output"].get("structuralToken")
        if cells:
            assert_equal(
                structural_token,
                None,
                f"Cell-emitting rule structural token {rule_id}",
            )
            assert_equal(
                rule["output"]["unicodeBraille"],
                unicode_braille(cells),
                f"Rule Unicode Braille derivation {rule_id}",
            )
        else:
            assert_true(
                isinstance(structural_token, str) and bool(structural_token),
                f"Structural rule {rule_id} has no structural token",
            )
            assert_equal(
                rule["output"]["unicodeBraille"],
                None,
                f"Structural rule Unicode Braille {rule_id}",
            )
            structural_rule_ids.add(rule_id)

        decision_ids = rule["evidence"]["decisionItemIds"]
        source_ids_for_rule = rule["evidence"]["sourceIds"]

        assert_true(decision_ids, f"Rule {rule_id} has no decision provenance")
        assert_true(source_ids_for_rule, f"Rule {rule_id} has no source provenance")

        assert_equal(
            len(decision_ids),
            1,
            f"Rule {rule_id} must consume exactly one decision item",
        )
        for decision_id in decision_ids:
            assert_true(
                decision_id in master_items,
                f"Rule {rule_id} references unknown decision {decision_id}",
            )
            decision = master_items[decision_id]
            classification = decision["classification"]

            if (
                rule["status"] == "candidate"
                and rule_id in release_corrections_by_rule
            ):
                correction = release_corrections_by_rule[rule_id]
                assert_equal(
                    classification,
                    "REVIEW-REQUIRED",
                    f"Release-correction candidate {rule_id} must preserve "
                    f"REVIEW-REQUIRED classification of {decision_id}",
                )
                assert_equal(
                    decision_id,
                    correction["decisionItemId"],
                    f"Release-correction decision provenance {rule_id}",
                )
                assert_equal(
                    rule["conformance"]["vectorIds"],
                    [correction["conformanceId"]],
                    f"Release-correction conformance ID {rule_id}",
                )
                manifest_entry = manifest_rule_entries[rule_id]
                assert_equal(
                    manifest_entry["provenanceType"],
                    "phase-11-release-correction",
                    f"Release-correction manifest provenance {rule_id}",
                )
                assert_equal(
                    manifest_entry["admissionAuthorized"],
                    False,
                    f"Release correction must not claim adjudication admission {rule_id}",
                )
                assert_equal(
                    manifest_entry.get("releaseCorrectionId"),
                    correction["id"],
                    f"Release-correction manifest ID {rule_id}",
                )
                assert_equal(
                    manifest_entry.get("releaseCorrectionPath"),
                    correction["path"],
                    f"Release-correction manifest path {rule_id}",
                )
                assert_equal(
                    manifest_entry.get("releaseCorrectionSha256"),
                    correction["sha256"],
                    f"Release-correction manifest hash {rule_id}",
                )
                consumed_release_corrections.append(decision_id)

            if rule["status"] == "normative":
                assert_equal(
                    classification,
                    "CONSENSUS-CANDIDATE",
                    f"Normative rule {rule_id} consumes ineligible decision "
                    f"{decision_id}",
                )
                consumed_consensus.append(decision_id)
            elif rule_id not in release_corrections_by_rule:
                assert_equal(
                    classification,
                    "REVIEW-REQUIRED",
                    f"Adjudicated candidate {rule_id} must preserve the "
                    f"REVIEW-REQUIRED classification of {decision_id}",
                )
                expected_rule_id = candidate_rule_id(decision_id)
                assert_equal(
                    rule_id,
                    expected_rule_id,
                    f"Deterministic candidate rule ID {decision_id}",
                )
                adjudicated_rule_ids.add(rule_id)
                consumed_adjudicated.append(decision_id)

                manifest_entry = manifest_rule_entries[rule_id]
                assert_equal(
                    manifest_entry["provenanceType"],
                    "phase-2.14-adjudication",
                    f"Candidate provenance type {rule_id}",
                )
                assert_equal(
                    manifest_entry["admissionAuthorized"],
                    True,
                    f"Candidate admission flag {rule_id}",
                )
                assert_equal(
                    manifest_entry["decisionItemId"],
                    decision_id,
                    f"Candidate manifest decision {rule_id}",
                )

                if admission_by_decision:
                    assert_true(
                        decision_id in admission_by_decision,
                        f"Candidate {rule_id} lacks admission entry",
                    )
                    admission_entry = admission_by_decision[decision_id]
                    assert_equal(
                        admission_entry["targetRuleType"],
                        rule["type"],
                        f"Admission/rule type {rule_id}",
                    )
                    assert_equal(
                        admission_entry["targetStatus"],
                        "candidate",
                        f"Admission target status {rule_id}",
                    )
                    assert_equal(
                        admission_entry["promotionEligible"],
                        False,
                        f"Admission promotion eligibility {rule_id}",
                    )
                    assert_equal(
                        admission_entry["normativePromotionAuthorized"],
                        False,
                        f"Admission normative authorization {rule_id}",
                    )
                    assert_equal(
                        manifest_entry["adjudicationRecordId"],
                        admission_entry["adjudicationRecordId"],
                        f"Manifest/admission record ID {rule_id}",
                    )
                    assert_equal(
                        manifest_entry["adjudicationRecordPath"],
                        admission_entry["adjudicationRecordPath"],
                        f"Manifest/admission record path {rule_id}",
                    )
                    assert_equal(
                        manifest_entry["adjudicationRecordSha256"],
                        admission_entry["adjudicationRecordSha256"],
                        f"Manifest/admission record hash {rule_id}",
                    )

                    record_path = ROOT / admission_entry[
                        "adjudicationRecordPath"
                    ]
                    if record_path.exists():
                        assert_equal(
                            sha256(record_path),
                            admission_entry["adjudicationRecordSha256"],
                            f"Adjudication record SHA-256 {rule_id}",
                        )
                        record = read_json(record_path)
                        assert_equal(
                            record["id"],
                            admission_entry["adjudicationRecordId"],
                            f"Adjudication record identity {rule_id}",
                        )
                        assert_equal(
                            record["decisionItemId"],
                            decision_id,
                            f"Adjudication decision identity {rule_id}",
                        )
                        assert_equal(
                            record["decision"]["result"],
                            "approved",
                            f"Adjudication result {rule_id}",
                        )
                        assert_equal(
                            record["materialization"][
                                "createsSpecificationArtifact"
                            ],
                            True,
                            f"Adjudication materialization flag {rule_id}",
                        )
                        assert_equal(
                            record["materialization"]["targetRuleType"],
                            rule["type"],
                            f"Adjudication/rule type {rule_id}",
                        )
                        assert_equal(
                            record["materialization"]["promotionEligible"],
                            False,
                            f"Adjudication promotion eligibility {rule_id}",
                        )
                        assert_equal(
                            set(rule["evidence"]["sourceIds"]),
                            set(record["basis"]["sourceIds"]),
                            f"Rule/adjudication sources {rule_id}",
                        )
                        assert_equal(
                            rule["evidence"]["rationale"],
                            record["rationale"],
                            f"Rule/adjudication rationale {rule_id}",
                        )

            consumed_decisions.append(decision_id)

        if rule["status"] == "normative":
            manifest_entry = manifest_rule_entries[rule_id]
            assert_equal(
                manifest_entry["provenanceType"],
                "phase-1-consensus",
                f"Normative baseline provenance {rule_id}",
            )
            assert_equal(
                manifest_entry["admissionAuthorized"],
                False,
                f"Normative baseline admission flag {rule_id}",
            )

        for source_id in source_ids_for_rule:
            assert_true(
                source_id in source_ids,
                f"Rule {rule_id} references unregistered source {source_id}",
            )
            referenced_sources.add(source_id)

        vector_ids = rule["conformance"]["vectorIds"]
        assert_equal(
            len(vector_ids), 1, f"Rule {rule_id} conformance vector count"
        )
        vector_id = vector_ids[0]
        assert_true(
            vector_id in vector_by_id,
            f"Rule {rule_id} references missing vector {vector_id}",
        )

        if rule["type"] == "context":
            ctx = context_signature(input_obj)
            assert_true(
                any(value is not None for value in ctx),
                f"Context rule {rule_id} has no context constraints",
            )

        sig = match_signature(rule)
        if sig in exact_signatures:
            other_id, other_priority = exact_signatures[sig]
            if other_priority == rule["priority"]:
                fail(
                    "Exact match-signature priority collision: "
                    f"{other_id} and {rule_id} both priority={rule['priority']}"
                )
        else:
            exact_signatures[sig] = (rule_id, rule["priority"])

    unique_decisions = set(consumed_decisions)
    assert_equal(
        len(unique_decisions),
        EXPECTED_DECISION_COUNT,
        "Unique Phase 1 decisions consumed",
    )
    assert_equal(
        len(consumed_decisions),
        EXPECTED_DECISION_COUNT,
        "Each materialized rule must consume exactly one decision",
    )

    assert_equal(
        len(consumed_release_corrections),
        EXPECTED_RELEASE_CORRECTIONS,
        "Release-correction decisions consumed",
    )
    assert_equal(
        set(consumed_release_corrections),
        {
            row["decisionItemId"]
            for row in release_corrections_by_rule.values()
        },
        "Release-correction decision set",
    )

    expected_consensus = {
        row["id"]
        for row in master["items"]
        if row["classification"] == "CONSENSUS-CANDIDATE"
    }
    assert_equal(
        set(consumed_consensus),
        expected_consensus,
        "Normative baseline must consume all 37 Phase 1 consensus decisions",
    )
    assert_equal(
        len(consumed_consensus),
        EXPECTED_CONSENSUS_DECISIONS,
        "Consensus decision consumption count",
    )
    assert_equal(
        len(set(consumed_adjudicated)),
        EXPECTED_ADJUDICATED_DECISIONS,
        "Adjudicated decision consumption count",
    )
    if admission_by_decision:
        assert_equal(
            set(consumed_adjudicated),
            set(admission_by_decision),
            "Candidate package must consume all and only admitted decisions",
        )
    assert_equal(
        len(structural_rule_ids),
        EXPECTED_STRUCTURAL_RULES,
        "Structural rule count",
    )
    assert_equal(
        len(adjudicated_rule_ids),
        EXPECTED_ADJUDICATED_DECISIONS,
        "Adjudicated candidate rule count",
    )

    # Conformance symmetry and expected-output validation.
    for vector_id, (path, vector) in vector_by_id.items():
        assert_equal(
            vector["profile"], profile["id"], f"Vector profile {vector_id}"
        )
        assert_equal(
            vector["profileVersion"],
            profile["version"],
            f"Vector profile version {vector_id}",
        )
        expected_filename = vector_id.lower() + ".json"
        assert_equal(path.name, expected_filename, f"Vector filename {vector_id}")

        assert_equal(
            len(vector["ruleIds"]), 1, f"Vector {vector_id} rule count"
        )
        rule_id = vector["ruleIds"][0]
        assert_true(
            rule_id in rule_by_id,
            f"Vector {vector_id} references missing rule {rule_id}",
        )

        rule = rule_by_id[rule_id][1]
        expected_vector_status = (
            "active" if rule["status"] == "normative" else "draft"
        )
        assert_equal(
            vector["status"],
            expected_vector_status,
            f"Vector lifecycle status {vector_id}",
        )
        assert_equal(
            rule["conformance"]["vectorIds"],
            [vector_id],
            f"Reverse vector reference {vector_id}",
        )

        vector_input = vector["input"]
        assert_equal(
            vector_input["codePoints"],
            code_points(vector_input["text"]),
            f"Vector code points {vector_id}",
        )

        # The vector exercises the same rule trigger/context as the rule record.
        assert_equal(
            vector_input["text"],
            rule["input"].get("text", ""),
            f"Vector/rule input text {vector_id}",
        )
        assert_equal(
            context_signature(vector_input),
            context_signature(rule["input"]),
            f"Vector/rule context signature {vector_id}",
        )

        assert_equal(
            vector["expected"]["cells"],
            rule["output"]["cells"],
            f"Vector/rule Braille cells {vector_id}",
        )
        assert_equal(
            vector["expected"]["unicodeBraille"],
            rule["output"]["unicodeBraille"],
            f"Vector/rule Unicode Braille {vector_id}",
        )
        if vector["expected"]["cells"]:
            assert_equal(
                vector["expected"]["unicodeBraille"],
                unicode_braille(vector["expected"]["cells"]),
                f"Vector Unicode Braille derivation {vector_id}",
            )
            assert_equal(
                vector["expected"].get("structuralTokens", []),
                [],
                f"Cell vector structural tokens {vector_id}",
            )
        else:
            assert_equal(
                vector["expected"]["unicodeBraille"],
                None,
                f"Structural vector Unicode Braille {vector_id}",
            )
            assert_equal(
                vector["expected"].get("structuralTokens", []),
                [rule["output"]["structuralToken"]],
                f"Structural vector token {vector_id}",
            )

    # Priority/prefix overlaps: longer/more-specific inputs must run earlier.
    # This catches the audited * / *** relationship and future analogous cases.
    prefix_pairs = []
    for left_id, left_text, left_rule in rule_input_texts:
        for right_id, right_text, right_rule in rule_input_texts:
            if left_id == right_id:
                continue
            if not left_text or not right_text:
                continue
            if len(left_text) >= len(right_text):
                continue
            if prefix_rules_can_overlap(
                left_rule,
                left_text,
                right_rule,
                right_text,
            ):
                prefix_pairs.append((left_id, right_id))
                assert_true(
                    right_rule["priority"] < left_rule["priority"],
                    "More-specific semantically overlapping prefix rule must "
                    "have higher precedence (lower numeric priority): "
                    f"{right_id}({right_rule['priority']}) vs "
                    f"{left_id}({left_rule['priority']})",
                )

    # Special context invariant from the Phase 1 evidence.
    slash_id = "FA-G1-NUM-FRACTION-SLASH-001"
    assert_true(slash_id in rule_by_id, "Fraction-slash candidate missing")
    slash = rule_by_id[slash_id][1]
    assert_equal(slash["type"], "context", "Fraction-slash rule type")
    assert_equal(slash["input"]["text"], "/", "Fraction-slash input")
    assert_equal(slash["input"].get("before"), "digit", "Fraction-slash left context")
    assert_equal(slash["input"].get("after"), "digit", "Fraction-slash right context")
    assert_equal(
        slash["input"].get("tokenClass"),
        "numeric-fraction-separator",
        "Fraction-slash token class",
    )
    assert_equal(slash["output"]["cells"], ["34"], "Fraction-slash Braille cell")

    # Individual governed rules may be normative, but the incomplete profile
    # remains draft until a separate profile-completeness gate exists.
    assert_true(
        profile["status"] != "normative",
        "Normative profile leaked into incomplete fa-ir-g1 materialization",
    )

    return {
        "schemaVersion": 1,
        "validationStage": "2.3",
        "validatedPackageStage": "2.14",
        "result": "PASS",
        "normative": False,
        "summary": {
            "schemasValidated": 3,
            "profileDocuments": 1,
            "materializedRules": len(rule_by_id),
            "candidateRules": candidate_count,
            "normativeRules": normative_count,
            "conformanceVectors": len(vector_by_id),
            "activeConformanceVectors": active_vector_count,
            "releaseCorrectionRules": len(release_corrections_by_rule),
            "draftConformanceVectors": draft_vector_count,
            "promotionRecordsObserved": len(promotions),
            "uniqueDecisionItemsConsumed": len(unique_decisions),
            "consensusDecisionItemsConsumed": len(set(consumed_consensus)),
            "adjudicatedDecisionItemsConsumed": len(set(consumed_adjudicated)),
            "structuralRules": len(structural_rule_ids),
            "registeredSourcesReferenced": len(referenced_sources),
            "prefixOverlapPairsChecked": len(set(prefix_pairs)),
            "dot78Violations": 0,
            "schemaErrors": 0,
            "semanticErrors": 0,
        },
        "validatedArtifacts": {
            "profile": {
                "path": rel(PROFILE_PATH),
                "sha256": sha256(PROFILE_PATH),
            },
            "manifest": {
                "path": rel(MANIFEST_PATH),
                "sha256": sha256(MANIFEST_PATH),
            },
            "ruleDirectory": rel(RULE_DIR),
            "conformanceDirectory": rel(CONF_DIR),
        },
        "invariants": [
            "All rule/profile/vector documents validate against Draft 2020-12 schemas.",
            "Profile rule IDs resolve exactly to all 176 materialized rule files.",
            "Every rule consumes registered sources and preserves its Phase 1 classification.",
            "All 37 consensus decisions and all 138 admitted REVIEW-REQUIRED decisions are consumed exactly once.",
            "One explicit Phase 11 release correction consumes FA-VAR-001 without rewriting its historical deferred adjudication.",
            "Every rule has exactly one reciprocal conformance vector.",
            "Vector context matches rule context.",
            "Braille cell arrays deterministically derive their Unicode Braille strings.",
            "The fa-ir-g1 draft package contains no dot-7/dot-8 cells.",
            "Exact match-signature priority collisions are rejected.",
            "Semantically overlapping longer prefix rules must have higher precedence.",
            "The fraction-slash candidate is explicitly constrained to numeric context.",
            "Normative rule status requires a matching promotion record; profile remains draft.",
            "All 138 adjudicated materializations remain candidate with draft vectors.",
            "Structural rules use explicit structural tokens and null Unicode Braille output.",
            "Manifest paths and SHA-256 hashes match the generated package.",
        ],
    }


def render_markdown(report: dict) -> str:
    s = report["summary"]
    lines = [
        "# Phase 2.3 — Specification Validation Report",
        "",
        f"Result: **{report['result']}**",
        "",
        "This report is generated by an independent validator over the combined "
        "Phase 2.14 materialized package. It does not reuse the package generator's in-memory "
        "objects.",
        "",
        "## Summary",
        "",
        f"- Schemas validated: {s['schemasValidated']}",
        f"- Materialized rules: {s['materializedRules']}",
        f"- Candidate rules: {s['candidateRules']}",
        f"- Normative rules: {s['normativeRules']}",
        f"- Conformance vectors: {s['conformanceVectors']}",
        f"- Unique decision items consumed: {s['uniqueDecisionItemsConsumed']}",
        f"- Consensus decisions consumed: {s['consensusDecisionItemsConsumed']}",
        f"- Adjudicated decisions consumed: {s['adjudicatedDecisionItemsConsumed']}",
        f"- Draft conformance vectors: {s['draftConformanceVectors']}",
        f"- Structural rules: {s['structuralRules']}",
        f"- Registered sources referenced: {s['registeredSourcesReferenced']}",
        f"- Prefix-overlap pairs checked: {s['prefixOverlapPairsChecked']}",
        f"- Dot-7/dot-8 violations: {s['dot78Violations']}",
        f"- Schema errors: {s['schemaErrors']}",
        f"- Semantic errors: {s['semanticErrors']}",
        "",
        "## Enforced invariants",
        "",
    ]
    for invariant in report["invariants"]:
        lines.append(f"- {invariant}")

    lines += [
        "",
        "## Normative status",
        "",
        "A PASS result means the materialized package is structurally and "
        "semantically self-consistent against the current Phase 2 contracts. "
        "Normative rule status must be backed by promotion records, while the "
        "incomplete `fa-ir-g1` profile remains draft.",
    ]
    return "\n".join(lines)


def main() -> int:
    try:
        report = validate()
    except SpecValidationError as exc:
        print("Phase 2.3 specification validation: FAIL")
        print(str(exc))
        return 1

    write_json(REPORT_JSON, report)
    write_text(REPORT_MD, render_markdown(report))

    print("Phase 2.3 specification validation: PASS")
    for key, value in report["summary"].items():
        print(f"{key:36}: {value}")
    print(f"Validation JSON SHA-256              : {sha256(REPORT_JSON)}")
    print(f"Validation Markdown SHA-256          : {sha256(REPORT_MD)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
