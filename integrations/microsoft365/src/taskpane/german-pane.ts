import {
  createGermanBrailleTranslator,
} from "@persian-braille/sdk";

import type {
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
  readonly mutationContext?: unknown;
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

export interface GermanMutationSuccess {
  readonly ok: true;
}

export interface GermanMutationFailure {
  readonly ok: false;
  readonly domain: "host";
  readonly code: string;
  readonly message: string;
}

export type GermanMutationResult =
  | GermanMutationSuccess
  | GermanMutationFailure;

export interface GermanSelectionPort {
  readonly canReplace?: boolean;
  readonly canInsertAfter?: boolean;

  readSelection():
    Promise<GermanSelectionReadResult>;

  replaceSelection?(
    expected: unknown,
    replacementText: string,
  ): Promise<GermanMutationResult>;

  insertAfterSelection?(
    expected: unknown,
    insertedText: string,
  ): Promise<GermanMutationResult>;
}

export interface GermanClipboardPort {
  writeText(
    text: string,
  ): Promise<void>;
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
  readonly copyButton:
    HTMLButtonElement;
  readonly replaceButton:
    HTMLButtonElement;
  readonly insertAfterButton:
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

    copyButton:
      requiredElement(
        document,
        "german-copy-braille",
      ) as HTMLButtonElement,

    replaceButton:
      requiredElement(
        document,
        "german-replace-selection",
      ) as HTMLButtonElement,

    insertAfterButton:
      requiredElement(
        document,
        "german-insert-after-selection",
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

export function createGermanTaskPane(
  document: Document,
  clipboard?: GermanClipboardPort,
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

  let lastBraille:
    string
    | undefined;

  let lastMutationContext:
    unknown;

  let hasMutationContext =
    false;

  const invalidatePreviewState = () => {
    lastBraille =
      undefined;
    lastMutationContext =
      undefined;
    hasMutationContext =
      false;
  };

  const updateControls = () => {
    const configured =
      selectedRegion(ui)
      !== undefined
      && selectedLevel(ui)
        !== undefined;

    const hasPreview =
      lastBraille !==
        undefined;

    ui.translateButton.disabled =
      !ready
      || selectionPort ===
        undefined
      || !configured;

    ui.copyButton.disabled =
      !hasPreview
      || clipboard ===
        undefined;

    ui.replaceButton.hidden =
      selectionPort?.canReplace !==
        true;

    ui.insertAfterButton.hidden =
      selectionPort?.canInsertAfter !==
        true;

    ui.replaceButton.disabled =
      !hasPreview
      || !hasMutationContext
      || selectionPort?.canReplace !==
        true
      || selectionPort
        .replaceSelection ===
          undefined;

    ui.insertAfterButton.disabled =
      !hasPreview
      || !hasMutationContext
      || selectionPort?.canInsertAfter !==
        true
      || selectionPort
        .insertAfterSelection ===
          undefined;
  };

  const clearFeedback = () => {
    ui.result.hidden =
      true;
    ui.failure.hidden =
      true;

    ui.unicode.textContent =
      "";
    ui.errorCode.textContent =
      "";
    ui.errorMessage.textContent =
      "";
    ui.status.textContent =
      "";

    invalidatePreviewState();
    updateControls();
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

    updateControls();
  };

  const translateCurrentSelection =
    async () => {
      clearFeedback();

      if (!ready) {
        showFailure(
          "OFFICE_NOT_READY",
          "Microsoft Office ist für die Übersetzung noch nicht bereit.",
        );
        return;
      }

      if (
        selectionPort ===
        undefined
      ) {
        showFailure(
          "SELECTION_SERVICE_UNAVAILABLE",
          "Der aktuelle Office-Host ist nicht mit der deutschen Braille-Ansicht verbunden.",
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
          "Bitte Region und Braillestufe auswählen.",
        );
        return;
      }

      ui.status.textContent =
        "Auswahl wird gelesen…";

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
          "Bitte einen nicht leeren Text im aktuellen Office-Dokument auswählen.",
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

      if (!translation.ok) {
        showFailure(
          translation.code,
          translation.message,
        );

        ui.status.textContent =
          "Die deutsche Braille-Übersetzung konnte nicht abgeschlossen werden.";
        return;
      }

      ui.failure.hidden =
        true;

      ui.unicode.textContent =
        translation.unicodeBraille;

      ui.result.hidden =
        false;

      lastBraille =
        translation.unicodeBraille;
      lastMutationContext =
        selection.mutationContext;
      hasMutationContext =
        Object.prototype.hasOwnProperty.call(
          selection,
          "mutationContext",
        );

      ui.status.textContent =
        "Braille-Vorschau bereit.";

      updateControls();
    };

  const copyBraille =
    async () => {
      if (
        lastBraille === undefined
        || clipboard === undefined
      ) {
        return;
      }

      try {
        await clipboard.writeText(
          lastBraille,
        );
        ui.status.textContent =
          "Brailleschrift kopiert.";
      } catch {
        showFailure(
          "CLIPBOARD_WRITE_FAILED",
          "Die Brailleschrift konnte nicht in die Zwischenablage kopiert werden.",
        );
      }
    };

  const mutateSelection =
    async (
      kind:
        | "replace"
        | "insert-after",
    ) => {
      if (
        selectionPort === undefined
        || lastBraille === undefined
        || !hasMutationContext
      ) {
        return;
      }

      const operation =
        kind === "replace"
          ? selectionPort
            .replaceSelection
          : selectionPort
            .insertAfterSelection;

      if (operation === undefined) {
        return;
      }

      const outcome =
        await operation(
          lastMutationContext,
          lastBraille,
        );

      if (!outcome.ok) {
        showFailure(
          outcome.code,
          outcome.message,
        );
        return;
      }

      hasMutationContext =
        false;
      lastMutationContext =
        undefined;

      ui.status.textContent =
        kind === "replace"
          ? "Auswahl ersetzt."
          : "Brailleschrift nach der Auswahl eingefügt.";

      updateControls();
    };

  ui.region.addEventListener(
    "change",
    () => {
      clearFeedback();
    },
  );

  ui.level.addEventListener(
    "change",
    () => {
      clearFeedback();
    },
  );

  ui.translateButton.addEventListener(
    "click",
    () => {
      void translateCurrentSelection();
    },
  );

  ui.copyButton.addEventListener(
    "click",
    () => {
      void copyBraille();
    },
  );

  ui.replaceButton.addEventListener(
    "click",
    () => {
      void mutateSelection(
        "replace",
      );
    },
  );

  ui.insertAfterButton.addEventListener(
    "click",
    () => {
      void mutateSelection(
        "insert-after",
      );
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
    },
  );

  ui.translateButton.disabled =
    true;

  clearFeedback();

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

      clearFeedback();
    },

    translateCurrentSelection,

    clear() {
      ui.region.value =
        "";
      ui.level.value =
        "";
      clearFeedback();
    },
  });
}
