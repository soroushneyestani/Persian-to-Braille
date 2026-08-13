from __future__ import annotations

from pathlib import Path
from collections import Counter
import json
import unicodedata

ROOT = Path.cwd()
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "records"
ADJ_DIR = ROOT / "spec" / "fa-ir" / "adjudications"

required = [PROFILE, RULE_DIR, CONF_DIR]
missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing:
    raise SystemExit("Missing expected repository paths: " + ", ".join(missing))


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def cp(ch: str) -> str:
    return f"U+{ord(ch):04X}"


profile = load(PROFILE)
rules = [(p, load(p)) for p in sorted(RULE_DIR.glob("*.json"))]
vectors = [(p, load(p)) for p in sorted(CONF_DIR.glob("*.json"))]

forms = Counter()
null_canonical = []
mismatches = []

for _, rule in rules:
    norm = rule.get("normalization") or {}
    forms[str(norm.get("form"))] += 1
    canonical = norm.get("canonicalInput")
    input_text = (rule.get("input") or {}).get("text")

    if canonical is None:
        null_canonical.append(rule["id"])
    elif isinstance(input_text, str) and canonical != input_text:
        mismatches.append(rule["id"])

normalization_rules = [
    (path, rule) for path, rule in rules if rule.get("type") == "normalization"
]
normalization_rule_ids = {rule["id"] for _, rule in normalization_rules}

format_rows = []
for path, rule in rules:
    text = (rule.get("input") or {}).get("text")
    if not isinstance(text, str) or not text:
        continue

    for ch in text:
        if unicodedata.category(ch) == "Cf":
            format_rows.append(
                {
                    "codePoint": cp(ch),
                    "name": unicodedata.name(ch, "<unnamed>"),
                    "ruleId": rule["id"],
                    "type": rule.get("type"),
                    "status": rule.get("status"),
                    "path": path.relative_to(ROOT).as_posix(),
                }
            )

format_rows.sort(
    key=lambda row: (row["codePoint"], row["type"] or "", row["ruleId"])
)

exact_vectors = []
for path, vector in vectors:
    ids = set(vector.get("ruleIds") or [])
    tags = set(vector.get("tags") or [])

    if ids & normalization_rule_ids or "normalization" in tags:
        exact_vectors.append((path, vector))

deferred_hits = []
if ADJ_DIR.exists():
    for path in sorted(ADJ_DIR.rglob("*.json")):
        try:
            data = load(path)
        except Exception:
            continue

        def visit(value):
            if isinstance(value, dict):
                blob = json.dumps(value, ensure_ascii=False).lower()
                is_deferred = (
                    "defer" in blob
                    or value.get("status") == "deferred"
                    or value.get("disposition") == "defer-pending-evidence"
                )
                mentions_normalization = any(
                    needle in blob
                    for needle in (
                        "normalization",
                        "unicode spelling",
                        "canonical persian form",
                        "orthographic variant",
                    )
                )

                decision_item_id = value.get("decisionItemId")
                if is_deferred and mentions_normalization and decision_item_id:
                    deferred_hits.append(
                        (
                            path.relative_to(ROOT).as_posix(),
                            value.get("id"),
                            decision_item_id,
                        )
                    )

                for child in value.values():
                    visit(child)
            elif isinstance(value, list):
                for child in value:
                    visit(child)

        visit(data)

deferred_hits = sorted(set(deferred_hits))

print("=== PHASE 4 NORMALIZATION AUDIT ===")
print("mode: READ-ONLY")
print(f"rules={len(rules)}")
print(f"conformanceVectors={len(vectors)}")
print(
    "unicodeForm="
    + str((profile.get("normalizationPolicy") or {}).get("unicodeForm"))
)
print(
    "unknownFormatControls="
    + str(
        (profile.get("normalizationPolicy") or {}).get(
            "unknownFormatControls"
        )
    )
)
print("normalizationForms=" + json.dumps(dict(sorted(forms.items()))))
print(f"canonicalInputNull={len(null_canonical)}")
print(f"canonicalInputMismatches={len(mismatches)}")
print(f"normalizationRules={len(normalization_rules)}")
print(f"exactNormalizationVectors={len(exact_vectors)}")
print(f"formatControlRuleReferences={len(format_rows)}")
print(
    "formatControls="
    + ",".join(
        sorted({row["codePoint"] for row in format_rows})
    )
)
print(f"deferredNormalizationRelated={len(deferred_hits)}")
print()

for _, rule in normalization_rules:
    print(
        "normalizationRule="
        + rule["id"]
        + "|status="
        + str(rule.get("status"))
        + "|token="
        + str((rule.get("output") or {}).get("structuralToken"))
    )

for path, vector in exact_vectors:
    print(
        "normalizationVector="
        + vector["id"]
        + "|status="
        + str(vector.get("status"))
        + "|path="
        + path.relative_to(ROOT).as_posix()
    )

for row in format_rows:
    print(
        "formatControl="
        + row["codePoint"]
        + "|"
        + row["name"]
        + "|rule="
        + row["ruleId"]
        + "|type="
        + str(row["type"])
        + "|status="
        + str(row["status"])
    )

for path, record_id, decision_item_id in deferred_hits:
    print(
        "deferred="
        + str(decision_item_id)
        + "|record="
        + str(record_id)
        + "|path="
        + path
    )

print()
print("No files were written or modified by this audit.")
