from __future__ import annotations

from pathlib import Path
from collections import Counter
import json
import re

ROOT = Path.cwd()

PROFILE = ROOT / "spec/fa-ir/profiles/fa-ir-g1.json"
RULE_DIR = ROOT / "spec/fa-ir/rules/records"
VECTOR_DIR = ROOT / "spec/fa-ir/conformance/records"
CORE_TEST_DIR = ROOT / "packages/core/test"
WORKFLOW_DIR = ROOT / ".github/workflows"
TRANSLATION_CLOSURE = ROOT / "docs/translation/phase-5-closure.md"

required = [PROFILE, RULE_DIR, VECTOR_DIR, CORE_TEST_DIR, WORKFLOW_DIR, TRANSLATION_CLOSURE]
missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing:
    raise SystemExit(
        "Missing expected repository paths: " + ", ".join(missing)
    )


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def key_shape(value):
    if isinstance(value, dict):
        return tuple(sorted(value.keys()))
    return (type(value).__name__,)


profile = load(PROFILE)
rules = [load(path) for path in sorted(RULE_DIR.glob("*.json"))]
vectors = [load(path) for path in sorted(VECTOR_DIR.glob("*.json"))]
rule_by_id = {rule["id"]: rule for rule in rules}

print("=== PHASE 6 CONFORMANCE BASELINE AUDIT ===")
print("mode: READ-ONLY")
print()

print("[PROFILE]")
print("id:", profile.get("id"))
print("version:", profile.get("version"))
print("status:", profile.get("status"))
print("direction:", profile.get("direction"))
print("ruleIds:", len(profile.get("ruleIds", [])))
print(
    "fallbackPolicy:",
    json.dumps(
        profile.get("fallbackPolicy"),
        ensure_ascii=False,
        sort_keys=True,
    ),
)
print()

print("[RULE INVENTORY]")
print("rules:", len(rules))
print(
    "status:",
    dict(sorted(Counter(rule.get("status") for rule in rules).items())),
)
print(
    "type:",
    dict(sorted(Counter(rule.get("type") for rule in rules).items())),
)
print()

print("[VECTOR INVENTORY]")
print("vectors:", len(vectors))
print(
    "status:",
    dict(sorted(Counter(vector.get("status") for vector in vectors).items())),
)
print(
    "ruleIdsPerVector:",
    dict(sorted(Counter(len(vector.get("ruleIds", [])) for vector in vectors).items())),
)
print("inputKeyShapes:")
for keys, count in sorted(
    Counter(key_shape(vector.get("input", {})) for vector in vectors).items(),
    key=lambda item: (item[0], item[1]),
):
    print(" ", count, list(keys))
print("expectedKeyShapes:")
for keys, count in sorted(
    Counter(key_shape(vector.get("expected", {})) for vector in vectors).items(),
    key=lambda item: (item[0], item[1]),
):
    print(" ", count, list(keys))
print()

print("[VECTOR COVERAGE BY RULE TYPE]")
coverage = Counter()
for vector in vectors:
    for rule_id in vector.get("ruleIds", []):
        rule = rule_by_id.get(rule_id)
        coverage[rule.get("type") if rule else "<missing>"] += 1
for rule_type, count in sorted(coverage.items()):
    print(f"{rule_type}: {count}")
print()

print("[PROFILE-LEVEL / MULTI-RULE VECTOR CHECK]")
multi_rule_vectors = [
    vector for vector in vectors
    if len(vector.get("ruleIds", [])) > 1
]
print("multiRuleVectors:", len(multi_rule_vectors))
print()

print("[CORE TEST INVENTORY]")
test_files = sorted(CORE_TEST_DIR.glob("*.mjs"))
print("files:", len(test_files))
for path in test_files:
    text = path.read_text(encoding="utf-8")
    print(
        path.relative_to(ROOT).as_posix(),
        "testCalls=",
        len(re.findall(r"\btest\s*\(", text)),
        "subtestCalls=",
        len(re.findall(r"\bt\.test\s*\(", text)),
        "lines=",
        len(text.splitlines()),
    )
print()

print("[PHASE 5 SINGLE-RULE BRIDGE]")
bridge = CORE_TEST_DIR / "canonical-execution-bridge.test.mjs"
bridge_text = bridge.read_text(encoding="utf-8")
for marker in [
    "bridges every canonical rule vector",
    'rule.type === "mode"',
    'rule.type === "normalization"',
    "selector.select",
    "modeExecutor.execute",
    "preprocessor.normalize",
]:
    print(marker, "=>", marker in bridge_text)
print()

print("[MACHINE-READABLE CONFORMANCE REPORT CHECK]")
report_like = []
for root in [ROOT / "reports", ROOT / "artifacts", ROOT / "docs", ROOT / "tools"]:
    if not root.exists():
        continue
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT).as_posix().lower()
        if (
            "conformance" in rel
            and path.suffix.lower()
            in {".json", ".jsonl", ".xml", ".sarif", ".csv"}
        ):
            report_like.append(path.relative_to(ROOT).as_posix())

print("machineReadableConformanceReports:", len(report_like))
for rel in sorted(report_like):
    print(" ", rel)
print()

print("[CI CHECK]")
for path in sorted(WORKFLOW_DIR.glob("*.yml")):
    text = path.read_text(encoding="utf-8")
    if any(
        marker in text
        for marker in (
            "pnpm run test",
            "spec/fa-ir/conformance/**",
            "docs/translation/**",
            "tools/translation/**",
        )
    ):
        print(path.relative_to(ROOT).as_posix())
        for line in text.splitlines():
            if any(
                marker in line
                for marker in (
                    "pnpm run test",
                    "spec/fa-ir/conformance/**",
                    "docs/translation/**",
                    "tools/translation/**",
                )
            ):
                print(" ", line.strip())
print()

print("[PHASE 6 BOUNDARY FROM PHASE 5 CLOSURE]")
lines = TRANSLATION_CLOSURE.read_text(encoding="utf-8").splitlines()
capture = False
for line in lines:
    if line.strip() == "## Phase 6 boundary":
        capture = True
    elif capture and line.startswith("## ") and line.strip() != "## Phase 6 boundary":
        break
    if capture:
        print(line)
print()

print("[SUMMARY]")
print("rules:", len(rules))
print("vectors:", len(vectors))
print("multiRuleVectors:", len(multi_rule_vectors))
print("coreTestFiles:", len(test_files))
print("machineReadableConformanceReports:", len(report_like))
print()
print("No files were written or modified by this audit.")
