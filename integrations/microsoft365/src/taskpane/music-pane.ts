import {
  createMusicBrailleMidiTranslator,
} from "@persian-braille/sdk";

import type {
  MusicBrailleMidiSourceLine,
  MusicBrailleMidiTranslator,
} from "@persian-braille/sdk";

import type {
  WordMusicInsertionService,
} from "../word/music-insertion.js";

export type WordMusicHostKind =
  | "word"
  | "excel"
  | "powerpoint";

export interface MusicMidiFilePort {
  readonly name: string;
  readonly size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface WordMusicTaskPaneController {
  setHost(hostKind: WordMusicHostKind): void;
  setInsertionService(service: WordMusicInsertionService): void;
  selectFile(file: MusicMidiFilePort | null): Promise<void>;
  selectSourceLine(lineId: string): void;
  previewSelectedMidi(): Promise<void>;
  insertPreviewIntoWord(): Promise<void>;
  clear(): void;
}

interface MusicUi {
  readonly section: HTMLElement;
  readonly fileInput: HTMLInputElement;
  readonly fileName: HTMLElement;
  readonly lineSection: HTMLElement;
  readonly lineSelect: HTMLSelectElement;
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
      `WORD_MUSIC_TASKPANE_ELEMENT_MISSING: ${id}`,
    );
  }

  return element as T;
}

function bindUi(
  document: Document,
): MusicUi {
  return {
    section:
      requiredElement(
        document,
        "music-braille-section",
      ),
    fileInput:
      requiredElement<HTMLInputElement>(
        document,
        "music-midi-file",
      ),
    fileName:
      requiredElement(
        document,
        "music-midi-filename",
      ),
    lineSection:
      requiredElement(
        document,
        "music-source-line-section",
      ),
    lineSelect:
      requiredElement<HTMLSelectElement>(
        document,
        "music-source-line",
      ),
    previewButton:
      requiredElement<HTMLButtonElement>(
        document,
        "music-preview-midi",
      ),
    insertButton:
      requiredElement<HTMLButtonElement>(
        document,
        "music-insert-word",
      ),
    clearButton:
      requiredElement<HTMLButtonElement>(
        document,
        "music-clear",
      ),
    result:
      requiredElement(
        document,
        "music-translation-result",
      ),
    unicodeOutput:
      requiredElement(
        document,
        "music-unicode-output",
      ),
    brfOutput:
      requiredElement(
        document,
        "music-brf-output",
      ),
    diagnosticsOutput:
      requiredElement(
        document,
        "music-diagnostic-output",
      ),
    error:
      requiredElement(
        document,
        "music-translation-error",
      ),
    errorCode:
      requiredElement(
        document,
        "music-error-code",
      ),
    errorMessage:
      requiredElement(
        document,
        "music-error-message",
      ),
    status:
      requiredElement(
        document,
        "music-taskpane-status",
      ),
  };
}

function hasMidiExtension(
  name: string,
): boolean {
  const normalized =
    name
      .trim()
      .toLowerCase();

  return (
    normalized.endsWith(
      ".mid",
    )
    || normalized.endsWith(
      ".midi",
    )
  );
}

function lineLabel(
  line: MusicBrailleMidiSourceLine,
  index: number,
): string {
  return (
    `Line ${index + 1}`
    + ` — Track ${line.trackIndex}`
    + ` / Channel ${line.channelOneBased}`
    + ` — ${line.noteCount} notes`
  );
}

