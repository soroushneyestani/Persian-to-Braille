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
    ROOT / "spec" / "fa-ir" / "manifests" / "phase-2.2-candidate-package.json"
)

RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "candidates"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "candidates"

REPORT_DIR = ROOT / "spec" / "fa-ir" / "validation"
REPORT_JSON = REPORT_DIR / "phase-2.2-validation.json"
REPORT_MD = ROOT / "docs" / "specification" / "phase-2.3-validation.md"

EXPECTED_PROFILE = "fa-ir-g1"
EXPECTED_PROFILE_VERSION = "0.1.0"
EXPECTED_RULE_COUNT = 37
EXPECTED_VECTOR_COUNT = 37
EXPECTED_DECISION_COUNT = 37
EXPECTED_MANIFEST_STAGE = "2.2"


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
        len(rule_by_id), EXPECTED_RULE_COUNT, "Unique candidate rule count"
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
        "Phase 2.2 normalization policy",
    )

    profile_rule_ids = profile["ruleIds"]
    assert_equal(
        len(profile_rule_ids), EXPECTED_RULE_COUNT, "Profile rule ID count"
    )
    assert_equal(
        set(profile_rule_ids),
        set(rule_by_id),
        "Profile rule IDs must resolve exactly to candidate rule files",
    )

    # Manifest integrity and exact file coverage.
    assert_equal(manifest["stage"], EXPECTED_MANIFEST_STAGE, "Manifest stage")
    assert_equal(manifest["normative"], False, "Candidate package normative flag")
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

    for vector_id, entry in manifest_vector_entries.items():
        path, _ = vector_by_id[vector_id]
        assert_equal(entry["path"], rel(path), f"Manifest vector path {vector_id}")
        assert_equal(
            entry["sha256"], sha256(path), f"Manifest vector hash {vector_id}"
        )

    summary = manifest["summary"]
    assert_equal(summary["decisionItemsConsumed"], 37, "Manifest decision count")
    assert_equal(summary["rules"], 37, "Manifest rule count")
    assert_equal(summary["conformanceVectors"], 37, "Manifest vector count")
    assert_equal(summary["coreAlphabetRules"], 32, "Manifest core rule count")
    assert_equal(summary["orthographicRules"], 1, "Manifest orthographic count")
    assert_equal(
        summary["punctuationOrNumberRules"], 4, "Manifest punctuation/number count"
    )
    assert_equal(summary["dot78Rules"], 0, "Manifest dot-7/dot-8 count")

    # Rule-level semantic validation.
    consumed_decisions = []
    referenced_sources = set()
    exact_signatures = {}
    rule_input_texts = []

    for rule_id, (path, rule) in rule_by_id.items():
        assert_equal(rule["profile"], profile["id"], f"Rule profile {rule_id}")
        assert_equal(rule["status"], "candidate", f"Rule status {rule_id}")
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

        assert_equal(
            rule["output"]["unicodeBraille"],
            unicode_braille(cells),
            f"Rule Unicode Braille derivation {rule_id}",
        )

        decision_ids = rule["evidence"]["decisionItemIds"]
        source_ids_for_rule = rule["evidence"]["sourceIds"]

        assert_true(decision_ids, f"Rule {rule_id} has no decision provenance")
        assert_true(source_ids_for_rule, f"Rule {rule_id} has no source provenance")

        for decision_id in decision_ids:
            assert_true(
                decision_id in master_items,
                f"Rule {rule_id} references unknown decision {decision_id}",
            )
            decision = master_items[decision_id]
            assert_equal(
                decision["classification"],
                "CONSENSUS-CANDIDATE",
                f"Rule {rule_id} consumes non-consensus decision {decision_id}",
            )
            consumed_decisions.append(decision_id)

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
        "Each candidate decision must be consumed exactly once",
    )

    expected_consensus = {
        row["id"]
        for row in master["items"]
        if row["classification"] == "CONSENSUS-CANDIDATE"
    }
    assert_equal(
        unique_decisions,
        expected_consensus,
        "Candidate package must consume all and only Phase 1 consensus decisions",
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
        assert_equal(vector["status"], "draft", f"Vector status {vector_id}")

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
            rule["input"]["text"],
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
        assert_equal(
            vector["expected"]["unicodeBraille"],
            unicode_braille(vector["expected"]["cells"]),
            f"Vector Unicode Braille derivation {vector_id}",
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
            if right_text.startswith(left_text):
                prefix_pairs.append((left_id, right_id))
                assert_true(
                    right_rule["priority"] < left_rule["priority"],
                    "More-specific prefix-overlapping rule must have higher "
                    f"precedence (lower numeric priority): "
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

    # No generated candidate may claim normative status.
    assert_true(
        all(rule["status"] != "normative" for rule in rules.values()),
        "Normative rule leaked into Phase 2.2 candidate package",
    )
    assert_true(
        profile["status"] != "normative",
        "Normative profile leaked into incomplete Phase 2.2 package",
    )

    return {
        "schemaVersion": 1,
        "validationStage": "2.3",
        "validatedPackageStage": "2.2",
        "result": "PASS",
        "normative": False,
        "summary": {
            "schemasValidated": 3,
            "profileDocuments": 1,
            "candidateRules": len(rule_by_id),
            "conformanceVectors": len(vector_by_id),
            "uniqueDecisionItemsConsumed": len(unique_decisions),
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
            "Profile rule IDs resolve exactly to the 37 candidate rule files.",
            "Every rule consumes registered sources and Phase 1 CONSENSUS-CANDIDATE evidence.",
            "All 37 Phase 1 consensus decisions are consumed exactly once.",
            "Every rule has exactly one reciprocal conformance vector.",
            "Vector context matches rule context.",
            "Braille cell arrays deterministically derive their Unicode Braille strings.",
            "The fa-ir-g1 draft package contains no dot-7/dot-8 cells.",
            "Exact match-signature priority collisions are rejected.",
            "Prefix-overlapping longer rules must have higher precedence.",
            "The fraction-slash candidate is explicitly constrained to numeric context.",
            "No Phase 2.2 artifact claims normative status.",
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
        "This report is generated by an independent validator over the Phase 2.2 "
        "candidate package. It does not reuse the package generator's in-memory "
        "objects.",
        "",
        "## Summary",
        "",
        f"- Schemas validated: {s['schemasValidated']}",
        f"- Candidate rules: {s['candidateRules']}",
        f"- Conformance vectors: {s['conformanceVectors']}",
        f"- Unique Phase 1 consensus decisions consumed: "
        f"{s['uniqueDecisionItemsConsumed']}",
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
        "A PASS result means the candidate package is structurally and "
        "semantically self-consistent against the current Phase 2 contracts. "
        "It does **not** promote any candidate rule or the draft profile to "
        "normative status.",
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
