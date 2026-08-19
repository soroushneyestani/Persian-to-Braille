import assert from "node:assert/strict";
import test from "node:test";

import {
  createOfficeWordRuntime,
} from "../dist/word/runtime.js";

import {
  createWordMusicInsertionService,
} from "../dist/word/music-insertion.js";

function runtimeStub(
  options = {},
) {
  const writes =
    [];

  return {
    writes,

    runtime: {
      isReady() {
        return (
          options.ready
          ?? true
        );
      },

      isWordHost() {
        return (
          options.wordHost
          ?? true
        );
      },

      supportsWordApi11() {
        return (
          options.supported
          ?? true
        );
      },

      async readSelectionText() {
        return "";
      },

      async replaceCurrentSelection(
        text,
      ) {
        if (
          options.writeThrows
        ) {
          throw new Error(
            "write failed",
          );
        }

        writes.push(
          text,
        );

        return "written";
      },

      async mutateSelection() {
        return "selection-changed";
      },
    },
  };
}

test(
  "Word Music insertion service writes the exact Unicode preview without recomputation",
  async () => {
    const {
      runtime,
      writes,
    } = runtimeStub();

    const service =
      createWordMusicInsertionService(
        runtime,
      );

    const preview =
      "⠼⠙⠲⠀⠐⠹⠱⠏";

    const result =
      await service
        .insertCurrentSelection(
          preview,
        );

    assert.deepEqual(
      result,
      {
        ok: true,
        unicodeBraille:
          preview,
      },
    );

    assert.deepEqual(
      writes,
      [
        preview,
      ],
    );
  },
);

test(
  "Word Music insertion service maps Office write exceptions to DOCUMENT_WRITE_FAILED",
  async () => {
    const {
      runtime,
    } =
      runtimeStub({
        writeThrows:
          true,
      });

    const service =
      createWordMusicInsertionService(
        runtime,
      );

    const result =
      await service
        .insertCurrentSelection(
          "⠹",
        );

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "DOCUMENT_WRITE_FAILED",
    );
  },
);

test(
  "Word Music insertion service preserves Word host readiness gates",
  async () => {
    for (
      const [
        options,
        expected,
      ]
      of [
        [
          {
            ready:
              false,
          },
          "OFFICE_NOT_READY",
        ],
        [
          {
            wordHost:
              false,
          },
          "WRONG_HOST",
        ],
        [
          {
            supported:
              false,
          },
          "UNSUPPORTED_REQUIREMENT_SET",
        ],
      ]
    ) {
      const {
        runtime,
      } =
        runtimeStub(
          options,
        );

      const result =
        await createWordMusicInsertionService(
          runtime,
        )
          .insertCurrentSelection(
            "⠹",
          );

      assert.equal(
        result.ok,
        false,
      );
      assert.equal(
        result.code,
        expected,
      );
    }
  },
);

test(
  "Office Word runtime inserts at the current selection with Replace and no stale-source read",
  async () => {
    const calls =
      [];

    const range = {
      text:
        "selected text",

      load(
        property,
      ) {
        calls.push(
          `load:${property}`,
        );
      },

      insertText(
        text,
        location,
      ) {
        calls.push(
          `insert:${location}:${text}`,
        );
      },
    };

    const globals = {
      Office: {
        context: {
          host:
            "Word",
          requirements: {
            isSetSupported(
              name,
              version,
            ) {
              return (
                name ===
                  "WordApi"
                && version ===
                  "1.1"
              );
            },
          },
        },

        HostType: {
          Word:
            "Word",
        },
      },

      Word: {
        async run(
          callback,
        ) {
          calls.push(
            "run",
          );

          return callback({
            document: {
              getSelection() {
                calls.push(
                  "getSelection",
                );

                return range;
              },
            },

            async sync() {
              calls.push(
                "sync",
              );
            },
          });
        },
      },
    };

    const runtime =
      createOfficeWordRuntime(
        globals,
      );

    const result =
      await runtime
        .replaceCurrentSelection(
          "⠼⠙⠲⠀⠐⠹⠱⠏",
        );

    assert.equal(
      result,
      "written",
    );

    assert.deepEqual(
      calls,
      [
        "run",
        "getSelection",
        "insert:Replace:⠼⠙⠲⠀⠐⠹⠱⠏",
        "sync",
      ],
    );

    assert.equal(
      calls.some(
        (value) =>
          value.startsWith(
            "load:",
          ),
      ),
      false,
    );
  },
);
