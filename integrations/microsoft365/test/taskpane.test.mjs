import assert from "node:assert/strict";
import {
  readFile,
  stat,
} from "node:fs/promises";
import test from "node:test";

import {
  createWordTaskPaneController,
} from "../dist/taskpane/controller.js";

function successPreview(
  overrides = {},
) {
  return {
    ok: true,
    sourceText:
      overrides.sourceText ??
      "سلام",
    translation: {
      ok: true,
      unicodeBraille:
        overrides.unicodeBraille ??
        "⠎⠇⠁⠍",
      cells:
        overrides.cells ??
        [
          "234",
          "123",
          "1",
          "134",
        ],
      normalizedText:
        overrides.normalizedText ??
        "سلام",
      structuralTokens:
        overrides.structuralTokens ??
        [],
    },
  };
}

function fakeView() {
  const events = [];

  return {
    events,
    view: {
      setReady(value) {
        events.push({
          type: "ready",
          value,
        });
      },
      setBusy(value) {
        events.push({
          type: "busy",
          value,
        });
      },
      showIdle(message) {
        events.push({
          type: "idle",
          message,
        });
      },
      showSuccess(
        presentation,
      ) {
        events.push({
          type: "success",
          presentation,
        });
      },
      showFailure(
        presentation,
      ) {
        events.push({
          type: "failure",
          presentation,
        });
      },
      announce(message) {
        events.push({
          type: "announce",
          message,
        });
      },
    },
  };
}

function fakeService(
  translateResult,
) {
  const calls = {
    replace: [],
    insert: [],
  };

  return {
    calls,
    service: {
      translator: {},
      async translateSelection() {
        return translateResult;
      },
      async replaceWithBraille(
        preview,
      ) {
        calls.replace.push(
          preview,
        );
        return {
          ok: true,
        };
      },
      async insertBrailleAfter(
        preview,
      ) {
        calls.insert.push(
          preview,
        );
        return {
          ok: true,
        };
      },
    },
  };
}

test(
  "controller initializes the Word task pane",
  () => {
    const {
      view,
      events,
    } =
      fakeView();
    const {
      service,
    } =
      fakeService(
        successPreview(),
      );

    createWordTaskPaneController(
      service,
      view,
      {
        async writeText() {},
      },
    ).initialize();

    assert.deepEqual(
      events[0],
      {
        type: "ready",
        value: true,
      },
    );
  },
);

test(
  "successful selection translation renders only the public projection",
  async () => {
    const preview =
      successPreview();
    const {
      service,
    } =
      fakeService(
        preview,
      );
    const {
      view,
      events,
    } =
      fakeView();

    await createWordTaskPaneController(
      service,
      view,
      {
        async writeText() {},
      },
    ).translateSelection();

    const success =
      events.find(
        (event) =>
          event.type ===
          "success",
      );

    assert.deepEqual(
      success.presentation,
      {
        sourceText: "سلام",
        unicodeBraille:
          "⠎⠇⠁⠍",
        cells:
          "234 123 1 134",
        normalizedText:
          "سلام",
        structuralTokens:
          "",
      },
    );
  },
);

test(
  "host selection failure remains a host-domain UI failure",
  async () => {
    const {
      service,
    } =
      fakeService({
        ok: false,
        source: "host",
        failure: {
          ok: false,
          domain: "host",
          code:
            "SELECTION_UNAVAILABLE",
          message:
            "Synthetic host failure",
        },
      });
    const {
      view,
      events,
    } =
      fakeView();

    await createWordTaskPaneController(
      service,
      view,
      {
        async writeText() {},
      },
    ).translateSelection();

    const failure =
      events.find(
        (event) =>
          event.type ===
          "failure",
      );

    assert.equal(
      failure.presentation.domain,
      "host",
    );
    assert.equal(
      failure.presentation.code,
      "SELECTION_UNAVAILABLE",
    );
  },
);

