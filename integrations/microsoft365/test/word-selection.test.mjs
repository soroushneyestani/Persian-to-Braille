import assert from "node:assert/strict";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  createGlobalOfficeWordRuntime,
  createOfficeWordRuntime,
  createWordHostAdapter,
  createWordSelectionService,
} from "../dist/index.js";

function fakeRuntime(
  options = {},
) {
  const state = {
    selectedText:
      options.selectedText ??
      "سلام",
    ready:
      options.ready ??
      true,
    wordHost:
      options.wordHost ??
      true,
    supported:
      options.supported ??
      true,
    failRead:
      options.failRead ??
      false,
    failWrite:
      options.failWrite ??
      false,
    writes: [],
  };

  return {
    state,
    runtime: {
      isReady() {
        return state.ready;
      },
      isWordHost() {
        return state.wordHost;
      },
      supportsWordApi11() {
        return state.supported;
      },
      async readSelectionText() {
        if (state.failRead) {
          throw new Error(
            "synthetic read failure",
          );
        }

        return state.selectedText;
      },
      async mutateSelection(
        expectedSourceText,
        text,
        location,
      ) {
        if (state.failWrite) {
          throw new Error(
            "synthetic write failure",
          );
        }

        if (
          state.selectedText !==
          expectedSourceText
        ) {
          return "selection-changed";
        }

        state.writes.push({
          expectedSourceText,
          text,
          location,
        });

        if (
          location === "Replace"
        ) {
          state.selectedText =
            text;
        } else {
          state.selectedText =
            `${state.selectedText}${text}`;
        }

        return "written";
      },
    },
  };
}

test(
  "global runtime reports not ready outside an Office host",
  () => {
    const runtime =
      createGlobalOfficeWordRuntime();

    assert.equal(
      runtime.isReady(),
      false,
    );
  },
);

test(
  "host adapter preserves selected text verbatim",
  async () => {
    const source =
      "سلام\nمیان\u200Cخط";
    const {
      runtime,
    } =
      fakeRuntime({
        selectedText:
          source,
      });

    const adapter =
      createWordHostAdapter(
        runtime,
      );

    assert.deepEqual(
      await adapter
        .readSelection(),
      {
        ok: true,
        text: source,
      },
    );
  },
);

test(
  "host adapter rejects access before Office readiness",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        ready: false,
      });

    const result =
      await createWordHostAdapter(
        runtime,
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "OFFICE_NOT_READY",
    );
  },
);

test(
  "host adapter rejects non-Word Office hosts",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        wordHost: false,
      });

    const result =
      await createWordHostAdapter(
        runtime,
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "WRONG_HOST",
    );
  },
);

test(
  "host adapter enforces WordApi 1.1",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        supported: false,
      });

    const result =
      await createWordHostAdapter(
        runtime,
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "UNSUPPORTED_REQUIREMENT_SET",
    );
  },
);

test(
  "selection read failures remain host failures",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        failRead: true,
      });

    const result =
      await createWordHostAdapter(
        runtime,
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "SELECTION_UNAVAILABLE",
    );
  },
);

test(
  "selection service translates through the public SDK",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime();
    const translator =
      createPersianBrailleTranslator();
    const expected =
      translator.translate(
        "سلام",
      );

    const service =
      createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
        translator,
      );

    const result =
      await service
        .translateSelection();

    assert.equal(
      result.ok,
      true,
    );

    assert.deepEqual(
      result.translation,
      expected,
    );
    assert.equal(
      result.sourceText,
      "سلام",
    );
  },
);

test(
  "empty selection is an application failure, not an SDK or host failure",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        selectedText: "",
      });

    const result =
      await createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
      ).translateSelection();

    assert.deepEqual(
      result,
      {
        ok: false,
        source: "application",
        code: "EMPTY_SELECTION",
        message:
          "Select text in Word before translating.",
      },
    );
  },
);

test(
  "SDK translation failure remains a translation-domain result",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        selectedText: "😀",
      });
    const translator =
      createPersianBrailleTranslator();
    const expected =
      translator.translate(
        "😀",
      );

    const result =
      await createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
        translator,
      ).translateSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.source,
      "translation",
    );
    assert.deepEqual(
      result.translation,
      expected,
    );
  },
);

test(
  "current U+0622 behavior is delegated entirely to the SDK",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        selectedText: "آ",
      });
    const translator =
      createPersianBrailleTranslator();
    const expected =
      translator.translate(
        "آ",
      );

    const result =
      await createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
        translator,
      ).translateSelection();

    if (expected.ok) {
      assert.equal(
        result.ok,
        true,
      );
      assert.deepEqual(
        result.translation,
        expected,
      );
    } else {
      assert.equal(
        result.ok,
        false,
      );
      assert.equal(
        result.source,
        "translation",
      );
      assert.deepEqual(
        result.translation,
        expected,
      );
    }
  },
);

