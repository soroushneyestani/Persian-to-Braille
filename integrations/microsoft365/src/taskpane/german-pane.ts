import {
  createGermanBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  GermanBrailleProfileInfo,
  GermanBrailleRegionalOverlay,
  GermanBrailleTextMode,
} from "@persian-braille/sdk";

export type GermanTaskPaneRegion =
  | "germany-austria"
  | "switzerland";

export const GERMAN_TASKPANE_REGIONS =
  Object.freeze([
    "germany-austria",
    "switzerland",
  ] as const);

export const GERMAN_TASKPANE_LEVELS =
  Object.freeze([
    "basisschrift",
    "vollschrift",
    "kurzschrift",
  ] as const);

export interface GermanSelectionReadSuccess {
  readonly ok: true;
  readonly text: string;
}

export interface GermanSelectionReadFailure {
  readonly ok: false;
  readonly domain: "host";
  readonly code: string;
  readonly message: string;
}

export type GermanSelectionReadResult =
  | GermanSelectionReadSuccess
  | GermanSelectionReadFailure;

export interface GermanSelectionPort {
  readSelection():
    Promise<GermanSelectionReadResult>;
}

export interface GermanTaskPaneController {
  setReady(
    ready: boolean,
  ): void;

  setSelectionPort(
    port:
      GermanSelectionPort
      | undefined,
  ): void;

  translateCurrentSelection():
    Promise<void>;

  clear(): void;
}

interface GermanTaskPaneDom {
  readonly section:
    HTMLElement;
  readonly region:
    HTMLSelectElement;
  readonly level:
    HTMLSelectElement;
  readonly translateButton:
    HTMLButtonElement;
  readonly clearButton:
    HTMLButtonElement;
  readonly result:
    HTMLElement;
  readonly unicode:
    HTMLElement;
  readonly failure:
    HTMLElement;
  readonly errorCode:
    HTMLElement;
  readonly errorMessage:
    HTMLElement;
  readonly profile:
    HTMLElement;
  readonly status:
    HTMLElement;
}

function requiredElement(
  document: Document,
  id: string,
): HTMLElement {
  const element =
    document.getElementById(
      id,
    );

  if (element === null) {
    throw new Error(
      `German task-pane element is missing: ${id}`,
    );
  }

  return element;
}

function germanDom(
  document: Document,
): GermanTaskPaneDom {
  return Object.freeze({
    section:
      requiredElement(
        document,
        "german-braille-section",
      ),

    region:
      requiredElement(
        document,
        "german-region",
      ) as HTMLSelectElement,

    level:
      requiredElement(
        document,
        "german-text-mode",
      ) as HTMLSelectElement,

    translateButton:
      requiredElement(
        document,
        "german-translate-selection",
      ) as HTMLButtonElement,

    clearButton:
      requiredElement(
        document,
        "german-clear-output",
      ) as HTMLButtonElement,

    result:
      requiredElement(
        document,
        "german-translation-result",
      ),

    unicode:
      requiredElement(
        document,
        "german-unicode-output",
      ),

    failure:
      requiredElement(
        document,
        "german-translation-error",
      ),

    errorCode:
      requiredElement(
        document,
        "german-error-code",
      ),

    errorMessage:
      requiredElement(
        document,
        "german-error-message",
      ),

    profile:
      requiredElement(
        document,
        "german-profile-info",
      ),

    status:
      requiredElement(
        document,
        "german-taskpane-status",
      ),
  });
}

function selectedRegion(
  ui: GermanTaskPaneDom,
):
  | GermanTaskPaneRegion
  | undefined {
  if (
    ui.region.value ===
      "germany-austria"
    || ui.region.value ===
      "switzerland"
  ) {
    return ui.region.value;
  }

  return undefined;
}

function selectedLevel(
  ui: GermanTaskPaneDom,
):
  | GermanBrailleTextMode
  | undefined {
  if (
    ui.level.value ===
      "basisschrift"
    || ui.level.value ===
      "vollschrift"
    || ui.level.value ===
      "kurzschrift"
  ) {
    return ui.level.value;
  }

  return undefined;
}

export function germanRegionalOverlayForRegion(
  region: GermanTaskPaneRegion,
): GermanBrailleRegionalOverlay | null {
  return region ===
    "switzerland"
    ? "swiss"
    : null;
}

