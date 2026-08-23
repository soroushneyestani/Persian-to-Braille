import assert from "node:assert/strict";
import {
  readFile,
  stat,
} from "node:fs/promises";
import test from "node:test";

import {
  createGermanTaskPane,
  germanRegionalOverlayForRegion,
} from "../dist/taskpane/german-pane.js";

class FakeElement {
  constructor(
    id,
  ) {
    this.id = id;
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.listeners =
      new Map();
  }

  addEventListener(
    name,
    listener,
  ) {
    this.listeners.set(
      name,
      listener,
    );
  }

  change() {
    this.listeners.get(
      "change",
    )?.({
      preventDefault() {},
    });
  }

  click() {
    this.listeners.get(
      "click",
    )?.({
      preventDefault() {},
    });
  }
}

function fixture() {
  const ids = [
    "german-braille-section",
    "german-region",
    "german-text-mode",
    "german-translate-selection",
    "german-clear-output",
    "german-copy-braille",
    "german-replace-selection",
    "german-insert-after-selection",
    "german-translation-result",
    "german-unicode-output",
    "german-translation-error",
    "german-error-code",
    "german-error-message",
    "german-taskpane-status",
  ];

  const elements =
    Object.fromEntries(
      ids.map(
        (id) => [
          id,
          new FakeElement(
            id,
          ),
        ],
      ),
    );

  const document = {
    getElementById(id) {
      return elements[id]
        ?? null;
    },
  };

  return {
    document,
    elements,
  };
}

function selectConfiguration(
  elements,
  region,
  level,
) {
  elements[
    "german-region"
  ].value =
    region;

  elements[
    "german-region"
  ].change();

  elements[
    "german-text-mode"
  ].value =
    level;

  elements[
    "german-text-mode"
  ].change();
}

function successfulSelection(
  text = "Test",
  options = {},
) {
  const calls = {
    replace: [],
    insertAfter: [],
  };

  const port = {
    canReplace:
      options.canReplace
      ?? false,
    canInsertAfter:
      options.canInsertAfter
      ?? false,

    async readSelection() {
      return {
        ok: true,
        text,
        mutationContext:
          options.mutationContext
          ?? { text },
      };
    },
  };

  if (port.canReplace) {
    port.replaceSelection =
      async (
        expected,
        replacementText,
      ) => {
        calls.replace.push({
          expected,
          replacementText,
        });
        return { ok: true };
      };
  }

  if (port.canInsertAfter) {
    port.insertAfterSelection =
      async (
        expected,
        insertedText,
      ) => {
        calls.insertAfter.push({
          expected,
          insertedText,
        });
        return { ok: true };
      };
  }

  return {
    port,
    calls,
  };
}

function nextTurn() {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        0,
      );
    },
  );
}

test(
  "German regional UI maps Germany/Austria to null and Switzerland to swiss",
  () => {
    assert.equal(
      germanRegionalOverlayForRegion(
        "germany-austria",
      ),
      null,
    );

    assert.equal(
      germanRegionalOverlayForRegion(
        "switzerland",
      ),
      "swiss",
    );
  },
);

test(
  "German translation remains disabled until Office, region, level, and selection port are ready",
  () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createGermanTaskPane(
        document,
      );

    const translate =
      elements[
        "german-translate-selection"
      ];

    assert.equal(
      translate.disabled,
      true,
    );

    controller.setReady(
      true,
    );

    controller.setSelectionPort(
      successfulSelection().port,
    );

    assert.equal(
      translate.disabled,
      true,
    );

    elements[
      "german-region"
    ].value =
      "germany-austria";

    elements[
      "german-region"
    ].change();

    assert.equal(
      translate.disabled,
      true,
    );

    elements[
      "german-text-mode"
    ].value =
      "basisschrift";

    elements[
      "german-text-mode"
    ].change();

    assert.equal(
      translate.disabled,
      false,
    );
  },
);

test(
  "Germany/Austria Basisschrift renders real Unicode Braille in the production Office pane",
  async () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createGermanTaskPane(
        document,
      );

    controller.setReady(
      true,
    );

    controller.setSelectionPort(
      successfulSelection(
        "Hallo",
      ).port,
    );

    selectConfiguration(
      elements,
      "germany-austria",
      "basisschrift",
    );

    await controller
      .translateCurrentSelection();

    assert.equal(
      elements[
        "german-translation-result"
      ].hidden,
      false,
    );

    assert.equal(
      elements[
        "german-translation-error"
      ].hidden,
      true,
    );

    assert.equal(
      elements[
        "german-unicode-output"
      ].textContent,
      "⠓⠁⠇⠇⠕",
    );

    assert.match(
      elements[
        "german-taskpane-status"
      ].textContent,
      /Vorschau bereit/i,
    );
  },
);

