from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path.cwd()

SDK = ROOT / "packages" / "sdk"
CORE = ROOT / "packages" / "core"
ROOT_PACKAGE = ROOT / "package.json"

required = [
    SDK / "package.json",
    SDK / "src" / "index.ts",
    SDK / "README.md",
    CORE / "package.json",
    CORE / "src" / "index.ts",
    ROOT_PACKAGE,
]
missing = [
    str(path.relative_to(ROOT))
    for path in required
    if not path.exists()
]
if missing:
    raise SystemExit(
        "Missing expected repository paths: "
        + ", ".join(missing)
    )


def load_json(path: Path):
    return json.loads(
        path.read_text(encoding="utf-8")
    )


sdk_package = load_json(
    SDK / "package.json"
)
core_package = load_json(
    CORE / "package.json"
)
root_package = load_json(ROOT_PACKAGE)

print(
    "=== PHASE 7 PUBLIC SDK BASELINE AUDIT ==="
)
print("mode: READ-ONLY")
print()

print("[SDK PACKAGE]")
print("name:", sdk_package.get("name"))
print(
    "version:",
    sdk_package.get("version"),
)
print("type:", sdk_package.get("type"))
print(
    "types:",
    json.dumps(
        sdk_package.get("types"),
        sort_keys=True,
    ),
)
print(
    "exports:",
    json.dumps(
        sdk_package.get("exports"),
        sort_keys=True,
    ),
)
print(
    "files:",
    json.dumps(
        sdk_package.get("files"),
        sort_keys=True,
    ),
)
print(
    "scripts:",
    json.dumps(
        sdk_package.get("scripts"),
        sort_keys=True,
    ),
)
print(
    "dependencies:",
    json.dumps(
        sdk_package.get("dependencies"),
        sort_keys=True,
    ),
)
print()

print("[SDK SOURCE]")
src_files = sorted(
    path
    for path in (SDK / "src").rglob("*")
    if path.is_file()
)
print("files:", len(src_files))
for path in src_files:
    print(
        " ",
        path.relative_to(ROOT).as_posix(),
    )
print()

print("[SDK TESTS]")
test_files = []
for candidate in [
    SDK / "test",
    SDK / "tests",
    SDK / "__tests__",
]:
    if not candidate.exists():
        continue

    test_files.extend(
        path
        for path in candidate.rglob("*")
        if path.is_file()
    )

print("files:", len(test_files))
for path in sorted(test_files):
    print(
        " ",
        path.relative_to(ROOT).as_posix(),
    )
print()

print("[SDK PACKAGE FILES]")
for name in [
    "tsconfig.json",
    "README.md",
    "LICENSE",
    ".npmignore",
]:
    print(
        name + ":",
        "present"
        if (SDK / name).exists()
        else "absent",
    )
print()

print("[CORE PUBLIC SURFACE]")
core_index = (
    CORE / "src" / "index.ts"
).read_text(encoding="utf-8")
core_export_lines = [
    line.strip()
    for line in core_index.splitlines()
    if line.strip().startswith("export")
]
print(
    "exportLines:",
    len(core_export_lines),
)
for line in core_export_lines:
    print(" ", line)
print()

print("[SDK CONSUMERS]")
sdk_consumers = []
for root in [
    ROOT / "apps",
    ROOT / "integrations",
    ROOT / "packages",
]:
    if not root.exists():
        continue

    for path in root.rglob("*"):
        if (
            not path.is_file()
            or path.suffix
            not in {
                ".ts",
                ".tsx",
                ".js",
                ".mjs",
                ".json",
            }
        ):
            continue

        if SDK in path.parents:
            continue

        try:
            text = path.read_text(
                encoding="utf-8"
            )
        except UnicodeDecodeError:
            continue

        if "@persian-braille/sdk" in text:
            sdk_consumers.append(
                path.relative_to(ROOT)
                .as_posix()
            )

sdk_consumers = sorted(
    set(sdk_consumers)
)
print("files:", len(sdk_consumers))
for rel in sdk_consumers:
    print(" ", rel)
print()

print("[DIRECT CORE BYPASS CHECK]")
core_bypass = []
for root in [
    ROOT / "apps",
    ROOT / "integrations",
    ROOT / "packages",
]:
    if not root.exists():
        continue

    for path in root.rglob("*"):
        if (
            not path.is_file()
            or path.suffix
            not in {
                ".ts",
                ".tsx",
                ".js",
                ".mjs",
            }
        ):
            continue

        if (
            CORE in path.parents
            or SDK in path.parents
        ):
            continue

        try:
            text = path.read_text(
                encoding="utf-8"
            )
        except UnicodeDecodeError:
            continue

        if "@persian-braille/core" in text:
            core_bypass.append(
                path.relative_to(ROOT)
                .as_posix()
            )

core_bypass = sorted(
    set(core_bypass)
)
print("files:", len(core_bypass))
for rel in core_bypass:
    print(" ", rel)
print()

print("[PUBLIC RELEASE READINESS]")
gaps = []

if not sdk_package.get("exports"):
    gaps.append(
        "SDK package has no explicit exports map."
    )

if not sdk_package.get("types"):
    gaps.append(
        "SDK package has no explicit types entry."
    )

if not sdk_package.get("files"):
    gaps.append(
        "SDK package has no published files allowlist."
    )

if not (SDK / "README.md").exists():
    gaps.append(
        "SDK package has no package README."
    )

if len(test_files) == 0:
    gaps.append(
        "SDK package has no dedicated tests."
    )

publication_metadata = [
    key
    for key in [
        "description",
        "license",
        "repository",
        "keywords",
    ]
    if sdk_package.get(key)
]

if len(publication_metadata) == 0:
    gaps.append(
        "SDK package metadata is minimal for public publication."
    )

print("gaps:", len(gaps))
for gap in gaps:
    print(" -", gap)
print()

print("[ROOT SDK/RELEASE COMMANDS]")
scripts = root_package.get(
    "scripts",
    {},
)
relevant = {
    key: value
    for key, value in scripts.items()
    if any(
        token in key.lower()
        for token in [
            "sdk",
            "pack",
            "publish",
        ]
    )
}
if relevant:
    for key, value in sorted(
        relevant.items()
    ):
        print(f"{key}: {value}")
else:
    print(
        "No root SDK/package/publish scripts found."
    )
print()

print("[SUMMARY]")
print(
    "sdkSourceFiles:",
    len(src_files),
)
print(
    "sdkTestFiles:",
    len(test_files),
)
print(
    "sdkConsumers:",
    len(sdk_consumers),
)
print(
    "directCoreConsumersOutsideSdk:",
    len(core_bypass),
)
print(
    "releaseReadinessGaps:",
    len(gaps),
)
print()
print(
    "No files were written or modified by this audit."
)
