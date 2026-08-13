from __future__ import annotations

from pathlib import Path
from collections import Counter
import hashlib
import json
import re
import shutil

try:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import SchemaError, ValidationError
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: jsonschema\n"
        "Install it with:\n"
        "  py -3 -m pip install -r requirements-spec.txt\n"
    ) from exc

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
NUMPUNC = ROOT / "spec" / "fa-ir" / "evidence" / "numbers-punctuation.json"

RULE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "rule.schema.json"
PROFILE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "profile.schema.json"
CONFORMANCE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "conformance.schema.json"
PROMOTION_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "promotion-record.schema.json"
PROMOTION_POLICY = ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
PROMOTION_DIR = ROOT / "spec" / "fa-ir" / "promotions"

ADMISSION_FILE = (
    ROOT / "spec" / "fa-ir" / "adjudications"
    / "candidate-admission-manifest.json"
)
ADJUDICATION_RECORD_DIR = (
    ROOT / "spec" / "fa-ir" / "adjudications" / "records"
)

RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "records"

LEGACY_RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "candidates"
LEGACY_CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "candidates"
PROFILE_DIR = ROOT / "spec" / "fa-ir" / "profiles"
MANIFEST_DIR = ROOT / "spec" / "fa-ir" / "manifests"
DOCS_DIR = ROOT / "docs" / "specification"

PROFILE_FILE = PROFILE_DIR / "fa-ir-g1.json"
MANIFEST_FILE = MANIFEST_DIR / "fa-ir-g1-materialization.json"
LEGACY_MANIFEST_FILE = MANIFEST_DIR / "phase-2.2-candidate-package.json"
DOC_FILE = DOCS_DIR / "phase-2.7-promotion-aware-materialization.md"
COMBINED_DOC_FILE = (
    DOCS_DIR / "phase-2.14-adjudicated-candidate-materialization.md"
)

PROFILE_ID = "fa-ir-g1"
PROFILE_VERSION = "0.1.0"
ARTIFACT_VERSION = "0.1.0"
SCHEMA_VERSION = 1

CONSENSUS = "CONSENSUS-CANDIDATE"

CORE_RULE_IDS = {
    f"FA-CORE-{index:03d}": f"FA-G1-LETTER-{index:03d}"
    for index in range(1, 33)
}

SPECIAL_RULE_IDS = {
    "FA-VAR-010": "FA-G1-ORTHO-SUPERSCRIPT-ALEF-001",
    "FA-CTX-001": "FA-G1-PUNC-ELLIPSIS-001",
    "FA-CTX-002": "FA-G1-NUM-FRACTION-SLASH-001",
    "FA-CTX-003": "FA-G1-PUNC-ASTERISK-SINGLE-001",
    "FA-CTX-004": "FA-G1-PUNC-ASTERISK-RUN-001",
}

DECISION_TO_RULE_ID = {**CORE_RULE_IDS, **SPECIAL_RULE_IDS}

