import {
  createMusicBrailleMusicXmlTranslator,
} from "@persian-braille/sdk";

import type {
  MusicBrailleMusicXmlTranslator,
} from "@persian-braille/sdk";

import type {
  WordMusicInsertionService,
} from "../word/music-insertion.js";

export type WordMusicXmlHostKind =
  | "word"
  | "excel"
  | "powerpoint";

export interface MusicXmlFilePort {
  readonly name: string;
  readonly size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface WordMusicXmlTaskPaneController {
  setHost(hostKind: WordMusicXmlHostKind): void;
  setInsertionService(service: WordMusicInsertionService): void;
  selectFile(file: MusicXmlFilePort | null): Promise<void>;
  previewSelectedScore(): Promise<void>;
  insertPreviewIntoWord(): Promise<void>;
  clear(): void;
}

interface MusicXmlUi {
  readonly section: HTMLElement;
  readonly fileInput: HTMLInputElement;
  readonly fileName: HTMLElement;
  readonly previewButton: HTMLButtonElement;
  readonly insertButton: HTMLButtonElement;
  readonly clearButton: HTMLButtonElement;
  readonly result: HTMLElement;
  readonly unicodeOutput: HTMLElement;
  readonly brfOutput: HTMLElement;
  readonly diagnosticsOutput: HTMLElement;
  readonly error: HTMLElement;
  readonly errorCode: HTMLElement;
  readonly errorMessage: HTMLElement;
  readonly status: HTMLElement;
}

function requiredElement<T extends HTMLElement>(
  document: Document,
  id: string,
): T {
  const element =
    document.getElementById(
      id,
    );

  if (!element) {
    throw new Error(
      `WORD_MUSICXML_TASKPANE_ELEMENT_MISSING: ${id}`,
    );
  }

  return element as T;
}

function bindUi(
  document: Document,
): MusicXmlUi {
  return {
    section:
      requiredElement(
        document,
        "musicxml-braille-section",
      ),
    fileInput:
      requiredElement<HTMLInputElement>(
        document,
        "musicxml-file",
      ),
    fileName:
      requiredElement(
        document,
        "musicxml-filename",
      ),
    previewButton:
      requiredElement<HTMLButtonElement>(
        document,
        "musicxml-preview",
      ),
    insertButton:
      requiredElement<HTMLButtonElement>(
        document,
        "musicxml-insert-word",
      ),
    clearButton:
      requiredElement<HTMLButtonElement>(
        document,
        "musicxml-clear",
      ),
    result:
      requiredElement(
        document,
        "musicxml-translation-result",
      ),
    unicodeOutput:
      requiredElement(
        document,
        "musicxml-unicode-output",
      ),
    brfOutput:
      requiredElement(
        document,
        "musicxml-brf-output",
      ),
    diagnosticsOutput:
      requiredElement(
        document,
        "musicxml-diagnostic-output",
      ),
    error:
      requiredElement(
        document,
        "musicxml-translation-error",
      ),
    errorCode:
      requiredElement(
        document,
        "musicxml-error-code",
      ),
    errorMessage:
      requiredElement(
        document,
        "musicxml-error-message",
      ),
    status:
      requiredElement(
        document,
        "musicxml-taskpane-status",
      ),
  };
}

function normalizedExtension(
  name: string,
): "musicxml" | "xml" | "mxl" | null {
  const normalized =
    name
      .trim()
      .toLowerCase();

  if (
    normalized.endsWith(
      ".musicxml",
    )
  ) {
    return "musicxml";
  }

  if (
    normalized.endsWith(
      ".mxl",
    )
  ) {
    return "mxl";
  }

  if (
    normalized.endsWith(
      ".xml",
    )
  ) {
    return "xml";
  }

  return null;
}

export function createWordMusicXmlTaskPane(
  document: Document,
  translator:
    MusicBrailleMusicXmlTranslator =
      createMusicBrailleMusicXmlTranslator(),
): WordMusicXmlTaskPaneController {
  const ui =
    bindUi(
      document,
    );

  let wordEnabled =
    false;

  let selectedFile:
    MusicXmlFilePort | null =
      null;

  let selectedBytes:
    ArrayBuffer | null =
      null;

  let selectedKind:
    "musicxml" | "xml" | "mxl" | null =
      null;

  let successfulUnicodePreview:
    string | null =
      null;

  let insertionService:
    WordMusicInsertionService | null =
      null;

  function hideFeedback(): void {
    ui.result.hidden =
      true;
    ui.error.hidden =
      true;
    ui.unicodeOutput.textContent =
      "";
    ui.brfOutput.textContent =
      "";
    ui.diagnosticsOutput.textContent =
      "";
    ui.errorCode.textContent =
      "";
    ui.errorMessage.textContent =
      "";
  }

  function showFailure(
    code: string,
    message: string,
  ): void {
    ui.result.hidden =
      true;
    ui.error.hidden =
      false;
    ui.errorCode.textContent =
      code;
    ui.errorMessage.textContent =
      message;
    ui.status.textContent =
      "MusicXML Braille preview unavailable.";
  }

  function showInsertionFailure(
    code: string,
    message: string,
  ): void {
    ui.error.hidden =
      false;
    ui.errorCode.textContent =
      code;
    ui.errorMessage.textContent =
      message;
    ui.status.textContent =
      "MusicXML Braille insertion unavailable.";
  }

  function updateControls(): void {
    ui.fileName.textContent =
      selectedFile
        ? `${selectedFile.name} (${selectedFile.size} bytes)`
        : "No MusicXML or MXL file selected.";

    ui.previewButton.disabled =
      !wordEnabled
      || selectedFile === null
      || selectedBytes === null
      || selectedKind === null;

    ui.insertButton.disabled =
      !wordEnabled
      || successfulUnicodePreview === null
      || insertionService === null;
  }

  const controller:
    WordMusicXmlTaskPaneController = {
      setHost(hostKind) {
        wordEnabled =
          hostKind === "word";

        ui.section.hidden =
          !wordEnabled;

        ui.fileInput.disabled =
          !wordEnabled;

        if (!wordEnabled) {
          selectedFile =
            null;
          selectedBytes =
            null;
          selectedKind =
            null;
          successfulUnicodePreview =
            null;
          ui.fileInput.value =
            "";
          hideFeedback();
          ui.status.textContent =
            "";
        }

        updateControls();
      },

      setInsertionService(service) {
        insertionService =
          service;
        updateControls();
      },

      async selectFile(file) {
        successfulUnicodePreview =
          null;
        selectedBytes =
          null;
        selectedKind =
          null;
        hideFeedback();

        const extension =
          file === null
            ? null
            : normalizedExtension(
                file.name,
              );

        if (
          file !== null
          && extension === null
        ) {
          selectedFile =
            null;
          updateControls();

          showFailure(
            "UNSUPPORTED_MUSICXML_FILE_EXTENSION",
            "Choose a MusicXML file with a .musicxml or .xml extension, or a compressed .mxl score.",
          );
          return;
        }

        selectedFile =
          file;
        selectedKind =
          extension;
        updateControls();

        if (file === null) {
          ui.status.textContent =
            "";
          return;
        }

        ui.status.textContent =
          extension === "mxl"
            ? "Reading compressed MXL score…"
            : "Reading MusicXML score…";

        let bytes:
          ArrayBuffer;

        try {
          bytes =
            await file.arrayBuffer();
        } catch {
          showFailure(
            "MUSICXML_FILE_READ_FAILED",
            "The selected MusicXML or MXL file could not be read locally.",
          );
          updateControls();
          return;
        }

        if (
          selectedFile !== file
        ) {
          return;
        }

        selectedBytes =
          bytes;

        ui.status.textContent =
          extension === "mxl"
            ? "MXL score ready. Choose Preview Music Braille."
            : "MusicXML score ready. Choose Preview Music Braille.";

        updateControls();
      },

      async previewSelectedScore() {
        if (!wordEnabled) {
          showFailure(
            "WRONG_HOST",
            "MusicXML Braille preview is available only in Microsoft Word.",
          );
          return;
        }

        if (
          selectedFile === null
          || selectedBytes === null
          || selectedKind === null
        ) {
          showFailure(
            "MUSICXML_FILE_REQUIRED",
            "Choose a .musicxml, .xml, or .mxl file before generating a Music Braille preview.",
          );
          return;
        }

        const kind =
          selectedKind;

        successfulUnicodePreview =
          null;
        ui.previewButton.disabled =
          true;
        ui.insertButton.disabled =
          true;
        ui.status.textContent =
          kind === "mxl"
            ? "Generating Music Braille from compressed MXL…"
            : "Generating Music Braille from MusicXML…";
        hideFeedback();

        const result =
          kind === "mxl"
            ? await translator.translateMxl(
                selectedBytes,
              )
            : translator.translateMusicXml(
                selectedBytes,
              );

        if (
          result.ok === false
        ) {
          showFailure(
            result.code,
            `${result.stage}: ${result.message}`,
          );
          updateControls();
          return;
        }

        successfulUnicodePreview =
          result.unicodeBraille;

        ui.error.hidden =
          true;
        ui.result.hidden =
          false;
        ui.unicodeOutput.textContent =
          result.unicodeBraille;
        ui.brfOutput.textContent =
          result.brf;
        ui.diagnosticsOutput.textContent =
          result.diagnostics.length === 0
            ? "No diagnostics."
            : result.diagnostics
                .map(
                  (diagnostic) =>
                    `${diagnostic.code}: ${diagnostic.message}`,
                )
                .join("\n");

        ui.status.textContent =
          kind === "mxl"
            ? "Music Braille preview generated from MXL."
            : "Music Braille preview generated from MusicXML.";

        updateControls();
      },

      async insertPreviewIntoWord() {
        if (!wordEnabled) {
          showInsertionFailure(
            "WRONG_HOST",
            "MusicXML Braille insertion is available only in Microsoft Word.",
          );
          return;
        }

        if (
          successfulUnicodePreview === null
        ) {
          showInsertionFailure(
            "MUSICXML_BRAILLE_PREVIEW_REQUIRED",
            "Generate a successful MusicXML Braille preview before inserting it into Word.",
          );
          return;
        }

        if (
          insertionService === null
        ) {
          showInsertionFailure(
            "OFFICE_NOT_READY",
            "The Word insertion service is not ready.",
          );
          return;
        }

        const preview =
          successfulUnicodePreview;

        ui.insertButton.disabled =
          true;
        ui.status.textContent =
          "Inserting the current MusicXML Braille preview into Word…";

        const result =
          await insertionService
            .insertCurrentSelection(
              preview,
            );

        if (
          result.ok === false
        ) {
          showInsertionFailure(
            result.code,
            result.message,
          );
          updateControls();
          return;
        }

        ui.error.hidden =
          true;
        ui.errorCode.textContent =
          "";
        ui.errorMessage.textContent =
          "";
        ui.status.textContent =
          "MusicXML Braille inserted into the current Word selection/caret.";

        updateControls();
      },

      clear() {
        selectedFile =
          null;
        selectedBytes =
          null;
        selectedKind =
          null;
        successfulUnicodePreview =
          null;
        ui.fileInput.value =
          "";
        hideFeedback();
        ui.status.textContent =
          "";
        updateControls();
      },
    };

  ui.section.hidden =
    true;
  ui.fileInput.disabled =
    true;

  hideFeedback();
  updateControls();

  ui.fileInput.addEventListener(
    "change",
    () => {
      void controller.selectFile(
        ui.fileInput.files?.item(
          0,
        )
        ?? null,
      );
    },
  );

  ui.previewButton.addEventListener(
    "click",
    () => {
      void controller.previewSelectedScore();
    },
  );

  ui.insertButton.addEventListener(
    "click",
    () => {
      void controller.insertPreviewIntoWord();
    },
  );

  ui.clearButton.addEventListener(
    "click",
    () => {
      controller.clear();
    },
  );

  return controller;
}
