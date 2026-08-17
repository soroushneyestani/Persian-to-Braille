import assert from "node:assert/strict";
import {
  readdir,
  readFile,
} from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";
import test from "node:test";

const here =
  path.dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const root =
  path.resolve(
    here,
    "../../..",
  );

const {
  createReverseTranslator,
} = await import(
  pathToFileURL(
    path.join(
      root,
      "packages/core/dist/reverse-translator.js",
    ),
  ).href
);

const recordDir =
  path.join(
    root,
    "spec/fa-ir/reverse/conformance/records",
  );

const names =
  (
    await readdir(recordDir)
  )
  .filter(
    (name) =>
      name.endsWith(".json"),
  )
  .sort();

const records =
  await Promise.all(
    names.map(
      async (name) =>
        JSON.parse(
          await readFile(
            path.join(
              recordDir,
              name,
            ),
            "utf8",
          ),
        ),
    ),
  );

const coverageRecords =
  records.filter(
    (record) =>
      record.id.startsWith(
        "FA-REV-CONF-COVERAGE-",
      ),
  );

test(
  "executes Phase 13.5b direct and unique-parser coverage vectors",
  () => {
    assert.equal(
      coverageRecords.length,
      19,
    );

    for (
      const vector
      of coverageRecords
    ) {
      assert.equal(
        vector.kind,
        "translation",
        vector.id,
      );

      const translator =
        createReverseTranslator();

      const result =
        translator.translate(
          vector.input.unicodeBraille,
          vector.options,
        );

      assert.equal(
        result.ok,
        true,
        vector.id,
      );

      assert.equal(
        result.text,
        vector.expected.text,
        vector.id,
      );

      assert.equal(
        result.lossy,
        false,
        vector.id,
      );

      assert.deepEqual(
        result.diagnostics.map(
          (item) => item.code,
        ),
        [],
        vector.id,
      );

      assert.deepEqual(
        result.cells,
        vector.input.cells,
        vector.id,
      );
    }
  },
);
