import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  createPlaygroundController,
  projectTranslationResult,
} from "../dist/index.js";

const here =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );
const appDir =
  resolve(
    here,
    "..",
  );

function fakeView(
  input = "سلام",
) {
  const state = {
    input,
    profile: null,
    result: null,
    copyFeedback: "",
    clearCount: 0,
    focusCount: 0,
  };

  return {
    state,
    view: {
      readInput() {
        return state.input;
      },
      writeInput(value) {
        state.input = value;
      },
      renderProfile(profile) {
        state.profile = profile;
      },
      renderResult(result) {
        state.result = result;
      },
      clearResult() {
        state.result = null;
        state.clearCount += 1;
      },
      renderCopyFeedback(message) {
        state.copyFeedback = message;
      },
      focusInput() {
        state.focusCount += 1;
      },
    },
  };
}

test(
  "projects an SDK success without recomputing public values",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const result =
      translator.translate(
        "سلام",
      );

    assert.equal(
      result.ok,
      true,
    );

    const projected =
      projectTranslationResult(
        result,
      );

    assert.deepEqual(
      projected,
      {
        ok: true,
        unicodeBraille:
          result.unicodeBraille,
        cells:
          result.cells,
        normalizedText:
          result.normalizedText,
        structuralTokens:
          result.structuralTokens,
        errorCode: "",
        errorMessage: "",
        errorDetails: [],
      },
    );
  },
);

test(
  "projects an SDK failure with the public failure code",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const result =
      translator.translate(
        "😀",
      );

    assert.equal(
      result.ok,
      false,
    );

    const projected =
      projectTranslationResult(
        result,
      );

    assert.equal(
      projected.ok,
      false,
    );
    assert.equal(
      projected.errorCode,
      result.code,
    );
    assert.equal(
      projected.errorMessage,
      result.message,
    );
  },
);

test(
  "renders bundled profile metadata immediately",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const {
      state,
      view,
    } = fakeView();

    createPlaygroundController(
      translator,
      view,
      {
        async writeText() {},
      },
    );

    assert.deepEqual(
      state.profile,
      translator.profile,
    );
    assert.equal(
      state.profile.status,
      "draft",
    );
  },
);

test(
  "translates view input through the public SDK",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const expected =
      translator.translate(
        "سلام",
      );
    const {
      state,
      view,
    } = fakeView(
      "سلام",
    );

    const controller =
      createPlaygroundController(
        translator,
        view,
        {
          async writeText() {},
        },
      );

    controller.translate();

    assert.equal(
      state.result.ok,
      true,
    );
    assert.equal(
      state.result.unicodeBraille,
      expected.unicodeBraille,
    );
    assert.deepEqual(
      state.result.cells,
      expected.cells,
    );
  },
);

test(
  "renders translation failures without throwing",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const {
      state,
      view,
    } = fakeView(
      "😀",
    );

    const controller =
      createPlaygroundController(
        translator,
        view,
        {
          async writeText() {},
        },
      );

    controller.translate();

    assert.equal(
      state.result.ok,
      false,
    );
    assert.equal(
      state.result.errorCode,
      "UNKNOWN_CHARACTER",
    );
  },
);

test(
  "copies the last successful Unicode Braille output",
  async () => {
    const translator =
      createPersianBrailleTranslator();
    const expected =
      translator.translate(
        "سلام",
      );
    const copied = [];
    const {
      state,
      view,
    } = fakeView(
      "سلام",
    );

    const controller =
      createPlaygroundController(
        translator,
        view,
        {
          async writeText(text) {
            copied.push(text);
          },
        },
      );

    controller.translate();
    await controller
      .copyUnicodeBraille();

    assert.equal(
      copied.length,
      1,
    );
    assert.equal(
      copied[0],
      expected.unicodeBraille,
    );
    assert.equal(
      state.copyFeedback,
      "Braille output copied.",
    );
  },
);

test(
  "does not copy stale output after a failure",
  async () => {
    const translator =
      createPersianBrailleTranslator();
    const copied = [];
    const {
      state,
      view,
    } = fakeView(
      "سلام",
    );

    const controller =
      createPlaygroundController(
        translator,
        view,
        {
          async writeText(text) {
            copied.push(text);
          },
        },
      );

    controller.translate();
    state.input = "😀";
    controller.translate();
    await controller
      .copyUnicodeBraille();

    assert.deepEqual(
      copied,
      [],
    );
    assert.equal(
      state.copyFeedback,
      "Nothing to copy yet.",
    );
  },
);