function profileProjection(
  profile: GermanBrailleProfileInfo,
): string {
  return JSON.stringify(
    {
      language:
        profile.language,
      mode:
        profile.mode,
      regionalOverlay:
        profile.regionalOverlay,
      runtimeStatus:
        profile.runtimeStatus,
      runtimeDependency:
        profile.runtimeDependency,
      runtimeExecutable:
        profile.runtimeExecutable,
      runtimeRegistered:
        profile.runtimeRegistered,
      loweringCoverage:
        profile.loweringCoverage,
    },
    null,
    2,
  );
}

export function createGermanTaskPane(
  document: Document,
): GermanTaskPaneController {
  const ui =
    germanDom(
      document,
    );

  let ready =
    false;

  let selectionPort:
    GermanSelectionPort
    | undefined;

  const clearFeedback = () => {
    ui.result.hidden =
      true;
    ui.failure.hidden =
      true;
    ui.profile.hidden =
      true;

    ui.unicode.textContent =
      "";
    ui.errorCode.textContent =
      "";
    ui.errorMessage.textContent =
      "";
    ui.profile.textContent =
      "";
    ui.status.textContent =
      "";
  };

  const showFailure = (
    code: string,
    message: string,
  ) => {
    ui.result.hidden =
      true;

    ui.failure.hidden =
      false;

    ui.errorCode.textContent =
      code;

    ui.errorMessage.textContent =
      message;
  };

  const updateControls = () => {
    const configured =
      selectedRegion(ui)
      !== undefined
      && selectedLevel(ui)
        !== undefined;

    ui.translateButton.disabled =
      !ready
      || selectionPort ===
        undefined
      || !configured;
  };

  const translateCurrentSelection =
    async () => {
      clearFeedback();

      if (!ready) {
        showFailure(
          "OFFICE_NOT_READY",
          "Microsoft Office is not ready for German Braille translation.",
        );
        return;
      }

      if (
        selectionPort ===
        undefined
      ) {
        showFailure(
          "SELECTION_SERVICE_UNAVAILABLE",
          "The current Office host is not connected to the German Braille workspace.",
        );
        return;
      }

      const region =
        selectedRegion(
          ui,
        );

      const level =
        selectedLevel(
          ui,
        );

      if (
        region === undefined
        || level ===
          undefined
      ) {
        showFailure(
          "GERMAN_CONFIGURATION_REQUIRED",
          "Choose both a region and a Braille level before translating.",
        );
        return;
      }

      ui.status.textContent =
        "Reading the current Office selection…";

      const selection =
        await selectionPort
          .readSelection();

      if (!selection.ok) {
        showFailure(
          selection.code,
          selection.message,
        );

        ui.status.textContent =
          "";
        return;
      }

      if (
        selection.text.length ===
        0
      ) {
        showFailure(
          "EMPTY_SELECTION",
          "Select non-empty text in the current Office document before translating.",
        );

        ui.status.textContent =
          "";
        return;
      }

      const translator =
        createGermanBrailleTranslator({
          mode:
            level,
          regionalOverlay:
            germanRegionalOverlayForRegion(
              region,
            ),
        });

      const translation =
        translator.translate(
          selection.text,
        );

      ui.profile.textContent =
        profileProjection(
          translation.profile,
        );

      ui.profile.hidden =
        false;

      if (!translation.ok) {
        showFailure(
          translation.code,
          translation.message,
        );

        ui.status.textContent =
          "German Braille translation could not be completed for the selected configuration.";
        return;
      }

      ui.failure.hidden =
        true;

      ui.unicode.textContent =
        translation.unicodeBraille;

      ui.result.hidden =
        false;

      ui.status.textContent =
        "German Braille preview ready.";
    };

  ui.region.addEventListener(
    "change",
    () => {
      clearFeedback();
      updateControls();
    },
  );

  ui.level.addEventListener(
    "change",
    () => {
      clearFeedback();
      updateControls();
    },
  );

  ui.translateButton.addEventListener(
    "click",
    () => {
      void translateCurrentSelection();
    },
  );

  ui.clearButton.addEventListener(
    "click",
    () => {
      ui.region.value =
        "";
      ui.level.value =
        "";
      clearFeedback();
      updateControls();
    },
  );

  ui.translateButton.disabled =
    true;

  clearFeedback();
  updateControls();

  return Object.freeze({
    setReady(
      nextReady: boolean,
    ) {
      ready =
        nextReady;

      updateControls();
    },

    setSelectionPort(
      port:
        GermanSelectionPort
        | undefined,
    ) {
      selectionPort =
        port;

      updateControls();
    },

    translateCurrentSelection,

    clear() {
      ui.region.value =
        "";
      ui.level.value =
        "";
      clearFeedback();
      updateControls();
    },
  });
}
