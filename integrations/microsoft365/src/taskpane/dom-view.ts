import type {
  WordTaskPaneController,
  WordTaskPaneFailurePresentation,
  WordTaskPaneSuccessPresentation,
  WordTaskPaneView,
} from "./controller.js";

interface TaskPaneElements {
  readonly readyState:
    HTMLElement;
  readonly translateButton:
    HTMLButtonElement;
  readonly clearButton:
    HTMLButtonElement;
  readonly copyButton:
    HTMLButtonElement;
  readonly replaceButton:
    HTMLButtonElement;
  readonly insertButton:
    HTMLButtonElement;
  readonly resultPanel:
    HTMLElement;
  readonly sourceOutput:
    HTMLElement;
  readonly brailleOutput:
    HTMLElement;
  readonly cellsOutput:
    HTMLElement;
  readonly normalizedOutput:
    HTMLElement;
  readonly structuralOutput:
    HTMLElement;
  readonly errorPanel:
    HTMLElement;
  readonly errorCode:
    HTMLElement;
  readonly errorMessage:
    HTMLElement;
  readonly status:
    HTMLElement;
}

function requiredElement<T extends HTMLElement>(
  document:
    Document,
  id: string,
): T {
  const element =
    document.getElementById(
      id,
    );

  if (!element) {
    throw new Error(
      `Missing task-pane element: #${id}`,
    );
  }

  return element as T;
}

function elements(
  document:
    Document,
): TaskPaneElements {
  return {
    readyState:
      requiredElement(
        document,
        "office-ready-state",
      ),
    translateButton:
      requiredElement(
        document,
        "translate-selection",
      ),
    clearButton:
      requiredElement(
        document,
        "clear-output",
      ),
    copyButton:
      requiredElement(
        document,
        "copy-braille",
      ),
    replaceButton:
      requiredElement(
        document,
        "replace-selection",
      ),
    insertButton:
      requiredElement(
        document,
        "insert-after-selection",
      ),
    resultPanel:
      requiredElement(
        document,
        "translation-result",
      ),
    sourceOutput:
      requiredElement(
        document,
        "source-output",
      ),
    brailleOutput:
      requiredElement(
        document,
        "braille-output",
      ),
    cellsOutput:
      requiredElement(
        document,
        "cells-output",
      ),
    normalizedOutput:
      requiredElement(
        document,
        "normalized-output",
      ),
    structuralOutput:
      requiredElement(
        document,
        "structural-output",
      ),
    errorPanel:
      requiredElement(
        document,
        "translation-error",
      ),
    errorCode:
      requiredElement(
        document,
        "error-code",
      ),
    errorMessage:
      requiredElement(
        document,
        "error-message",
      ),
    status:
      requiredElement(
        document,
        "taskpane-status",
      ),
  };
}

export interface WordTaskPaneDomView
  extends WordTaskPaneView {
  bind(
    controller:
      WordTaskPaneController,
  ): void;

  clear(): void;
}

export function createWordTaskPaneDomView(
  document:
    Document,
): WordTaskPaneDomView {
  const ui =
    elements(document);

  let ready = false;
  let busy = false;
  let hasPreview = false;

  function updateActions() {
    ui.translateButton.disabled =
      !ready ||
      busy;

    ui.clearButton.disabled =
      busy;

    ui.copyButton.disabled =
      busy ||
      !hasPreview;

    ui.replaceButton.disabled =
      busy ||
      !hasPreview;

    ui.insertButton.disabled =
      busy ||
      !hasPreview;
  }

  function clearPanels() {
    ui.resultPanel.hidden =
      true;
    ui.errorPanel.hidden =
      true;
    hasPreview = false;
  }

  return Object.freeze({
    bind(
      controller:
        WordTaskPaneController,
    ) {
      ui.translateButton
        .addEventListener(
          "click",
          () => {
            void controller
              .translateSelection();
          },
        );

      ui.copyButton
        .addEventListener(
          "click",
          () => {
            void controller
              .copyBraille();
          },
        );

      ui.replaceButton
        .addEventListener(
          "click",
          () => {
            void controller
              .replaceSelection();
          },
        );

      ui.insertButton
        .addEventListener(
          "click",
          () => {
            void controller
              .insertAfterSelection();
          },
        );

      ui.clearButton
        .addEventListener(
          "click",
          () => {
            clearPanels();
            ui.status.textContent =
              "Output cleared.";
            updateActions();
          },
        );
    },

    clear() {
      clearPanels();
      ui.status.textContent =
        "";
      updateActions();
    },

    setReady(
      value: boolean,
    ) {
      ready = value;

      ui.readyState.textContent =
        value
          ? "Word ready"
          : "Waiting for Word";

      ui.readyState
        .setAttribute(
          "data-ready",
          value
            ? "true"
            : "false",
        );

      updateActions();
    },

    setBusy(
      value: boolean,
    ) {
      busy = value;

      if (value) {
        ui.status.textContent =
          "Working…";
      }

      updateActions();
    },

    showIdle(
      message: string,
    ) {
      clearPanels();
      ui.status.textContent =
        message;
      updateActions();
    },

    showSuccess(
      presentation:
        WordTaskPaneSuccessPresentation,
    ) {
      ui.errorPanel.hidden =
        true;
      ui.resultPanel.hidden =
        false;

      ui.sourceOutput.textContent =
        presentation.sourceText;
      ui.brailleOutput.textContent =
        presentation.unicodeBraille;
      ui.cellsOutput.textContent =
        presentation.cells;
      ui.normalizedOutput.textContent =
        presentation.normalizedText;
      ui.structuralOutput.textContent =
        presentation.structuralTokens;

      hasPreview = true;
      ui.status.textContent =
        "Translation ready.";

      updateActions();
    },

    showFailure(
      presentation:
        WordTaskPaneFailurePresentation,
    ) {
      ui.resultPanel.hidden =
        true;
      ui.errorPanel.hidden =
        false;

      ui.errorCode.textContent =
        presentation.code;
      ui.errorMessage.textContent =
        presentation.message;

      hasPreview = false;
      ui.status.textContent =
        `${presentation.domain} failure`;

      updateActions();
    },

    announce(
      message: string,
    ) {
      ui.status.textContent =
        message;
    },
  });
}