test(
  "Switzerland Basisschrift renders real Braille through the same public SDK path",
  async () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createGermanTaskPane(
        document,
      );

    controller.setReady(
      true,
    );

    controller.setSelectionPort(
      successfulSelection(
        "Schweiz",
      ).port,
    );

    selectConfiguration(
      elements,
      "switzerland",
      "basisschrift",
    );

    await controller
      .translateCurrentSelection();

    assert.equal(
      elements[
        "german-unicode-output"
      ].textContent,
      "⠎⠉⠓⠺⠑⠊⠵",
    );
  },
);

for (
  const [
    level,
    input,
    expectedBraille,
  ]
  of [
    [
      "vollschrift",
      "Baum",
      "⠃⠡⠍",
    ],
    [
      "kurzschrift",
      "Center",
      "⠠⠉⠉⠞⠻",
    ],
  ]
) {
  test(
    `Office ${level} renders real Unicode Braille through the registered public SDK`,
    async () => {
      const {
        document,
        elements,
      } =
        fixture();

      const controller =
        createGermanTaskPane(
          document,
        );

      controller.setReady(
        true,
      );

      controller.setSelectionPort(
        successfulSelection(
          input,
        ).port,
      );

      selectConfiguration(
        elements,
        "germany-austria",
        level,
      );

      await controller
        .translateCurrentSelection();

      assert.equal(
        elements[
          "german-translation-result"
        ].hidden,
        false,
      );

      assert.equal(
        elements[
          "german-unicode-output"
        ].textContent,
        expectedBraille,
      );
    },
  );
}

for (
  const level
  of [
    "basisschrift",
    "vollschrift",
    "kurzschrift",
  ]
) {
  test(
    `Swiss explicit Eszett is rejected without automatic normalization in ${level}`,
    async () => {
      const {
        document,
        elements,
      } =
        fixture();

      const controller =
        createGermanTaskPane(
          document,
        );

      controller.setReady(
        true,
      );

      controller.setSelectionPort(
        successfulSelection(
          "ß",
        ).port,
      );

      selectConfiguration(
        elements,
        "switzerland",
        level,
      );

      await controller
        .translateCurrentSelection();

      assert.equal(
        elements[
          "german-error-code"
        ].textContent,
        "SWISS_EXPLICIT_ESZETT_FORBIDDEN",
      );

      assert.equal(
        elements[
          "german-translation-result"
        ].hidden,
        true,
      );
    },
  );
}

test(
  "German pane rejects empty Office selection before SDK translation",
  async () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createGermanTaskPane(
        document,
      );

    controller.setReady(
      true,
    );

    controller.setSelectionPort(
      successfulSelection(
        "",
      ).port,
    );

    selectConfiguration(
      elements,
      "germany-austria",
      "basisschrift",
    );

    await controller
      .translateCurrentSelection();

    assert.equal(
      elements[
        "german-error-code"
      ].textContent,
      "EMPTY_SELECTION",
    );
  },
);

test(
  "German production actions expose copy and Word-style write operations only after a successful preview",
  async () => {
    const {
      document,
      elements,
    } =
      fixture();

    const copied = [];
    const clipboard = {
      async writeText(text) {
        copied.push(text);
      },
    };

    const selection =
      successfulSelection(
        "Hallo",
        {
          canReplace: true,
          canInsertAfter: true,
          mutationContext:
            "Hallo",
        },
      );

    const controller =
      createGermanTaskPane(
        document,
        clipboard,
      );

    controller.setReady(
      true,
    );
    controller.setSelectionPort(
      selection.port,
    );

    selectConfiguration(
      elements,
      "germany-austria",
      "basisschrift",
    );

    assert.equal(
      elements[
        "german-copy-braille"
      ].disabled,
      true,
    );

    await controller
      .translateCurrentSelection();

    assert.equal(
      elements[
        "german-copy-braille"
      ].disabled,
      false,
    );
    assert.equal(
      elements[
        "german-replace-selection"
      ].disabled,
      false,
    );
    assert.equal(
      elements[
        "german-insert-after-selection"
      ].disabled,
      false,
    );

    elements[
      "german-copy-braille"
    ].click();
    await nextTurn();

    assert.deepEqual(
      copied,
      ["⠓⠁⠇⠇⠕"],
    );

    elements[
      "german-replace-selection"
    ].click();
    await nextTurn();

    assert.equal(
      selection.calls.replace.length,
      1,
    );
    assert.deepEqual(
      selection.calls.replace[0],
      {
        expected: "Hallo",
        replacementText:
          "⠓⠁⠇⠇⠕",
      },
    );

    assert.equal(
      elements[
        "german-replace-selection"
      ].disabled,
      true,
    );
    assert.equal(
      elements[
        "german-insert-after-selection"
      ].disabled,
      true,
    );
  },
);

