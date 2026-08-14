from pathlib import Path
import json
import subprocess

ROOT = Path.cwd()

def run_git(*args):
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        encoding="utf-8",
        errors="replace",
        shell=False,
        check=True,
    )
    return result.stdout.strip()

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def count_source_files(base):
    src = base / "src"
    if not src.exists():
        return 0
    return sum(
        1
        for path in src.rglob("*")
        if path.is_file()
        and path.suffix.lower() in {".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"}
    )

def count_test_files(base):
    count = 0
    for path in base.rglob("*"):
        if not path.is_file():
            continue
        if any(part in {"node_modules", "dist", ".git"} for part in path.parts):
            continue
        parts = {part.lower() for part in path.parts}
        name = path.name.lower()
        if "test" in parts or "tests" in parts or ".test." in name or ".spec." in name:
            count += 1
    return count

def count_imports(base, package_name):
    count = 0
    src = base / "src"
    if not src.exists():
        return 0
    for path in src.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"}:
            continue
        text = path.read_text(encoding="utf-8")
        count += text.count(package_name)
    return count

print("PHASE 8.1 CLI / WEB BASELINE AUDIT")
print(f"branch={run_git('rev-parse', '--abbrev-ref', 'HEAD')}")
print(f"head={run_git('rev-parse', '--short', 'HEAD')}")
print()

for app_name in ("cli", "web"):
    base = ROOT / "apps" / app_name
    manifest = read_json(base / "package.json")
    index = base / "src" / "index.ts"

    print(f"[{app_name}]")
    print(f"name={manifest.get('name')}")
    print(f"version={manifest.get('version')}")
    print(f"private={manifest.get('private')}")
    print(f"type={manifest.get('type')}")
    print(f"sdkDependency={(manifest.get('dependencies') or {}).get('@persian-braille/sdk')}")
    print(f"sourceFiles={count_source_files(base)}")
    print(f"testFiles={count_test_files(base)}")
    print(f"sdkReferences={count_imports(base, '@persian-braille/sdk')}")
    print(f"coreReferences={count_imports(base, '@persian-braille/core')}")
    if index.exists():
        print(f"index={index.read_text(encoding='utf-8').strip()!r}")
    print()