test(
  "empty selection remains an application-domain UI failure",
  async () => {
    const {
      service,
    } =
      fakeService({
        ok: false,
        source:
          "application",
        code:
          "EMPTY_SELECTION",
        message:
          "Select text in Word before translating.",
      });
    const {
      view,
      events,
    } =
      fakeView();

    await createWordTaskPaneController(
      service,
      view,
      {
        async writeText() {},
      },
    ).translateSelection();

    const failure =
      events.find(
        (event) =>
          event.type ===
          "failure",
      );

    assert.equal(
      failure.presentation.domain,
      "application",
    );
    assert.equal(
      failure.presentation.code,
      "EMPTY_SELECTION",
    );
  },
);

test(
  "SDK failures are projected without inventing Word translation semantics",
  async () => {
    const {
      service,
    } =
      fakeService({
        ok: false,
        source:
          "translation",
        sourceText: "😀",
        translation: {
          ok: false,
          error: {
            code:
              "UNKNOWN_CHARACTER",
            message:
              "Synthetic SDK failure",
          },
        },
      });
    const {
      view,
      events,
    } =
      fakeView();

    await createWordTaskPaneController(
      service,
      view,
      {
        async writeText() {},
      },
    ).translateSelection();

    const failure =
      events.find(
        (event) =>
          event.type ===
          "failure",
      );

    assert.equal(
      failure.presentation.domain,
      "translation",
    );
    assert.equal(
      failure.presentation.code,
      "UNKNOWN_CHARACTER",
    );
  },
);

test(
  "copy writes the exact SDK Unicode Braille result",
  async () => {
    const preview =
      successPreview();
    const {
      service,
    } =
      fakeService(
        preview,
      );
    const {
      view,
    } =
      fakeView();

    const copied = [];

    const controller =
      createWordTaskPaneController(
        service,
        view,
        {
          async writeText(text) {
            copied.push(text);
          },
        },
      );

    await controller
      .translateSelection();
    await controller
      .copyBraille();

    assert.deepEqual(
      copied,
      [
        preview.translation
          .unicodeBraille,
      ],
    );
  },
);

test(
  "clipboard failure is surfaced without changing translation semantics",
  async () => {
    const {
      service,
    } =
      fakeService(
        successPreview(),
      );
    const {
      view,
      events,
    } =
      fakeView();

    const controller =
      createWordTaskPaneController(
        service,
        view,
        {
          async writeText() {
            throw new Error(
              "synthetic clipboard failure",
            );
          },
        },
      );

    await controller
      .translateSelection();
    await controller
      .copyBraille();

    const failure =
      events.findLast(
        (event) =>
          event.type ===
          "failure",
      );

    assert.equal(
      failure.presentation.domain,
      "clipboard",
    );
    assert.equal(
      failure.presentation.code,
      "CLIPBOARD_WRITE_FAILED",
    );
  },
);

test(
  "replace delegates the exact successful preview to the selection service",
  async () => {
    const preview =
      successPreview();
    const {
      service,
      calls,
    } =
      fakeService(
        preview,
      );
    const {
      view,
    } =
      fakeView();

    const controller =
      createWordTaskPaneController(
        service,
        view,
        {
          async writeText() {},
        },
      );

    await controller
      .translateSelection();
    await controller
      .replaceSelection();

    assert.equal(
      calls.replace.length,
      1,
    );
    assert.equal(
      calls.replace[0],
      preview,
    );
  },
);

test(
  "insert-after delegates the exact successful preview to the selection service",
  async () => {
    const preview =
      successPreview();
    const {
      service,
      calls,
    } =
      fakeService(
        preview,
      );
    const {
      view,
    } =
      fakeView();

    const controller =
      createWordTaskPaneController(
        service,
        view,
        {
          async writeText() {},
        },
      );

    await controller
      .translateSelection();
    await controller
      .insertAfterSelection();

    assert.equal(
      calls.insert.length,
      1,
    );
    assert.equal(
      calls.insert[0],
      preview,
    );
  },
);

