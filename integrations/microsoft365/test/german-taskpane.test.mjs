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
    "german-translation-result",
    "german-unicode-output",
    "german-translation-error",
    "german-error-code",
    "german-error-message",
    "german-profile-info",
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
) {
  return {
    async readSelection() {
      return {
        ok: true,
        text,
      };
    },
  };
}

test(
  "German regional UI maps Germany/Austria to the baseline and Switzerland to the Swiss overlay",
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
      successfulSelection(),
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
  "Germany/Austria Basisschrift projects the structured Phase 15.6 runtime dependency",
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
      ),
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
      true,
    );

    assert.equal(
      elements[
        "german-translation-error"
      ].hidden,
      false,
    );

    assert.equal(
      elements[
        "german-error-code"
      ].textContent,
      "RUNTIME_NOT_EXECUTABLE",
    );

    const profile =
      JSON.parse(
        elements[
          "german-profile-info"
        ].textContent,
      );

    assert.deepEqual(
      profile,
      {
        language:
          "de",
        mode:
          "basisschrift",
        regionalOverlay:
          null,
        runtimeStatus:
          "LOWERING_IR_NON_EXECUTABLE",
        runtimeDependency:
          "GERMAN_EXECUTABLE_RUNTIME_ADAPTER",
        runtimeExecutable:
          false,
        runtimeRegistered:
          false,
        loweringCoverage:
          "123/123",
      },
    );

    assert.match(
      elements[
        "german-taskpane-status"
      ].textContent,
      /fail-closed/i,
    );
  },
);

for (
  const level
  of [
    "vollschrift",
    "kurzschrift",
  ]
) {
  test(
    `Switzerland ${level} preserves the Swiss overlay and non-materialized mode dependency`,
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
        ),
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
        "RUNTIME_NOT_EXECUTABLE",
      );

      const profile =
        JSON.parse(
          elements[
            "german-profile-info"
          ].textContent,
        );

      assert.equal(
        profile.language,
        "de",
      );

      assert.equal(
        profile.mode,
        level,
      );

      assert.equal(
        profile.regionalOverlay,
        "swiss",
      );

      assert.equal(
        profile.runtimeStatus,
        "MODE_RUNTIME_NOT_MATERIALIZED",
      );

      assert.equal(
        profile.runtimeDependency,
        "GERMAN_MODE_EXECUTABLE_RUNTIME_MATERIALIZATION",
      );

      assert.equal(
        profile.loweringCoverage,
        "NOT_MATERIALIZED",
      );

      assert.equal(
        profile.runtimeExecutable,
        false,
      );

      assert.equal(
        profile.runtimeRegistered,
        false,
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
      ),
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

    assert.equal(
      elements[
        "german-profile-info"
      ].hidden,
      true,
    );
  },
);

test(
  "German Clear resets both region and level and disables translation",
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

    controller.setReady(
      true,
    );

    controller.setSelectionPort(
      successfulSelection(),
    );

    selectConfiguration(
      elements,
      "switzerland",
      "kurzschrift",
    );

    assert.equal(
      elements[
        "german-translate-selection"
      ].disabled,
      false,
    );

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

    assert.equal(
      elements[
        "german-translate-selection"
      ].disabled,
      true,
    );
  },
);

test(
  "built task pane exposes German as the text accessibility tab with two regions and three levels",
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
        "German",
        'id="german-region"',
        "Germany / Austria",
        "Switzerland",
        'id="german-text-mode"',
        "Basisschrift",
        "Vollschrift",
        "Kurzschrift",
        'id="german-translate-selection"',
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

    assert.doesNotMatch(
      html,
      /german-replace-selection/,
    );

    assert.doesNotMatch(
      html,
      /german-insert-after/,
    );
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
  "three-host dispatch connects German to existing Word, Excel, and PowerPoint adapters without a new host runtime layer",
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
        "wordHostAdapter",
        "excelHostAdapter",
        "powerPointHostAdapter",
        "germanPane.setSelectionPort",
      ]
    ) {
      assert.match(
        source,
        new RegExp(
          token.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          ),
        ),
      );
    }

    assert.doesNotMatch(
      source,
      /createGerman.*HostRuntime/,
    );
  },
);