CONF_IDS = {
    rule_id: "FA-CONF-" + rule_id.removeprefix("FA-G1-")
    for rule_id in DECISION_TO_RULE_ID.values()
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def code_points(text: str) -> list[str]:
    return [f"U+{ord(ch):04X}" for ch in text]


def split_dots(dots: str) -> list[str]:
    if not dots:
        raise RuntimeError("Empty Braille dot pattern")
    return dots.split("-")


def braille_char(cell: str) -> str:
    if cell == "0":
        return chr(0x2800)

    if not re.fullmatch(r"[1-8]{1,8}", cell):
        raise RuntimeError(f"Invalid Braille cell: {cell!r}")

    if len(set(cell)) != len(cell):
        raise RuntimeError(f"Duplicate Braille dot in cell: {cell!r}")

    value = 0
    for digit in cell:
        value |= 1 << (int(digit) - 1)
    return chr(0x2800 + value)


def unicode_braille(cells: list[str]) -> str:
    return "".join(braille_char(cell) for cell in cells)


def safe_file_id(rule_id: str) -> str:
    return rule_id.lower() + ".json"


def base_rule(
    *,
    rule_id: str,
    rule_type: str,
    input_kind: str,
    text: str,
    cells: list[str],
    decision_item,
    vector_id: str,
    priority: int = 1000,
    before: str | None = None,
    after: str | None = None,
    token_class: str | None = None,
    rationale_suffix: str = "",
):
    input_obj = {
        "kind": input_kind,
        "text": text,
        "codePoints": code_points(text),
    }
    if before is not None:
        input_obj["before"] = before
    if after is not None:
        input_obj["after"] = after
    if token_class is not None:
        input_obj["tokenClass"] = token_class

    rationale = decision_item["reason"]
    if rationale_suffix:
        rationale += " " + rationale_suffix

    return {
        "schemaVersion": SCHEMA_VERSION,
        "id": rule_id,
        "profile": PROFILE_ID,
        "type": rule_type,
        "status": "candidate",
        "version": ARTIFACT_VERSION,
        "direction": "forward",
        "priority": priority,
        "input": input_obj,
        "output": {
            "cells": cells,
            "unicodeBraille": unicode_braille(cells),
            "structuralToken": None,
        },
        "normalization": {
            "form": "none",
            "canonicalInput": text,
            "notes": (
                "Phase 2.2 does not promote unresolved global Unicode "
                "normalization policy."
            ),
        },
        "evidence": {
            "decisionItemIds": [decision_item["id"]],
            "sourceIds": list(dict.fromkeys(decision_item["evidence"])),
            "rationale": rationale,
            "conflictsResolved": [],
        },
        "conformance": {
            "vectorIds": [vector_id],
        },
        "notes": [
            "Generated from a Phase 1 CONSENSUS-CANDIDATE decision.",
            "Materialized lifecycle status is controlled by promotion records.",
        ],
    }


def conformance_vector(
    *,
    vector_id: str,
    rule_id: str,
    text: str,
    cells: list[str],
    before: str | None = None,
    after: str | None = None,
    token_class: str | None = None,
    tags: list[str] | None = None,
):
    input_obj = {
        "text": text,
        "codePoints": code_points(text),
    }
    if before is not None:
        input_obj["before"] = before
    if after is not None:
        input_obj["after"] = after
    if token_class is not None:
        input_obj["tokenClass"] = token_class

    return {
        "schemaVersion": SCHEMA_VERSION,
        "id": vector_id,
        "status": "draft",
        "version": ARTIFACT_VERSION,
        "profile": PROFILE_ID,
        "profileVersion": PROFILE_VERSION,
        "ruleIds": [rule_id],
        "input": input_obj,
        "expected": {
            "cells": cells,
            "unicodeBraille": unicode_braille(cells),
            "structuralTokens": [],
        },
        "tags": tags or [],
        "notes": [
            "Materialized conformance vector for the fa-ir-g1 rule record."
        ],
    }


CANDIDATE_RULE_TYPE_COUNTS = {
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

    raise RuntimeError(
        f"No deterministic candidate rule ID mapping for {decision_id}"
    )


def candidate_vector_id(rule_id: str) -> str:
    return "FA-CONF-" + rule_id.removeprefix("FA-G1-")


def candidate_text(stage: dict) -> str | None:
    for key in ("character", "char", "text", "token", "input"):
        value = stage.get(key)
        if isinstance(value, str) and value:
            return value
    return None


def candidate_cells(decision_id: str, packet: dict) -> list[str] | None:
    comparison = packet["stableDraftComparison"]
    stable = comparison.get("stable")
    draft = comparison.get("draft")

    if decision_id.startswith("FA-LATIN-"):
        if decision_id.startswith("FA-LATIN-MODE-"):
            return None
        if not isinstance(draft, dict):
            return None
        dots = draft.get("dots")
        return split_dots(dots) if isinstance(dots, str) and dots else None

    if decision_id.startswith("FA-DIGIT-"):
        if not isinstance(stable, dict):
            return None
        dots = stable.get("dots")
        return split_dots(dots) if isinstance(dots, str) and dots else None

    if decision_id == "FA-PUNC-013":
        if not isinstance(draft, dict):
            return None
        dots = draft.get("dots")
        return split_dots(dots) if isinstance(dots, str) and dots else None

    if decision_id.startswith("FA-PUNC-"):
        if not isinstance(stable, dict):
            return None
        dots = stable.get("dots")
        return split_dots(dots) if isinstance(dots, str) and dots else None

    if decision_id == "FA-SEQ-001":
        if not isinstance(draft, dict):
            return None
        dots = draft.get("dots")
        return split_dots(dots) if isinstance(dots, str) and dots else None

    if decision_id.startswith("FA-NUMRULE-"):
        if not isinstance(stable, dict):
            return None
        dots = stable.get("dots")
        return split_dots(dots) if isinstance(dots, str) and dots else None

    return None


def structural_token_for(
    decision_id: str,
    stage: dict,
) -> str | None:
    if decision_id == "FA-FMT-001":
        return "normalization:zwnj-orthographic-boundary"

    if decision_id == "FA-LATIN-MODE-001":
        return "mode:latin-character-class"

    if decision_id.startswith("FA-WS-"):
        code_point = stage.get("codePoint")
        if not isinstance(code_point, str):
            cps = stage.get("codePoints")
            if isinstance(cps, list) and cps:
                code_point = cps[0]
        if not isinstance(code_point, str):
            text = candidate_text(stage)
            if text is not None:
                code_point = code_points(text)[0]
            else:
                raise RuntimeError(
                    f"Whitespace/layout decision lacks a code point: {decision_id}"
                )

        classification = stage.get("auditClassification", "host-layout")
        classification = re.sub(
            r"[^a-z0-9]+",
            "-",
            str(classification).lower(),
        ).strip("-") or "host-layout"
        return f"layout:{classification}:{code_point}"

    return None


def numeric_context(decision_id: str) -> tuple[str | None, str | None, str]:
    mapping = {
        "FA-NUMRULE-002": (None, "digit", "numeric-begin"),
        "FA-NUMRULE-003": ("digit", "digit", "numeric-internal"),
        "FA-NUMRULE-004": ("digit", "digit", "numeric-internal"),
        "FA-NUMRULE-005": ("digit", "digit", "numeric-decimal-separator"),
        "FA-NUMRULE-006": ("digit", "digit", "numeric-decimal-separator"),
        "FA-NUMRULE-007": ("digit", None, "numeric-end"),
    }
    try:
        return mapping[decision_id]
    except KeyError as exc:
        raise RuntimeError(
            f"No numeric context contract for {decision_id}"
        ) from exc


def mode_token_class(decision_id: str) -> str:
    mapping = {
        "FA-NUMRULE-001": "numeric-indicator",
        "FA-LATIN-MODE-001": "latin-character-class",
        "FA-LATIN-MODE-002": "latin-span-begin",
        "FA-LATIN-MODE-003": "latin-span-end",
        "FA-LATIN-MODE-004": "latin-capital-indicator",
    }
    try:
        return mapping[decision_id]
    except KeyError as exc:
        raise RuntimeError(
            f"No mode token class for {decision_id}"
        ) from exc


def candidate_rule_and_vector(
    entry: dict,
    record: dict,
    packet: dict,
) -> tuple[dict, dict]:
    decision_id = entry["decisionItemId"]
    rule_id = candidate_rule_id(decision_id)
    vector_id = candidate_vector_id(rule_id)
    target_type = entry["targetRuleType"]
    stage = packet.get("stageEvidenceRecord") or {}
    text = candidate_text(stage)
    cells = candidate_cells(decision_id, packet)
    structural_token = structural_token_for(decision_id, stage)

    input_kind = "scalar"
    before = None
    after = None
    token_class = None
    priority = 1000

    if target_type == "sequence":
        input_kind = "sequence"
        priority = 100
    elif target_type == "context":
        input_kind = "context"
        priority = 100
        before, after, token_class = numeric_context(decision_id)
    elif target_type == "mode":
        input_kind = "structural"
        token_class = mode_token_class(decision_id)
        priority = 100
        text = None
        if decision_id.startswith("FA-LATIN-MODE-"):
            draft = packet["stableDraftComparison"].get("draft") or {}
            value = draft.get("value")
            if decision_id != "FA-LATIN-MODE-001":
                if not isinstance(value, str) or not value:
                    raise RuntimeError(
                        f"Missing accepted draft mode output for {decision_id}"
                    )
                cells = split_dots(value)
    elif target_type == "layout":
        if text is None:
            raise RuntimeError(
                f"Layout candidate lacks scalar input text: {decision_id}"
            )
        input_kind = "scalar"
        cells = []
    elif target_type == "normalization":
        if text is None:
            raise RuntimeError(
                f"Normalization candidate lacks scalar input text: {decision_id}"
            )
        input_kind = "scalar"
        cells = []

    if target_type not in {"layout", "normalization"}:
        if decision_id == "FA-LATIN-MODE-001":
            cells = []
        elif cells is None or not cells:
            raise RuntimeError(
                f"No accepted cell output for materializable decision {decision_id}"
            )

    if cells is None:
        cells = []

    for cell in cells:
        # fa-ir-g1 remains a six-dot profile.
        if not re.fullmatch(r"(?:0|[1-6]{1,6})", cell):
            raise RuntimeError(
                f"Candidate {decision_id} is not six-dot materializable: {cell!r}"
            )
        if cell != "0":
            if len(set(cell)) != len(cell):
                raise RuntimeError(
                    f"Candidate {decision_id} repeats a Braille dot: {cell!r}"
                )
            if list(cell) != sorted(cell, key=int):
                raise RuntimeError(
                    f"Candidate {decision_id} has non-canonical dots: {cell!r}"
                )

    if not cells and structural_token is None and decision_id == "FA-LATIN-MODE-001":
        structural_token = "mode:latin-character-class"

    if not cells and structural_token is None:
        raise RuntimeError(
            f"Structural candidate lacks structural token: {decision_id}"
        )

    input_obj = {
        "kind": input_kind,
    }
    if text is not None:
        input_obj["text"] = text
        input_obj["codePoints"] = code_points(text)
    if before is not None:
        input_obj["before"] = before
    if after is not None:
        input_obj["after"] = after
    if token_class is not None:
        input_obj["tokenClass"] = token_class

    source_ids = list(dict.fromkeys(record["basis"]["sourceIds"]))
    conflicts = []
    if (
        packet["stableDraftComparison"]["relationship"]
        == "different-observed-behavior"
    ):
        conflicts.append(
            "Stable/draft implementation difference resolved by explicit "
            f"Phase 2.14 adjudication {record['id']}."
        )

    rule = {
        "schemaVersion": SCHEMA_VERSION,
        "id": rule_id,
        "profile": PROFILE_ID,
        "type": target_type,
        "status": "candidate",
        "version": ARTIFACT_VERSION,
        "direction": "forward",
        "priority": priority,
        "input": input_obj,
        "output": {
            "cells": cells,
            "unicodeBraille": unicode_braille(cells) if cells else None,
            "structuralToken": structural_token,
        },
        "normalization": {
            "form": "none",
            "canonicalInput": text,
            "notes": (
                "No global Unicode normalization is implied. Structural "
                "normalization/layout semantics are expressed by this rule's "
                "type and structural token."
                if target_type in {"normalization", "layout"}
                else "No additional normalization is applied by this rule."
            ),
        },
        "evidence": {
            "decisionItemIds": [decision_id],
            "sourceIds": source_ids,
            "rationale": record["rationale"],
            "conflictsResolved": conflicts,
        },
        "conformance": {
            "vectorIds": [vector_id],
        },
        "notes": [
            "Generated from an explicitly approved Phase 2.14 adjudication.",
            f"Adjudication record: {record['id']}.",
            (
                "The historical Phase 1 classification remains "
                f"{record['phase1Classification']}."
            ),
            "Candidate admission does not imply normative promotion.",
        ],
    }

    vector_input = {
        "text": text or "",
        "codePoints": code_points(text) if text is not None else [],
    }
    if before is not None:
        vector_input["before"] = before
    if after is not None:
        vector_input["after"] = after
    if token_class is not None:
        vector_input["tokenClass"] = token_class

    vector = {
        "schemaVersion": SCHEMA_VERSION,
        "id": vector_id,
        "status": "draft",
        "version": ARTIFACT_VERSION,
        "profile": PROFILE_ID,
        "profileVersion": PROFILE_VERSION,
        "ruleIds": [rule_id],
        "input": vector_input,
        "expected": {
            "cells": cells,
            "unicodeBraille": unicode_braille(cells) if cells else None,
            "structuralTokens": [structural_token] if structural_token else [],
        },
        "tags": list(
            dict.fromkeys(
                [
                    "phase-2.14",
                    "adjudicated-candidate",
                    target_type,
                    decision_id.split("-")[1].lower(),
                ]
            )
        ),
        "notes": [
            f"Draft conformance vector for adjudication {record['id']}.",
            "Activation requires a separate normative promotion.",
        ],
    }

    return rule, vector


def load_adjudicated_candidates() -> tuple[list[dict], list[dict], dict]:
    if not ADMISSION_FILE.exists():
        return [], [], {}

    admission = read_json(ADMISSION_FILE)
    if admission["stage"] != "2.14" or admission["status"] != "route-ready":
        raise RuntimeError(
            "Candidate-admission manifest is not in the expected Phase 2.14 "
            "route-ready state"
        )

    entries = admission["entries"]
    if len(entries) != 138:
        raise RuntimeError(
            f"Expected 138 admitted Phase 2.14 candidates, found {len(entries)}"
        )

    generated_rules = []
    generated_vectors = []
    realized = {}

    for entry in sorted(entries, key=lambda row: row["decisionItemId"]):
        if entry["targetStatus"] != "candidate":
            raise RuntimeError(
                f"Admission target is not candidate: {entry['decisionItemId']}"
            )
        if entry["promotionEligible"] is not False:
            raise RuntimeError(
                f"Premature promotion eligibility: {entry['decisionItemId']}"
            )
        if entry["normativePromotionAuthorized"] is not False:
            raise RuntimeError(
                f"Premature normative authorization: {entry['decisionItemId']}"
            )

        record_path = ROOT / entry["adjudicationRecordPath"]
        record_bytes = record_path.read_bytes()
        if sha256_bytes(record_bytes) != entry["adjudicationRecordSha256"]:
            raise RuntimeError(
                f"Adjudication record hash mismatch: {entry['decisionItemId']}"
            )
        record = json.loads(record_bytes.decode("utf-8"))

        if record["id"] != entry["adjudicationRecordId"]:
            raise RuntimeError(
                f"Adjudication identity mismatch: {entry['decisionItemId']}"
            )
        if record["decisionItemId"] != entry["decisionItemId"]:
            raise RuntimeError(
                f"Decision identity mismatch: {entry['decisionItemId']}"
            )
        if record["decision"]["result"] != "approved":
            raise RuntimeError(
                f"Non-approved decision admitted: {entry['decisionItemId']}"
            )
        if record["materialization"]["createsSpecificationArtifact"] is not True:
            raise RuntimeError(
                f"Non-materializable decision admitted: {entry['decisionItemId']}"
            )
        if record["materialization"]["targetRuleType"] != entry["targetRuleType"]:
            raise RuntimeError(
                f"Admission/record target mismatch: {entry['decisionItemId']}"
            )
        if record["materialization"]["promotionEligible"] is not False:
            raise RuntimeError(
                f"Adjudication is promotion eligible: {entry['decisionItemId']}"
            )

        packet_path = ROOT / record["basis"]["evidencePacketPath"]
        packet_bytes = packet_path.read_bytes()
        if sha256_bytes(packet_bytes) != record["basis"]["evidencePacketSha256"]:
            raise RuntimeError(
                f"Evidence packet hash mismatch: {entry['decisionItemId']}"
            )
        packet = json.loads(packet_bytes.decode("utf-8"))

        rule, vector = candidate_rule_and_vector(entry, record, packet)
        generated_rules.append(rule)
        generated_vectors.append(vector)
        realized[entry["decisionItemId"]] = {
            "ruleId": rule["id"],
            "vectorId": vector["id"],
            "adjudicationRecordId": record["id"],
            "adjudicationRecordPath": entry["adjudicationRecordPath"],
            "adjudicationRecordSha256": entry["adjudicationRecordSha256"],
        }

    type_counts = Counter(rule["type"] for rule in generated_rules)
    if dict(sorted(type_counts.items())) != CANDIDATE_RULE_TYPE_COUNTS:
        raise RuntimeError(
            "Adjudicated candidate type counts drifted: "
            f"{dict(sorted(type_counts.items()))}"
        )

    return generated_rules, generated_vectors, realized


master = read_json(MASTER)
numpunc = read_json(NUMPUNC)

# Make sure Phase 2.1 revised schemas are actually present before generating
# artifacts that depend on their contracts.
rule_schema = read_json(RULE_SCHEMA)
profile_schema = read_json(PROFILE_SCHEMA)
conf_schema = read_json(CONFORMANCE_SCHEMA)
promotion_schema = read_json(PROMOTION_SCHEMA)
promotion_policy = read_json(PROMOTION_POLICY)

required_rule_fields = set(rule_schema["required"])
required_profile_fields = set(profile_schema["required"])
required_conf_fields = set(conf_schema["required"])

for required in {"version", "evidence", "conformance"}:
    if required not in required_rule_fields:
        raise RuntimeError(f"Phase 2.1 rule schema missing required field: {required}")

if "ruleIds" not in required_profile_fields or "version" not in required_profile_fields:
    raise RuntimeError("Phase 2.1 profile schema is not the revised stable-ID schema")

if "rules" in profile_schema["properties"]:
    raise RuntimeError("Profile schema still contains filesystem-coupled 'rules'")

for required in {"version", "profileVersion"}:
    if required not in required_conf_fields:
        raise RuntimeError(
            f"Phase 2.1 conformance schema missing required field: {required}"
        )

for context_field in {"before", "after", "tokenClass"}:
    if context_field not in conf_schema["properties"]["input"]["properties"]:
        raise RuntimeError(
            f"Phase 2.1 conformance schema missing context field: {context_field}"
        )

try:
    Draft202012Validator.check_schema(promotion_schema)
except SchemaError as exc:
    raise RuntimeError(
        f"Invalid promotion record schema: {exc.message}"
    ) from exc

if promotion_policy["promotion"]["automaticPromotionAllowed"] is not False:
    raise RuntimeError("Promotion materialization requires automatic promotion=false")
if promotion_policy["promotion"]["ciPassAloneMayPromote"] is not False:
    raise RuntimeError("Promotion materialization requires ciPassAloneMayPromote=false")

applied_promotions: dict[tuple[str, str], dict] = {}
if PROMOTION_DIR.exists():
    promotion_validator = Draft202012Validator(promotion_schema)
    for promotion_path in sorted(PROMOTION_DIR.glob("*.json")):
        promotion = read_json(promotion_path)
        try:
            promotion_validator.validate(promotion)
        except ValidationError as exc:
            location = "/".join(str(part) for part in exc.absolute_path)
            suffix = f" at {location}" if location else ""
            raise RuntimeError(
                f"Invalid promotion record {promotion_path.name}{suffix}: "
                f"{exc.message}"
            ) from exc

        if promotion["policyVersion"] != promotion_policy["policyVersion"]:
            raise RuntimeError(
                f"Promotion policy mismatch in {promotion_path.name}: "
                f"{promotion['policyVersion']} != "
                f"{promotion_policy['policyVersion']}"
            )

        key = (promotion["ruleId"], promotion["ruleVersion"])
        if key in applied_promotions:
            raise RuntimeError(
                "Duplicate promotion record for rule/version: "
                f"{key[0]} {key[1]}"
            )
        applied_promotions[key] = promotion

master_items = {row["id"]: row for row in master["items"]}
consensus_ids = sorted(
    row["id"]
    for row in master["items"]
    if row["classification"] == CONSENSUS
)

if len(consensus_ids) != 37:
    raise RuntimeError(
        f"Expected 37 Phase 1 consensus candidates, found {len(consensus_ids)}"
    )

if set(consensus_ids) != set(DECISION_TO_RULE_ID):
    missing = sorted(set(consensus_ids) - set(DECISION_TO_RULE_ID))
    extra = sorted(set(DECISION_TO_RULE_ID) - set(consensus_ids))
    raise RuntimeError(
        f"Decision/rule mapping mismatch. Missing={missing}, extra={extra}"
    )

context_cases = {row["id"]: row for row in numpunc["contextCases"]}

rules = []
vectors = []

# Core 32 letters.
for index in range(1, 33):
    decision_id = f"FA-CORE-{index:03d}"
    decision = master_items[decision_id]
    rule_id = CORE_RULE_IDS[decision_id]
    vector_id = CONF_IDS[rule_id]

    text = decision["subject"]
    dots = decision["stable"]["dots"]
    cells = split_dots(dots)

    rules.append(
        base_rule(
            rule_id=rule_id,
            rule_type="character",
            input_kind="scalar",
            text=text,
            cells=cells,
            decision_item=decision,
            vector_id=vector_id,
        )
    )
    vectors.append(
        conformance_vector(
            vector_id=vector_id,
            rule_id=rule_id,
            text=text,
            cells=cells,
            tags=["core-alphabet", "scalar"],
        )
    )

# U+0670 superscript alef: the draft implements the institutionally reported dot 5.
decision = master_items["FA-VAR-010"]
rule_id = SPECIAL_RULE_IDS["FA-VAR-010"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(decision["draft"]["dots"])

rules.append(
    base_rule(
        rule_id=rule_id,
        rule_type="character",
        input_kind="scalar",
        text=decision["subject"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        rationale_suffix=(
            "The candidate output intentionally follows the institutionally "
            "reported draft mapping rather than the unmapped stable baseline."
        ),
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=decision["subject"],
        cells=cells,
        tags=["orthography", "diacritic", "manual-backed"],
    )
)

# ASCII three-dot ellipsis.
decision = master_items["FA-CTX-001"]
case = context_cases["FA-CTX-001"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-001"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(case["manual"]["expectedDots"])

rules.append(
    base_rule(
        rule_id=rule_id,
        rule_type="sequence",
        input_kind="sequence",
        text=case["input"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=100,
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=case["input"],
        cells=cells,
        tags=["punctuation", "ellipsis", "manual-backed"],
    )
)

# Fraction slash: context rule over slash between numeric tokens.
decision = master_items["FA-CTX-002"]
case = context_cases["FA-CTX-002"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-002"]
vector_id = CONF_IDS[rule_id]
cells = [case["manual"]["slashDots"]]

rules.append(
    base_rule(
        rule_id=rule_id,
        rule_type="context",
        input_kind="context",
        text="/",
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=100,
        before="digit",
        after="digit",
        token_class="numeric-fraction-separator",
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text="/",
        cells=cells,
        before="digit",
        after="digit",
        token_class="numeric-fraction-separator",
        tags=["number", "fraction", "context", "manual-backed"],
    )
)

# Single asterisk. This is kept distinct from longer adjacent runs.
decision = master_items["FA-CTX-003"]
case = context_cases["FA-CTX-003"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-003"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(case["manual"]["expectedDots"])

rules.append(
    base_rule(
        rule_id=rule_id,
        rule_type="character",
        input_kind="scalar",
        text=case["input"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=200,
        rationale_suffix=(
            "A longer adjacent asterisk-run candidate has higher precedence."
        ),
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=case["input"],
        cells=cells,
        tags=["punctuation", "asterisk", "manual-backed"],
    )
)

# Three-asterisk representative run from the audited evidence.
decision = master_items["FA-CTX-004"]
case = context_cases["FA-CTX-004"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-004"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(case["manual"]["expectedDots"])

rules.append(
    base_rule(
        rule_id=rule_id,
        rule_type="sequence",
        input_kind="sequence",
        text=case["input"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=100,
        rationale_suffix=(
            "This Phase 2.2 record captures the audited three-asterisk "
            "representative run. Generalized arbitrary-length run semantics "
            "are deliberately deferred."
        ),
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=case["input"],
        cells=cells,
        tags=["punctuation", "asterisk-run", "manual-backed"],
    )
)

# Phase 2.14 extends the canonical package with explicitly adjudicated
# REVIEW-REQUIRED candidates when the admission manifest is present.
adjudicated_rules, adjudicated_vectors, realized_admissions = (
    load_adjudicated_candidates()
)
rules.extend(adjudicated_rules)
vectors.extend(adjudicated_vectors)
adjudicated_rule_ids = {rule["id"] for rule in adjudicated_rules}

# Apply explicit promotion records to the generated baseline.
rules_by_id = {rule["id"]: rule for rule in rules}
vectors_by_id = {vector["id"]: vector for vector in vectors}

for (promoted_rule_id, promoted_version), promotion in applied_promotions.items():
    if promoted_rule_id in adjudicated_rule_ids:
        raise RuntimeError(
            "Current normative-promotion policy does not authorize promotion "
            f"of adjudicated REVIEW-REQUIRED candidate {promoted_rule_id}"
        )
    if promoted_rule_id not in rules_by_id:
        raise RuntimeError(
            f"Promotion targets unknown materialized rule: {promoted_rule_id}"
        )

    rule = rules_by_id[promoted_rule_id]
    if rule["version"] != promoted_version:
        raise RuntimeError(
            f"Promotion version mismatch for {promoted_rule_id}: "
            f"record={promoted_version}, materialized={rule['version']}"
        )

    rule["status"] = "normative"
    rule["notes"].append(
        f"Normative status materialized from promotion record {promotion['id']}."
    )

    vector_id = rule["conformance"]["vectorIds"][0]
    vector = vectors_by_id[vector_id]
    vector["status"] = "active"
    vector["notes"].append(
        f"Activated because {promoted_rule_id} is normative."
    )

# Stable deterministic order.
rules.sort(key=lambda row: row["id"])
vectors.sort(key=lambda row: row["id"])

expected_total = 37 + len(adjudicated_rules)
if len(rules) != expected_total or len(vectors) != expected_total:
    raise RuntimeError(
        f"Expected {expected_total} rules/vectors, got "
        f"{len(rules)}/{len(vectors)}"
    )

rule_ids = [row["id"] for row in rules]
vector_ids = [row["id"] for row in vectors]

if len(rule_ids) != len(set(rule_ids)):
    raise RuntimeError("Duplicate Phase 2.2 rule IDs")
if len(vector_ids) != len(set(vector_ids)):
    raise RuntimeError("Duplicate Phase 2.2 conformance IDs")

# All initial fa-ir-g1 candidates are six-dot.
for rule in rules:
    for cell in rule["output"]["cells"]:
        if any(dot in cell for dot in "78"):
            raise RuntimeError(
                f"Six-dot candidate package contains dot 7/8: {rule['id']} {cell}"
            )

# Every rule must have exactly one vector and vice versa.
rule_to_vector = {
    rule["id"]: rule["conformance"]["vectorIds"][0]
    for rule in rules
}
vector_to_rule = {
    vector["id"]: vector["ruleIds"][0]
    for vector in vectors
}

for rule_id, vector_id in rule_to_vector.items():
    if vector_id not in vector_to_rule:
        raise RuntimeError(f"Rule references missing vector: {rule_id}")
    if vector_to_rule[vector_id] != rule_id:
        raise RuntimeError(f"Rule/vector mismatch: {rule_id} <-> {vector_id}")

# Rebuild generated directories deterministically.
# Phase 2.7 migrates status-bearing artifacts out of status-specific paths.
for obsolete_dir in (LEGACY_RULE_DIR, LEGACY_CONF_DIR):
    if obsolete_dir.exists():
        shutil.rmtree(obsolete_dir)

if LEGACY_MANIFEST_FILE.exists():
    LEGACY_MANIFEST_FILE.unlink()

for generated_dir in (RULE_DIR, CONF_DIR):
    if generated_dir.exists():
        shutil.rmtree(generated_dir)
    generated_dir.mkdir(parents=True, exist_ok=True)

rule_manifest_entries = []
for rule in rules:
    path = RULE_DIR / safe_file_id(rule["id"])
    write_json(path, rule)
    entry = {
        "id": rule["id"],
        "status": rule["status"],
        "path": str(path.relative_to(ROOT)).replace("\\", "/"),
        "sha256": sha256_bytes(path.read_bytes()),
        "decisionItemId": rule["evidence"]["decisionItemIds"][0],
    }
    decision_id = entry["decisionItemId"]
    if decision_id in realized_admissions:
        realized = realized_admissions[decision_id]
        entry.update(
            {
                "provenanceType": "phase-2.14-adjudication",
                "admissionAuthorized": True,
                "adjudicationRecordId": realized["adjudicationRecordId"],
                "adjudicationRecordPath": realized["adjudicationRecordPath"],
                "adjudicationRecordSha256": realized[
                    "adjudicationRecordSha256"
                ],
            }
        )
    else:
        entry.update(
            {
                "provenanceType": "phase-1-consensus",
                "admissionAuthorized": False,
            }
        )
    rule_manifest_entries.append(entry)

conf_manifest_entries = []
for vector in vectors:
    path = CONF_DIR / safe_file_id(vector["id"])
    write_json(path, vector)
    conf_manifest_entries.append(
        {
            "id": vector["id"],
            "status": vector["status"],
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": sha256_bytes(path.read_bytes()),
        }
    )

profile = {
    "schemaVersion": SCHEMA_VERSION,
    "id": PROFILE_ID,
    "status": "draft",
    "language": "fa",
    "region": "IR",
    "grade": 1,
    "cellSize": 6,
    "direction": "print-to-braille",
    "version": PROFILE_VERSION,
    "ruleIds": rule_ids,
    "normalizationPolicy": {
        "unicodeForm": "none",
        "unknownFormatControls": "error",
    },
    "fallbackPolicy": {
        "unknownCharacter": "error",
        "unknownSequence": "error",
    },
    "evidenceBaseline": {
        "masterDecisionMatrix": (
            "spec/fa-ir/evidence/master-decision-matrix.json"
        ),
        "minimumClassification": (
            "REVIEW-REQUIRED" if adjudicated_rules else CONSENSUS
        ),
    },
}

write_json(PROFILE_FILE, profile)

candidate_count = sum(1 for rule in rules if rule["status"] == "candidate")
normative_count = sum(1 for rule in rules if rule["status"] == "normative")
active_vector_count = sum(1 for vector in vectors if vector["status"] == "active")

manifest = {
    "schemaVersion": 1,
    "stage": "2.14" if adjudicated_rules else "2.7",
    "profile": {
        "id": PROFILE_ID,
        "version": PROFILE_VERSION,
        "status": "draft",
        "path": str(PROFILE_FILE.relative_to(ROOT)).replace("\\", "/"),
        "sha256": sha256_bytes(PROFILE_FILE.read_bytes()),
    },
    "status": "materialized-package",
    "profileNormative": False,
    "summary": {
        "decisionItemsConsumed": len(rules),
        "rules": len(rules),
        "candidateRules": candidate_count,
        "normativeRules": normative_count,
        "conformanceVectors": len(vectors),
        "activeConformanceVectors": active_vector_count,
        "coreAlphabetRules": 32,
        "orthographicRules": 1,
        "punctuationOrNumberRules": 4,
        "dot78Rules": 0,
        "promotionRecordsApplied": len(applied_promotions),
        "phase1ConsensusRules": 37,
        "adjudicatedCandidateRules": len(adjudicated_rules),
        "draftConformanceVectors": sum(
            1 for vector in vectors if vector["status"] == "draft"
        ),
        "structuralRules": sum(
            1
            for rule in rules
            if not rule["output"]["cells"]
            and rule["output"]["structuralToken"] is not None
        ),
        "candidateTargetTypes": dict(
            sorted(Counter(rule["type"] for rule in adjudicated_rules).items())
        ),
        "candidateAdmissionManifest": (
            str(ADMISSION_FILE.relative_to(ROOT)).replace("\\", "/")
            if adjudicated_rules
            else None
        ),
    },
    "rules": rule_manifest_entries,
    "conformanceVectors": conf_manifest_entries,
}

write_json(MANIFEST_FILE, manifest)

if adjudicated_rules:
    doc_file = COMBINED_DOC_FILE
    doc_lines = [
        "# Phase 2.14 — Adjudicated Candidate Materialization",
        "",
        "The canonical `fa-ir-g1` package now materializes both the previously "
        "promoted Phase 1 consensus baseline and the explicitly approved "
        "Phase 2.14 adjudicated candidates in one deterministic pass.",
        "",
        f"- Total rules: {len(rules)}",
        f"- Normative baseline rules: {normative_count}",
        f"- Adjudicated candidate rules: {candidate_count}",
        f"- Total conformance vectors: {len(vectors)}",
        f"- Active vectors: {active_vector_count}",
        f"- Draft vectors: {len(vectors) - active_vector_count}",
        f"- Promotion records applied: {len(applied_promotions)}",
        "",
        "## Lifecycle boundary",
        "",
        "The 37 previously promoted baseline rules retain `normative` status and "
        "their reciprocal conformance vectors remain `active`.",
        "",
        "The 138 Phase 2.14 materializations remain `candidate`; their reciprocal "
        "conformance vectors remain `draft`. Candidate admission does not set "
        "`promotionEligible` and does not authorize normative promotion.",
        "",
        "The `fa-ir-g1` profile remains `draft`.",
        "",
        "## Provenance",
        "",
        "Each adjudicated candidate rule points to exactly one preserved Phase 1 "
        "decision item and carries the source IDs and rationale from its explicit "
        "Phase 2.14 adjudication record. The package manifest additionally binds "
        "candidate rules to adjudication record IDs, paths, and SHA-256 hashes.",
        "",
        "Historical Phase 1 classifications are not rewritten.",
        "",
        "## Six-dot constraint",
        "",
        "Every materialized candidate is compatible with the six-dot `fa-ir-g1` "
        "profile. Structural normalization/layout/mode rules emit structural "
        "tokens rather than virtual Liblouis operands.",
        "",
        "## Canonical ownership",
        "",
        "`build_phase2_candidate_package.py` remains the single owner of "
        "`rules/records`, `conformance/records`, the profile, and the combined "
        "materialization manifest. This prevents the older 37-rule builder state "
        "from deleting Phase 2.14 candidates on regeneration.",
    ]
else:
    doc_file = DOC_FILE
    doc_lines = [
        "# Phase 2.7 — Promotion-Aware Rule Materialization",
        "",
        "The 37 Phase 1 consensus decisions remain the reproducible baseline for "
        "`fa-ir-g1`, but lifecycle status is now materialized from explicit "
        "promotion records.",
        "",
        f"- Candidate rules: {candidate_count}",
        f"- Normative rules: {normative_count}",
        f"- Promotion records applied: {len(applied_promotions)}",
        f"- Active conformance vectors: {active_vector_count}",
        "",
        "## Source of lifecycle status",
        "",
        "Without a promotion record, a generated rule remains `candidate` and its "
        "conformance vector remains `draft`.",
        "",
        "When a schema-valid promotion record targets the exact rule/version, the "
        "materializer emits that rule as `normative` and its vector as `active`.",
        "",
        "The independent Phase 2.6 promotion validator remains responsible for "
        "cross-checking evidence provenance, registered sources, hard gates, and "
        "the project-vs-official-standard scope boundary.",
        "",
        "## Status-neutral repository paths",
        "",
        "Phase 2.7 migrates generated artifacts from `rules/candidates` and "
        "`conformance/candidates` to status-neutral `rules/records` and "
        "`conformance/records`. Profile semantics remain based on stable rule IDs, "
        "so this filesystem migration is non-normative.",
        "",
        "## Profile status",
        "",
        "Promoting individual rules does not promote the incomplete `fa-ir-g1` "
        "profile. The profile remains `draft` until a separate completeness gate "
        "is satisfied.",
        "",
        "## Reversibility",
        "",
        "Removing a promotion record and regenerating materializes the affected "
        "rule as `candidate` again. The repository therefore has one deterministic "
        "source of lifecycle truth: promotion records plus the Phase 1 baseline.",
    ]

write_text(doc_file, "\n".join(doc_lines))

# Final manifest is written before this final report, so all user-facing
# generated artifacts are deterministic.
generated_files = (
    [PROFILE_FILE, MANIFEST_FILE, doc_file]
    + [ROOT / entry["path"] for entry in rule_manifest_entries]
    + [ROOT / entry["path"] for entry in conf_manifest_entries]
)

if adjudicated_rules:
    print("Phase 2.14 adjudication-aware package materialized.")
else:
    print("Phase 2.7 promotion-aware package materialized.")
print(f"Profile                 : {PROFILE_ID} {PROFILE_VERSION} (draft)")
print(f"Rules                    : {len(rules)}")
print(f"Candidate rules          : {candidate_count}")
print(f"Normative rules          : {normative_count}")
print(f"Conformance vectors      : {len(vectors)}")
print(f"Active vectors           : {active_vector_count}")
print(
    f"Draft vectors            : "
    f"{sum(1 for vector in vectors if vector['status'] == 'draft')}"
)
print(f"Promotion records applied: {len(applied_promotions)}")
print(
    f"Adjudicated candidates   : {len(adjudicated_rules)}"
)
print(f"Dot-7/dot-8 rules        : 0")
print(f"Generated data/docs      : {len(generated_files)}")
print(f"Profile SHA-256          : {sha256_bytes(PROFILE_FILE.read_bytes())}")
print(f"Manifest SHA-256         : {sha256_bytes(MANIFEST_FILE.read_bytes())}")
print(f"Documentation SHA-256    : {sha256_bytes(doc_file.read_bytes())}")