test(
  "failed Word mutation remains a host-domain UI failure",
  async () => {
    const preview =
      successPreview();
    const {
      service,
    } =
      fakeService(
        preview,
      );

    service.replaceWithBraille =
      async () => ({
        ok: false,
        domain: "host",
        code:
          "SELECTION_CHANGED",
        message:
          "Synthetic selection change",
      });

    const {
      view,
      events,
    } =
      fakeView();

    const controller =
      createWordTaskPaneController(
        service,
        view,
        {
          async writeText() {},
        },
      );

    await controller
      .translateSelection();
    await controller
      .replaceSelection();

    const failure =
      events.findLast(
        (event) =>
          event.type ===
          "failure",
      );

    assert.equal(
      failure.presentation.domain,
      "host",
    );
    assert.equal(
      failure.presentation.code,
      "SELECTION_CHANGED",
    );
  },
);

test(
  "task pane references production Office.js CDN and public SDK import map",
  async () => {
    const html =
      await readFile(
        new URL(
          "../public/taskpane.html",
          import.meta.url,
        ),
        "utf8",
      );

    assert.match(
      html,
      /appsforoffice\.microsoft\.com\/lib\/1\/hosted\/office\.js/,
    );
    assert.match(
      html,
      /"@persian-braille\/sdk": "\.\/vendor\/sdk\/index\.js"/,
    );
  },
);

test(
  "manifest defines one Word Home ribbon task-pane command",
  async () => {
    const manifest =
      await readFile(
        new URL(
          "../manifest.xml",
          import.meta.url,
        ),
        "utf8",
      );

    assert.match(
      manifest,
      /<Host Name="Document"\/>/,
    );
    assert.match(
      manifest,
      /<OfficeTab id="TabHome">/,
    );
    assert.match(
      manifest,
      /xsi:type="ShowTaskpane"/,
    );
    assert.match(
      manifest,
      /Translate Selection/,
    );
    assert.match(
      manifest,
      /WordApi" MinVersion="1\.1"/,
    );
  },
);

test(
  "static build materializes task pane, SDK, Core, and Office command icons",
  async () => {
    for (
      const relative of
      [
        "../addin-dist/taskpane.html",
        "../addin-dist/app/taskpane/main.js",
        "../addin-dist/vendor/sdk/index.js",
        "../addin-dist/vendor/core/index.js",
        "../addin-dist/assets/icon-16.png",
        "../addin-dist/assets/icon-32.png",
        "../addin-dist/assets/icon-80.png",
      ]
    ) {
      const metadata =
        await stat(
          new URL(
            relative,
            import.meta.url,
          ),
        );

      assert.equal(
        metadata.isFile(),
        true,
        relative,
      );
    }
  },
);