test(
  "German production actions hide unsupported insert-after behavior for Excel/PowerPoint style ports",
  async () => {
    const {
      document,
      elements,
    } =
      fixture();

    const selection =
      successfulSelection(
        "Hallo",
        {
          canReplace: true,
          canInsertAfter: false,
        },
      );

    const controller =
      createGermanTaskPane(
        document,
        {
          async writeText() {},
        },
      );

    controller.setReady(
      true,
    );
    controller.setSelectionPort(
      selection.port,
    );

    selectConfiguration(
      elements,
      "germany-austria",
      "basisschrift",
    );

    await controller
      .translateCurrentSelection();

    assert.equal(
      elements[
        "german-replace-selection"
      ].disabled,
      false,
    );
    assert.equal(
      elements[
        "german-insert-after-selection"
      ].disabled,
      true,
    );
    assert.equal(
      elements[
        "german-insert-after-selection"
      ].hidden,
      true,
    );
  },
);

test(
  "German Zurücksetzen resets region, level, preview, and production actions",
  async () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createGermanTaskPane(
        document,
        {
          async writeText() {},
        },
      );

    controller.setReady(
      true,
    );

    controller.setSelectionPort(
      successfulSelection(
        "Hallo",
        {
          canReplace: true,
          canInsertAfter: true,
        },
      ).port,
    );

    selectConfiguration(
      elements,
      "switzerland",
      "kurzschrift",
    );

    await controller
      .translateCurrentSelection();

    elements[
      "german-clear-output"
    ].click();

    assert.equal(
      elements[
        "german-region"
      ].value,
      "",
    );

    assert.equal(
      elements[
        "german-text-mode"
      ].value,
      "",
    );

    for (
      const id
      of [
        "german-translate-selection",
        "german-copy-braille",
        "german-replace-selection",
        "german-insert-after-selection",
      ]
    ) {
      assert.equal(
        elements[id].disabled,
        true,
      );
    }
  },
);

test(
  "built task pane exposes localized German production actions and removes user-facing engineering diagnostics",
  async () => {
    const html =
      await readFile(
        new URL(
          "../addin-dist/taskpane.html",
          import.meta.url,
        ),
        "utf8",
      );

    for (
      const token
      of [
        'id="feature-tab-german"',
        "Deutsch",
        'id="german-region"',
        "Deutschland / Österreich",
        "Schweiz",
        'id="german-text-mode"',
        "Braillestufe",
        "Basisschrift",
        "Vollschrift",
        "Kurzschrift",
        "Auswahl übersetzen",
        'id="german-copy-braille"',
        "Braille kopieren",
        'id="german-replace-selection"',
        "Auswahl ersetzen",
        'id="german-insert-after-selection"',
        "Nach Auswahl einfügen",
        "Developed by",
        "Soroush Neyestani",
        "MIT License",
        "https://soroush.neyestani.com/",
        "https://github.com/soroushneyestani",
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          token.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          ),
        ),
      );
    }

    for (
      const forbidden
      of [
        "Runtime profile",
        "Germany / Austria use the standard baseline",
        "Phase 14.9 inserts the exact successful preview",
        "Translation rules remain owned",
        "Profile: <strong>fa-ir-g1",
        ">Diagnostics<",
        "BRF / Braille ASCII",
      ]
    ) {
      assert.doesNotMatch(
        html,
        new RegExp(
          forbidden.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          ),
        ),
      );
    }
  },
);

test(
  "static build materializes the German task-pane module",
  async () => {
    const compiled =
      new URL(
        "../addin-dist/app/taskpane/german-pane.js",
        import.meta.url,
      );

    const info =
      await stat(
        compiled,
      );

    assert.ok(
      info.isFile(),
    );
  },
);

test(
  "three-host dispatch reuses existing host adapters through German mutation-safe ports",
  async () => {
    const source =
      await readFile(
        new URL(
          "../src/taskpane/main.ts",
          import.meta.url,
        ),
        "utf8",
      );

    for (
      const token
      of [
        "createGermanTaskPane",
        "germanWordPort",
        "germanExcelPort",
        "germanPowerPointPort",
        "wordHostAdapter",
        "excelHostAdapter",
        "powerPointHostAdapter",
        "germanPane.setSelectionPort",
      ]
    ) {
      assert.match(
        source,
        new RegExp(
          token,
        ),
      );
    }

    assert.doesNotMatch(
      source,
      /createGerman.*HostRuntime/,
    );
  },
);