export function createWordMusicTaskPane(
  document: Document,
  translator:
    MusicBrailleMidiTranslator =
      createMusicBrailleMidiTranslator(),
): WordMusicTaskPaneController {
  const ui =
    bindUi(
      document,
    );

  let wordEnabled =
    false;

  let selectedFile:
    MusicMidiFilePort | null =
      null;

  let selectedBytes:
    ArrayBuffer | null =
      null;

  let sourceLines:
    readonly MusicBrailleMidiSourceLine[] =
      Object.freeze([]);

  let selectedLine:
    MusicBrailleMidiSourceLine | null =
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
      "Music Braille preview unavailable.";
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
      "Music Braille insertion unavailable.";
  }

  function resetLines(): void {
    selectedBytes =
      null;
    sourceLines =
      Object.freeze([]);
    selectedLine =
      null;
    ui.lineSelect.innerHTML =
      '<option value="">Choose one MIDI line…</option>';
    ui.lineSelect.value =
      "";
    ui.lineSection.hidden =
      true;
  }

  function renderLines(): void {
    ui.lineSelect.innerHTML =
      [
        '<option value="">Choose one MIDI line…</option>',
        ...sourceLines.map(
          (line, index) =>
            `<option value="${line.id}">${lineLabel(line, index)}</option>`,
        ),
      ].join("");

    ui.lineSection.hidden =
      sourceLines.length === 0;

    if (
      sourceLines.length === 1
    ) {
      selectedLine =
        sourceLines[0]!;
      ui.lineSelect.value =
        selectedLine.id;
    } else {
      selectedLine =
        null;
      ui.lineSelect.value =
        "";
    }
  }

  function updateControls(): void {
    ui.fileName.textContent =
      selectedFile
        ? `${selectedFile.name} (${selectedFile.size} bytes)`
        : "No MIDI file selected.";

    ui.lineSelect.disabled =
      !wordEnabled
      || sourceLines.length === 0;

    ui.previewButton.disabled =
      !wordEnabled
      || selectedFile === null
      || selectedBytes === null
      || selectedLine === null;

    ui.insertButton.disabled =
      !wordEnabled
      || successfulUnicodePreview === null
      || insertionService === null;
  }

  const controller:
    WordMusicTaskPaneController = {
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
          successfulUnicodePreview =
            null;
          ui.fileInput.value =
            "";
          resetLines();
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
        hideFeedback();
        resetLines();

        if (
          file !== null
          && !hasMidiExtension(
            file.name,
          )
        ) {
          selectedFile =
            null;
          updateControls();

          showFailure(
            "UNSUPPORTED_MIDI_FILE_EXTENSION",
            "Choose a Standard MIDI file with a .mid or .midi extension.",
          );

          return;
        }

        selectedFile =
          file;
        updateControls();

        if (file === null) {
          ui.status.textContent =
            "";
          return;
        }

        ui.status.textContent =
          "Reading MIDI file and detecting source lines…";

        let bytes:
          ArrayBuffer;

        try {
          bytes =
            await file.arrayBuffer();
        } catch {
          showFailure(
            "MIDI_FILE_READ_FAILED",
            "The selected MIDI file could not be read locally.",
          );
          updateControls();
          return;
        }

        if (
          selectedFile !== file
        ) {
          return;
        }

        const inspection =
          translator.inspectMidi(
            bytes,
          );

        if (
          inspection.ok === false
        ) {
          showFailure(
            inspection.code,
            `parser: ${inspection.message}`,
          );
          updateControls();
          return;
        }

        selectedBytes =
          bytes;

        sourceLines =
          inspection.lines;

        renderLines();

        if (
          sourceLines.length === 1
        ) {
          ui.status.textContent =
            "1 MIDI line found and selected. Choose Preview Music Braille.";
        } else {
          ui.status.textContent =
            `${sourceLines.length} MIDI lines found. Choose exactly one line.`;
        }

        updateControls();
      },

      selectSourceLine(lineId) {
        successfulUnicodePreview =
          null;
        hideFeedback();

        selectedLine =
          sourceLines.find(
            (line) =>
              line.id === lineId,
          )
          ?? null;

        if (
          selectedLine === null
        ) {
          ui.status.textContent =
            sourceLines.length > 0
              ? "Choose exactly one MIDI line."
              : "";
        } else {
          const index =
            sourceLines.indexOf(
              selectedLine,
            );

          ui.status.textContent =
            `${lineLabel(selectedLine, index)} selected. Choose Preview Music Braille.`;
        }

        updateControls();
      },

      async previewSelectedMidi() {
        if (!wordEnabled) {
          showFailure(
            "WRONG_HOST",
            "Braille Music preview is available only in Microsoft Word during Phase 14.",
          );
          return;
        }

        if (
          selectedFile === null
          || selectedBytes === null
        ) {
          showFailure(
            "MIDI_FILE_REQUIRED",
            "Choose a .mid or .midi file before generating a Music Braille preview.",
          );
          return;
        }

        if (
          selectedLine === null
        ) {
          showFailure(
            "MIDI_SOURCE_LINE_REQUIRED",
            "Choose exactly one MIDI line before generating a Music Braille preview.",
          );
          return;
        }

        const line =
          selectedLine;

        successfulUnicodePreview =
          null;

        ui.previewButton.disabled =
          true;
        ui.insertButton.disabled =
          true;
        ui.status.textContent =
          `Generating Music Braille from ${lineLabel(line, sourceLines.indexOf(line))}…`;
        hideFeedback();

        const result =
          translator.translateMidiLine(
            selectedBytes,
            {
              trackIndex:
                line.trackIndex,
              channel:
                line.channel,
            },
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
          `Music Braille preview generated from ${lineLabel(line, sourceLines.indexOf(line))}.`;

        updateControls();
      },

      async insertPreviewIntoWord() {
        if (!wordEnabled) {
          showInsertionFailure(
            "WRONG_HOST",
            "Braille Music insertion is available only in Microsoft Word during Phase 14.",
          );
          return;
        }

        if (
          successfulUnicodePreview === null
        ) {
          showInsertionFailure(
            "MUSIC_BRAILLE_PREVIEW_REQUIRED",
            "Generate a successful Music Braille preview before inserting it into Word.",
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
          "Inserting the current Music Braille preview into Word…";

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
          "Music Braille inserted into the current Word selection/caret.";

        updateControls();
      },

      clear() {
        selectedFile =
          null;
        successfulUnicodePreview =
          null;
        ui.fileInput.value =
          "";
        resetLines();
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

  resetLines();
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

  ui.lineSelect.addEventListener(
    "change",
    () => {
      controller.selectSourceLine(
        ui.lineSelect.value,
      );
    },
  );

  ui.previewButton.addEventListener(
    "click",
    () => {
      void controller.previewSelectedMidi();
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