test(
  "task-pane readiness rejects a standalone browser outside Office",
  async () => {
    const {
      evaluateWordTaskPaneReadiness,
    } =
      await import(
        "../dist/taskpane/readiness.js"
      );

    const result =
      evaluateWordTaskPaneReadiness(
        {
          host: null,
          platform: null,
        },
        {
          isReady() {
            return false;
          },
          isWordHost() {
            return false;
          },
          supportsWordApi11() {
            return false;
          },
          async readSelectionText() {
            return "";
          },
          async mutateSelection() {
            return "selection-changed";
          },
        },
      );

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
  "task-pane readiness rejects a non-Word Office host",
  async () => {
    const {
      evaluateWordTaskPaneReadiness,
    } =
      await import(
        "../dist/taskpane/readiness.js"
      );

    const result =
      evaluateWordTaskPaneReadiness(
        {
          host: "Excel",
          platform: "PC",
        },
        {
          isReady() {
            return false;
          },
          isWordHost() {
            return false;
          },
          supportsWordApi11() {
            return false;
          },
          async readSelectionText() {
            return "";
          },
          async mutateSelection() {
            return "selection-changed";
          },
        },
      );

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
  "task-pane readiness requires the Word runtime after Office.onReady",
  async () => {
    const {
      evaluateWordTaskPaneReadiness,
    } =
      await import(
        "../dist/taskpane/readiness.js"
      );

    const result =
      evaluateWordTaskPaneReadiness(
        {
          host: "Word",
          platform: "PC",
        },
        {
          isReady() {
            return false;
          },
          isWordHost() {
            return true;
          },
          supportsWordApi11() {
            return true;
          },
          async readSelectionText() {
            return "";
          },
          async mutateSelection() {
            return "selection-changed";
          },
        },
      );

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
  "task-pane readiness accepts a supported Word runtime",
  async () => {
    const {
      evaluateWordTaskPaneReadiness,
    } =
      await import(
        "../dist/taskpane/readiness.js"
      );

    const result =
      evaluateWordTaskPaneReadiness(
        {
          host: "Word",
          platform: "PC",
        },
        {
          isReady() {
            return true;
          },
          isWordHost() {
            return true;
          },
          supportsWordApi11() {
            return true;
          },
          async readSelectionText() {
            return "";
          },
          async mutateSelection() {
            return "written";
          },
        },
      );

    assert.deepEqual(
      result,
      {
        ok: true,
      },
    );
  },
);

test(
  "preview command builds the Microsoft 365 dependency closure from a clean workspace",
  async () => {
    const packageJson =
      JSON.parse(
        await readFile(
          new URL(
            "../package.json",
            import.meta.url,
          ),
          "utf8",
        ),
      );

    assert.equal(
      packageJson.scripts.preview,
      "pnpm --filter @persian-braille/microsoft365... run build && node preview-addin.mjs",
    );
  },
);

// Phase 10.3b shared task-pane / Excel dispatch regression.
test(
  "shared task-pane controller initializes Excel with replace-only capabilities",
  async () => {
    const {
      createOfficeTaskPaneController,
    } =
      await import(
        "../dist/taskpane/controller.js"
      );
    const {
      EXCEL_TASK_PANE_CAPABILITIES,
    } =
      await import(
        "../dist/taskpane/host-config.js"
      );

    const events = [];
    const replaced = [];
    const preview = {
      ...successPreview(),
      mutationContext: {
        address:
          "Sheet1!A1",
        rowCount: 1,
        columnCount: 1,
        valueType:
          "String",
        rawValue:
          "سلام",
        formulaProjection:
          "سلام",
      },
    };

    const service = {
      translator: {},
      async translateSelection() {
        return preview;
      },
      async replaceWithBraille(
        current,
      ) {
        replaced.push(
          current,
        );
        return {
          ok: true,
        };
      },
    };

    const view = {
      setCapabilities(
        capabilities,
      ) {
        events.push({
          type:
            "capabilities",
          capabilities,
        });
      },
      setReady(value) {
        events.push({
          type: "ready",
          value,
        });
      },
      setBusy(value) {
        events.push({
          type: "busy",
          value,
        });
      },
      showIdle(message) {
        events.push({
          type: "idle",
          message,
        });
      },
      showSuccess(
        presentation,
      ) {
        events.push({
          type: "success",
          presentation,
        });
      },
      showFailure(
        presentation,
      ) {
        events.push({
          type: "failure",
          presentation,
        });
      },
      announce(message) {
        events.push({
          type: "announce",
          message,
        });
      },
    };

    const controller =
      createOfficeTaskPaneController(
        service,
        view,
        {
          async writeText() {},
        },
        EXCEL_TASK_PANE_CAPABILITIES,
      );

    controller.initialize();

    assert.equal(
      events[0]
        .capabilities
        .hostKind,
      "excel",
    );
    assert.equal(
      events[0]
        .capabilities
        .canInsertAfter,
      false,
    );

    await controller
      .translateSelection();
    await controller
      .replaceSelection();

    assert.equal(
      replaced.length,
      1,
    );
    assert.equal(
      replaced[0],
      preview,
    );
  },
);

test(
  "shared task-pane controller rejects Insert After for Excel",
  async () => {
    const {
      createOfficeTaskPaneController,
    } =
      await import(
        "../dist/taskpane/controller.js"
      );
    const {
      EXCEL_TASK_PANE_CAPABILITIES,
    } =
      await import(
        "../dist/taskpane/host-config.js"
      );

    const events = [];
    const service = {
      translator: {},
      async translateSelection() {
        return {
          ...successPreview(),
          mutationContext: {
            address:
              "Sheet1!A1",
          },
        };
      },
      async replaceWithBraille() {
        return {
          ok: true,
        };
      },
    };

    const view = {
      setCapabilities() {},
      setReady() {},
      setBusy() {},
      showIdle() {},
      showSuccess() {},
      showFailure(
        presentation,
      ) {
        events.push(
          presentation,
        );
      },
      announce() {},
    };

    const controller =
      createOfficeTaskPaneController(
        service,
        view,
        {
          async writeText() {},
        },
        EXCEL_TASK_PANE_CAPABILITIES,
      );

    await controller
      .translateSelection();
    await controller
      .insertAfterSelection();

    assert.equal(
      events.length,
      1,
    );
    assert.equal(
      events[0].domain,
      "application",
    );
    assert.equal(
      events[0].code,
      "ACTION_UNSUPPORTED",
    );
  },
);

test(
  "shared task-pane readiness accepts a supported Excel runtime",
  async () => {
    const {
      evaluateOfficeTaskPaneReadiness,
    } =
      await import(
        "../dist/taskpane/readiness.js"
      );

    const result =
      evaluateOfficeTaskPaneReadiness(
        {
          host: "Excel",
          platform: "PC",
        },
        {
          isReady() {
            return false;
          },
          isWordHost() {
            return false;
          },
          supportsWordApi11() {
            return false;
          },
          async readSelectionText() {
            return "";
          },
          async mutateSelection() {
            return "selection-changed";
          },
        },
        {
          isReady() {
            return true;
          },
          isExcelHost() {
            return true;
          },
          supportsExcelApi11() {
            return true;
          },
          async readSelectionSnapshot() {
            throw new Error(
              "not used",
            );
          },
          async replaceSelectedCell() {
            return "selection-changed";
          },
        },
      );

    assert.equal(
      result.ok,
      true,
    );
    assert.equal(
      result.hostKind,
      "excel",
    );
    assert.equal(
      result.capabilities
        .canReplace,
      true,
    );
    assert.equal(
      result.capabilities
        .canInsertAfter,
      false,
    );
  },
);

test(
  "shared task-pane readiness preserves supported Word dispatch",
  async () => {
    const {
      evaluateOfficeTaskPaneReadiness,
    } =
      await import(
        "../dist/taskpane/readiness.js"
      );

    const result =
      evaluateOfficeTaskPaneReadiness(
        {
          host: "Word",
          platform: "PC",
        },
        {
          isReady() {
            return true;
          },
          isWordHost() {
            return true;
          },
          supportsWordApi11() {
            return true;
          },
          async readSelectionText() {
            return "";
          },
          async mutateSelection() {
            return "written";
          },
        },
        {
          isReady() {
            return false;
          },
          isExcelHost() {
            return false;
          },
          supportsExcelApi11() {
            return false;
          },
          async readSelectionSnapshot() {
            throw new Error(
              "not used",
            );
          },
          async replaceSelectedCell() {
            return "selection-changed";
          },
        },
      );

    assert.equal(
      result.ok,
      true,
    );
    assert.equal(
      result.hostKind,
      "word",
    );
    assert.equal(
      result.capabilities
        .canInsertAfter,
      true,
    );
  },
);
