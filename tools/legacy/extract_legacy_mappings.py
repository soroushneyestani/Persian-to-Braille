from pathlib import Path
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "legacy/v1/data"
WORD = ROOT / "legacy/v1/source/vba/FarsiBrailleMaker.bas"
EXCEL = ROOT / "legacy/v1/source/vba/EnglishBrailleMaker.bas"
SQL = ROOT / "legacy/v1/database/Persian to Braille.sql"

def cp(s):
    return [f"U+{ord(c):04X}" for c in s]

def rec(i, source, target):
    return {
        "index": i,
        "source": source,
        "sourceCodePoints": cp(source),
        "target": target,
        "targetCodePoints": cp(target),
    }

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()

def dump(name, value):
    path = DATA / name
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return path

def decode_sql():
    raw = SQL.read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp1256", "latin-1"):
        try:
            return raw.decode(enc), enc
        except UnicodeDecodeError:
            pass
    raise RuntimeError("Unable to decode legacy SQL.")

def unique(mappings, label):
    seen = set()
    for item in mappings:
        if item["source"] in seen:
            raise RuntimeError(f"Duplicate {label} source: {item['source']!r}")
        seen.add(item["source"])

DATA.mkdir(parents=True, exist_ok=True)

# Word VBA is a recovered Windows-1256 file.
word_text = WORD.read_bytes().decode("cp1256")
word_pairs = re.findall(
    r'\.Text\s*=\s*"([^"]*)"\s*\r?\n\s*\.Replacement\.Text\s*=\s*"([^"]*)"',
    word_text,
)
word = [rec(i, s, t) for i, (s, t) in enumerate(word_pairs, 1)]

# Excel VBA stores Persian input as ChrW(codepoint), so the file itself is ASCII.
excel_text = EXCEL.read_text(encoding="ascii")
excel_pairs = [
    (chr(int(n)), target)
    for n, target in re.findall(
        r'Cells\.Replace\s+What:=ChrW\((\d+)\),\s*Replacement:="([^"]*)"',
        excel_text,
        re.I,
    )
]
excel_pairs += re.findall(
    r'Cells\.Replace\s+What:="([^"]*)",\s*Replacement:="([^"]*)"',
    excel_text,
    re.I,
)
excel = [rec(i, s, t) for i, (s, t) in enumerate(excel_pairs, 1)]

# Preserve SQL values exactly, including historical whitespace/oddities.
sql_text, sql_encoding = decode_sql()
sql_pairs = []
row = re.compile(r"^\s*\(\s*'(.*?)'\s*,\s*'(.*?)'\s*\)\s*[,;]?\s*$")
for line in sql_text.splitlines():
    match = row.match(line)
    if match:
        sql_pairs.append((match.group(1), match.group(2)))
sql = [rec(i, s, t) for i, (s, t) in enumerate(sql_pairs, 1)]

if len(word) != 46:
    raise RuntimeError(f"Expected 46 Word mappings, found {len(word)}")
if len(excel) != 46:
    raise RuntimeError(f"Expected 46 Excel mappings, found {len(excel)}")
if not sql:
    raise RuntimeError("No SQL mappings extracted.")

unique(word, "Word")
unique(excel, "Excel")
unique(sql, "SQL")

word_by = {item["source"]: item["target"] for item in word}
excel_by = {item["source"]: item["target"] for item in excel}
sql_by = {item["source"]: item["target"] for item in sql}

rows = []
summary = {
    "allThreeExactMatch": 0,
    "conflict": 0,
    "partialExactMatch": 0,
    "singleSourceOnly": 0,
}

for source in sorted(
    set(word_by) | set(excel_by) | set(sql_by),
    key=lambda value: tuple(map(ord, value)),
):
    values = {
        "word": word_by.get(source),
        "excel": excel_by.get(source),
        "sql": sql_by.get(source),
    }
    present = [value for value in values.values() if value is not None]
    distinct = set(present)

    if len(present) == 3 and len(distinct) == 1:
        status = "all-three-exact-match"
        summary["allThreeExactMatch"] += 1
    elif len(distinct) > 1:
        status = "conflict"
        summary["conflict"] += 1
    elif len(present) >= 2:
        status = "partial-exact-match"
        summary["partialExactMatch"] += 1
    else:
        status = "single-source-only"
        summary["singleSourceOnly"] += 1

    rows.append({
        "source": source,
        "sourceCodePoints": cp(source),
        **values,
        "status": status,
    })

word_file = dump("word-mappings.json", {
    "schemaVersion": 1,
    "mappingCount": len(word),
    "mappings": word,
})
excel_file = dump("excel-mappings.json", {
    "schemaVersion": 1,
    "mappingCount": len(excel),
    "mappings": excel,
})
sql_file = dump("sql-mappings.json", {
    "schemaVersion": 1,
    "sourceEncoding": sql_encoding,
    "mappingCount": len(sql),
    "mappings": sql,
})
comparison_file = dump("mapping-comparison.json", {
    "schemaVersion": 1,
    "comparisonMode": "exact-legacy-value",
    "summary": {"uniqueSources": len(rows), **summary},
    "rows": rows,
})

manifest = {
    "schemaVersion": 1,
    "inputs": {
        "wordVba": {"sha256": sha(WORD), "mappingCount": len(word)},
        "excelVba": {"sha256": sha(EXCEL), "mappingCount": len(excel)},
        "sql": {"sha256": sha(SQL), "mappingCount": len(sql)},
    },
    "generated": [
        {"path": path.relative_to(ROOT).as_posix(), "sha256": sha(path)}
        for path in (word_file, excel_file, sql_file, comparison_file)
    ],
}
dump("manifest.json", manifest)

print("Legacy mapping extraction completed.")
print(f"Word VBA : {len(word)}")
print(f"Excel VBA: {len(excel)}")
print(f"SQL      : {len(sql)}")
print(json.dumps(summary, indent=2))

for item in rows:
    if item["status"] == "conflict":
        print(
            "CONFLICT:",
            repr(item["source"]),
            "Word=", repr(item["word"]),
            "Excel=", repr(item["excel"]),
            "SQL=", repr(item["sql"]),
        )
