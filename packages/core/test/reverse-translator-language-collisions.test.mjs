import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");

const { createReverseTranslator } = await import(
  pathToFileURL(
    path.join(root, "packages/core/dist/reverse-translator.js"),
  ).href
);

const recordDir = path.join(
  root,
  "spec/fa-ir/reverse/conformance/records",
);

const names = (await readdir(recordDir))
  .filter((name) => name.endsWith(".json"))
  .sort();

const records = await Promise.all(
  names.map(async (name) =>
    JSON.parse(
      await readFile(path.join(recordDir, name), "utf8"),
    ),
  ),
);

const phaseRecords = records.filter(
  (record) =>
    record.id.startsWith("FA-REV-CONF-COLLISION-LANGUAGE-")
    || record.id.startsWith("FA-REV-CONF-OVERLAP-PERCENT-LATIN-"),
);

test(
  "executes Phase 13.5c-3a language-mode collision conformance",
  () => {
    assert.equal(phaseRecords.length, 68);

    for (const vector of phaseRecords) {
      const result =
        createReverseTranslator().translate(
          vector.input.unicodeBraille,
          vector.options,
        );

      assert.equal(result.ok, vector.expected.ok, vector.id);

      if (vector.expected.ok) {
        assert.equal(result.text, vector.expected.text, vector.id);
        assert.equal(result.lossy, vector.expected.lossy, vector.id);
        assert.deepEqual(
          result.diagnostics.map((item) => item.code),
          vector.expected.diagnosticCodes,
          vector.id,
        );
        assert.deepEqual(result.cells, vector.input.cells, vector.id);
        continue;
      }

      assert.equal(result.code, vector.expected.code, vector.id);

      if (Array.isArray(vector.expected.candidateRuleIds)) {
        assert.deepEqual(
          result.candidateRuleIds,
          vector.expected.candidateRuleIds,
          vector.id,
        );
      }

      if (Array.isArray(vector.expected.candidateTexts)) {
        assert.deepEqual(
          result.candidateTexts,
          vector.expected.candidateTexts,
          vector.id,
        );
      }
    }
  },
);
