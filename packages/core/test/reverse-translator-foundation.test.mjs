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

const moduleUrl =
  pathToFileURL(
    path.join(
      root,
      "packages/core/dist/reverse-translator.js",
    ),
  ).href;

const {
  createReverseTranslator,
} = await import(moduleUrl);

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

const translations =
  records.filter(
    (record) =>
      record.kind
      === "translation",
  );

const capabilities =
  records.filter(
    (record) =>
      record.kind
      === "capability",
  );

test(
  "executes all Phase 13.3 reverse translation seeds",
  () => {
    assert.equal(
      translations.length,
      14,
    );

    for (const vector of translations) {
      const translator =
        createReverseTranslator();

      const result =
        translator.translate(
          vector.input.unicodeBraille,
          vector.options,
        );

      assert.equal(
        result.ok,
        vector.expected.ok,
        vector.id,
      );

      if (vector.expected.ok) {
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
          vector.expected.lossy,
          vector.id,
        );

        assert.deepEqual(
          result.diagnostics.map(
            (item) => item.code,
          ),
          vector.expected
            .diagnosticCodes,
          vector.id,
        );

        if (
          Array.isArray(
            vector.input.cells,
          )
        ) {
          assert.deepEqual(
            result.cells,
            vector.input.cells,
            vector.id,
          );
        }

        continue;
      }

      assert.equal(
        result.ok,
        false,
        vector.id,
      );

      assert.equal(
        result.code,
        vector.expected.code,
        vector.id,
      );

      if (
        vector.expected
          .candidateRuleIds
          ?.length > 0
      ) {
        assert.deepEqual(
          result.candidateRuleIds,
          vector.expected
            .candidateRuleIds,
          vector.id,
        );
      }

      if (
        vector.expected
          .candidateTexts
          ?.length > 0
      ) {
        assert.deepEqual(
          result.candidateTexts,
          vector.expected
            .candidateTexts,
          vector.id,
        );
      }
    }
  },
);

test(
  "preserves Phase 13.3 lossiness capability assertions",
  () => {
    assert.equal(
      capabilities.length,
      2,
    );

    for (const vector of capabilities) {
      assert.equal(
        vector.expected.supported,
        false,
        vector.id,
      );
    }
  },
);

test(
  "keeps reverse Core modules internal in Phase 13.4",
  async () => {
    const indexSource =
      await readFile(
        path.join(
          root,
          "packages/core/src/index.ts",
        ),
        "utf8",
      );

    assert.equal(
      indexSource.includes(
        "./reverse-translator.js",
      ),
      false,
    );

    assert.equal(
      indexSource.includes(
        "./reverse-translation.js",
      ),
      false,
    );
  },
);
