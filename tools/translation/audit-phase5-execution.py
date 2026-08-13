from __future__ import annotations

from pathlib import Path
from collections import Counter, defaultdict
import json

ROOT = Path.cwd()
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "records"

required = [PROFILE, RULE_DIR, CONF_DIR]
missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing:
    raise SystemExit("Missing expected repository paths: " + ", ".join(missing))


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def compact(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


profile = load(PROFILE)
rules = [(p, load(p)) for p in sorted(RULE_DIR.glob("*.json"))]
vectors = [(p, load(p)) for p in sorted(CONF_DIR.glob("*.json"))]

rule_by_id = {rule["id"]: rule for _, rule in rules}
profile_rule_ids = profile.get("ruleIds", [])
admitted_rules = [rule_by_id[rid] for rid in profile_rule_ids if rid in rule_by_id]

print("=== PHASE 5 EXECUTION BASELINE AUDIT ===")
print("mode: READ-ONLY")
print()

print("[PROFILE]")
print("id:", profile.get("id"))
print("version:", profile.get("version"))
print("status:", profile.get("status"))
print("direction:", profile.get("direction"))
print("ruleIds:", len(profile_rule_ids))
print("fallbackPolicy:", compact(profile.get("fallbackPolicy")))
print()

print("[RULE DISTRIBUTION]")
print("total:", len(admitted_rules))
print("status:", dict(sorted(Counter(r.get("status") for r in admitted_rules).items())))
print("type:", dict(sorted(Counter(r.get("type") for r in admitted_rules).items())))
print("priority:", dict(sorted(Counter(r.get("priority") for r in admitted_rules).items())))
print("inputKind:", dict(sorted(Counter((r.get("input") or {}).get("kind") for r in admitted_rules).items())))
print()

print("[TEXT COLLISIONS]")
by_text = defaultdict(list)
for rule in admitted_rules:
    text = (rule.get("input") or {}).get("text")
    if isinstance(text, str):
        by_text[text].append(rule)

text_collisions = [(text, group) for text, group in by_text.items() if len(group) > 1]
print("groups:", len(text_collisions))
for text, group in sorted(text_collisions, key=lambda item: item[0]):
    print("text:", repr(text))
    for rule in group:
        inp = rule.get("input") or {}
        print(
            " ",
            rule["id"],
            f"type={rule.get('type')}",
            f"kind={inp.get('kind')}",
            f"priority={rule.get('priority')}",
            f"status={rule.get('status')}",
            f"before={inp.get('before')}",
            f"after={inp.get('after')}",
            f"tokenClass={inp.get('tokenClass')}",
        )
print()

print("[SEQUENCE OVERLAPS]")
sequences = [r for r in admitted_rules if (r.get("input") or {}).get("kind") == "sequence"]
scalar_or_context = [
    r for r in admitted_rules
    if (r.get("input") or {}).get("kind") in ("scalar", "context")
]
sequence_overlap_groups = 0
for sequence in sequences:
    sequence_text = (sequence.get("input") or {}).get("text")
    if not isinstance(sequence_text, str):
        continue

    components = []
    for rule in scalar_or_context:
        text = (rule.get("input") or {}).get("text")
        if isinstance(text, str) and text and text in sequence_text:
            components.append(rule)

    if not components:
        continue

    sequence_overlap_groups += 1
    print(
        sequence["id"],
        f"text={repr(sequence_text)}",
        f"priority={sequence.get('priority')}",
        f"status={sequence.get('status')}",
    )
    for rule in components:
        print(
            "  contains:",
            rule["id"],
            f"text={repr((rule.get('input') or {}).get('text'))}",
            f"type={rule.get('type')}",
            f"priority={rule.get('priority')}",
            f"status={rule.get('status')}",
        )
print("groups:", sequence_overlap_groups)
print()

print("[CONTEXT VOCABULARY]")
before_values = sorted({
    (r.get("input") or {}).get("before")
    for r in admitted_rules
    if (r.get("input") or {}).get("before") is not None
})
after_values = sorted({
    (r.get("input") or {}).get("after")
    for r in admitted_rules
    if (r.get("input") or {}).get("after") is not None
})
token_classes = sorted({
    (r.get("input") or {}).get("tokenClass")
    for r in admitted_rules
    if (r.get("input") or {}).get("tokenClass") is not None
})
print("before:", before_values)
print("after:", after_values)
print("tokenClass:", token_classes)
print()

print("[DIGIT INVENTORY]")
digit_rules = []
for rule in admitted_rules:
    text = (rule.get("input") or {}).get("text")
    if (
        rule.get("type") == "character"
        and isinstance(text, str)
        and len(text) == 1
        and text.isdigit()
    ):
        digit_rules.append(rule)

print("count:", len(digit_rules))
print("ids:")
for rule in digit_rules:
    print(" ", rule["id"], repr((rule.get("input") or {}).get("text")))
print()

print("[STRUCTURAL INPUT RULES]")
structural_rules = [
    r for r in admitted_rules if (r.get("input") or {}).get("kind") == "structural"
]
print("count:", len(structural_rules))
for rule in structural_rules:
    print(
        rule["id"],
        f"tokenClass={(rule.get('input') or {}).get('tokenClass')}",
        f"priority={rule.get('priority')}",
        f"status={rule.get('status')}",
        f"output={compact(rule.get('output'))}",
    )
print()

print("[CONFORMANCE COVERAGE]")
vectors_by_rule = defaultdict(list)
for _, vector in vectors:
    for rid in vector.get("ruleIds", []):
        vectors_by_rule[rid].append(vector["id"])

without_vector = [rid for rid in profile_rule_ids if not vectors_by_rule.get(rid)]
multiple_vectors = [
    (rid, vectors_by_rule[rid])
    for rid in profile_rule_ids
    if len(vectors_by_rule.get(rid, [])) > 1
]
print("rulesWithoutVector:", len(without_vector))
print("rulesWithMultipleVectors:", len(multiple_vectors))
print("vectorStatus:", dict(sorted(Counter(v.get("status") for _, v in vectors).items())))
print()

print("[SUMMARY]")
print("rules:", len(admitted_rules))
print("vectors:", len(vectors))
print("textCollisionGroups:", len(text_collisions))
print("sequenceOverlapGroups:", sequence_overlap_groups)
print("structuralInputRules:", len(structural_rules))
print("digitRules:", len(digit_rules))
print()
print("No files were written or modified by this audit.")