test(
  "reports clipboard failure accessibly through view feedback",
  async () => {
    const translator =
      createPersianBrailleTranslator();
    const {
      state,
      view,
    } = fakeView();

    const controller =
      createPlaygroundController(
        translator,
        view,
        {
          async writeText() {
            throw new Error(
              "synthetic clipboard failure",
            );
          },
        },
      );

    controller.translate();
    await controller
      .copyUnicodeBraille();

    assert.match(
      state.copyFeedback,
      /Copy failed/,
    );
  },
);

test(
  "clear removes input/result/copy state and returns focus",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const {
      state,
      view,
    } = fakeView();

    const controller =
      createPlaygroundController(
        translator,
        view,
        {
          async writeText() {},
        },
      );

    controller.translate();
    controller.clear();

    assert.equal(
      state.input,
      "",
    );
    assert.equal(
      state.result,
      null,
    );
    assert.equal(
      state.copyFeedback,
      "",
    );
    assert.equal(
      state.clearCount,
      1,
    );
    assert.equal(
      state.focusCount,
      1,
    );
  },
);

test(
  "static build contains required accessible controls and status regions",
  async () => {
    const html =
      await readFile(
        resolve(
          appDir,
          "dist/index.html",
        ),
        "utf8",
      );

    for (
      const id of [
        "print-text-input",
        "translate",
        "clear",
        "copy-unicode-braille",
        "unicode-braille",
        "cells",
        "profile-id",
        "profile-version",
        "profile-status",
        "profile-direction",
        "normalized-text",
        "structural-tokens",
        "translation-error",
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          `id="${id}"`,
        ),
      );
    }

    assert.match(
      html,
      /<label for="print-text-input">/,
    );
    assert.match(
      html,
      /role="alert"/,
    );
    assert.match(
      html,
      /aria-live="assertive"/,
    );
    assert.match(
      html,
      /role="status"/,
    );
  },
);

test(
  "static browser entry uses import maps for SDK/Core package boundaries",
  async () => {
    const html =
      await readFile(
        resolve(
          appDir,
          "dist/index.html",
        ),
        "utf8",
      );

    assert.match(
      html,
      /type="importmap"/,
    );
    assert.match(
      html,
      /"@persian-braille\/sdk": "\.\/vendor\/sdk\/index\.js"/,
    );
    assert.match(
      html,
      /"@persian-braille\/core": "\.\/vendor\/core\/index\.js"/,
    );
    assert.match(
      html,
      /type="module" src="\.\/main\.js"/,
    );
  },
);

test(
  "static build vendors compiled SDK and Core without a translation backend",
  async () => {
    const [
      sdkIndex,
      coreIndex,
      buildInfo,
    ] =
      await Promise.all([
        readFile(
          resolve(
            appDir,
            "dist/vendor/sdk/index.js",
          ),
          "utf8",
        ),
        readFile(
          resolve(
            appDir,
            "dist/vendor/core/index.js",
          ),
          "utf8",
        ),
        readFile(
          resolve(
            appDir,
            "dist/build-info.json",
          ),
          "utf8",
        ),
      ]);

    assert.ok(
      sdkIndex.length > 0,
    );
    assert.ok(
      coreIndex.length > 0,
    );

    assert.deepEqual(
      JSON.parse(
        buildInfo,
      ),
      {
        application:
          "@persian-braille/web",
        runtime:
          "browser-local",
        translationNetworkRequests:
          false,
        inputPersistence:
          "none",
      },
    );
  },
);

test(
  "public page declares local translation privacy and draft lifecycle disclosure",
  async () => {
    const html =
      await readFile(
        resolve(
          appDir,
          "dist/index.html",
        ),
        "utf8",
      );

    assert.match(
      html,
      /not sent to a translation server/i,
    );
    assert.match(
      html,
      /currently draft/i,
    );
    assert.doesNotMatch(
      html,
      /localStorage|sessionStorage/,
    );
  },
);