test(
  "replace writes the exact successful SDK Unicode Braille result",
  async () => {
    const {
      runtime,
      state,
    } =
      fakeRuntime();

    const service =
      createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(
      preview.ok,
      true,
    );

    const mutation =
      await service
        .replaceWithBraille(
          preview,
        );

    assert.deepEqual(
      mutation,
      { ok: true },
    );
    assert.equal(
      state.writes.length,
      1,
    );
    assert.equal(
      state.writes[0].location,
      "Replace",
    );
    assert.equal(
      state.writes[0].text,
      preview.translation
        .unicodeBraille,
    );
  },
);

test(
  "insert-after writes the exact successful SDK Unicode Braille result",
  async () => {
    const {
      runtime,
      state,
    } =
      fakeRuntime();

    const service =
      createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(
      preview.ok,
      true,
    );

    const mutation =
      await service
        .insertBrailleAfter(
          preview,
        );

    assert.deepEqual(
      mutation,
      { ok: true },
    );
    assert.equal(
      state.writes[0].location,
      "After",
    );
    assert.equal(
      state.writes[0].text,
      preview.translation
        .unicodeBraille,
    );
  },
);

test(
  "selection change blocks stale preview mutation",
  async () => {
    const {
      runtime,
      state,
    } =
      fakeRuntime();

    const service =
      createWordSelectionService(
        createWordHostAdapter(
          runtime,
        ),
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(
      preview.ok,
      true,
    );

    state.selectedText =
      "متن دیگر";

    const mutation =
      await service
        .replaceWithBraille(
          preview,
        );

    assert.equal(
      mutation.ok,
      false,
    );
    assert.equal(
      mutation.code,
      "SELECTION_CHANGED",
    );
    assert.equal(
      state.writes.length,
      0,
    );
  },
);

test(
  "document write exceptions map to DOCUMENT_WRITE_FAILED",
  async () => {
    const {
      runtime,
    } =
      fakeRuntime({
        failWrite: true,
      });

    const adapter =
      createWordHostAdapter(
        runtime,
      );

    const mutation =
      await adapter
        .replaceSelection(
          "سلام",
          "braille",
        );

    assert.equal(
      mutation.ok,
      false,
    );
    assert.equal(
      mutation.code,
      "DOCUMENT_WRITE_FAILED",
    );
  },
);

test(
  "Office runtime port uses Word.run, load/sync, and exact stale-selection guard",
  async () => {
    const events = [];
    let selectedText =
      "سلام";

    const globals = {
      Office: {
        HostType: {
          Word: "Word",
        },
        context: {
          host: "Word",
          requirements: {
            isSetSupported(
              name,
              version,
            ) {
              return (
                name === "WordApi" &&
                version === "1.1"
              );
            },
          },
        },
      },
      Word: {
        async run(callback) {
          const range = {
            get text() {
              return selectedText;
            },
            set text(value) {
              selectedText =
                value;
            },
            load(property) {
              events.push(
                `load:${property}`,
              );
            },
            insertText(
              text,
              location,
            ) {
              events.push(
                `insert:${location}:${text}`,
              );

              if (
                location ===
                "Replace"
              ) {
                selectedText =
                  text;
              } else {
                selectedText =
                  `${selectedText}${text}`;
              }
            },
          };

          return callback({
            document: {
              getSelection() {
                events.push(
                  "getSelection",
                );
                return range;
              },
            },
            async sync() {
              events.push(
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

    assert.equal(
      runtime.isReady(),
      true,
    );
    assert.equal(
      runtime.isWordHost(),
      true,
    );
    assert.equal(
      runtime.supportsWordApi11(),
      true,
    );

    assert.equal(
      await runtime
        .readSelectionText(),
      "سلام",
    );

    const written =
      await runtime
        .mutateSelection(
          "سلام",
          "⠎⠇⠁⠍",
          "Replace",
        );

    assert.equal(
      written,
      "written",
    );
    assert.equal(
      selectedText,
      "⠎⠇⠁⠍",
    );

    const blocked =
      await runtime
        .mutateSelection(
          "سلام",
          "never-written",
          "Replace",
        );

    assert.equal(
      blocked,
      "selection-changed",
    );
    assert.equal(
      events.includes(
        "insert:Replace:never-written",
      ),
      false,
    );
  },
);
