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
  "Germany/Austria Basisschrift renders real Unicode Braille in the shared Office pane",
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
          "EXECUTABLE_RUNTIME_REGISTERED",
        runtimeDependency:
          "NONE",
        runtimeExecutable:
          true,
        runtimeRegistered:
          true,
        loweringCoverage:
          "123/123",
      },
    );

    assert.match(
      elements[
        "german-taskpane-status"
      ].textContent,
      /preview ready/i,
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
      ),
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

    const profile =
      JSON.parse(
        elements[
          "german-profile-info"
        ].textContent,
      );

    assert.equal(
      profile.regionalOverlay,
      "swiss",
    );

    assert.equal(
      profile.runtimeRegistered,
      true,
    );
  },
);

for (
  const [
    level,
    input,
    expectedBraille,
    expectedCoverage,
  ]
  of [
    [
      "vollschrift",
      "Baum",
      "⠃⠡⠍",
      "SOURCE_FIXTURE_SURFACE",
    ],
    [
      "kurzschrift",
      "Center",
      "⠠⠉⠉⠞⠻",
      "SOURCE_FIXTURE_SURFACE",
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
        ),
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
          "german-translation-error"
        ].hidden,
        true,
      );

      assert.equal(
        elements[
          "german-unicode-output"
        ].textContent,
        expectedBraille,
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
            level,
          regionalOverlay:
            null,
          runtimeStatus:
            "EXECUTABLE_RUNTIME_REGISTERED",
          runtimeDependency:
            "NONE",
          runtimeExecutable:
            true,
          runtimeRegistered:
            true,
          loweringCoverage:
            expectedCoverage,
        },
      );

      assert.match(
        elements[
          "german-taskpane-status"
        ].textContent,
        /preview ready/i,
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
        "SWISS_EXPLICIT_ESZETT_FORBIDDEN",
      );

      assert.equal(
        elements[
          "german-translation-result"
        ].hidden,
        true,
      );

      const profile =
        JSON.parse(
          elements[
            "german-profile-info"
          ].textContent,
        );

      assert.equal(
        profile.runtimeExecutable,
        true,
      );

      assert.equal(
        profile.runtimeRegistered,
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
  "built task pane preserves German two-region three-level UI and no write actions",
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
  "three-host dispatch still reuses Word Excel PowerPoint host adapters",
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
