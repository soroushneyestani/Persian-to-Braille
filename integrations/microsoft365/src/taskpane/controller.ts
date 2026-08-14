import type {
  PersianBrailleWordSelectionService,
  WordHostFailure,
  WordMutationResult,
  WordSelectionTranslationSuccess,
} from "../word/types.js";

export interface WordTaskPaneSuccessPresentation {
  readonly sourceText: string;
  readonly unicodeBraille: string;
  readonly cells: string;
  readonly normalizedText: string;
  readonly structuralTokens: string;
}

export interface WordTaskPaneFailurePresentation {
  readonly domain:
    | "host"
    | "application"
    | "translation"
    | "clipboard";
  readonly code: string;
  readonly message: string;
}

export interface WordTaskPaneView {
  setReady(
    ready: boolean,
  ): void;

  setBusy(
    busy: boolean,
  ): void;

  showIdle(
    message: string,
  ): void;

  showSuccess(
    presentation:
      WordTaskPaneSuccessPresentation,
  ): void;

  showFailure(
    presentation:
      WordTaskPaneFailurePresentation,
  ): void;

  announce(
    message: string,
  ): void;
}

export interface ClipboardPort {
  writeText(
    text: string,
  ): Promise<void>;
}

export interface WordTaskPaneController {
  initialize(): void;

  translateSelection():
    Promise<void>;

  copyBraille():
    Promise<void>;

  replaceSelection():
    Promise<void>;

  insertAfterSelection():
    Promise<void>;
}

interface PublicFailureShape {
  readonly code?: unknown;
  readonly message?: unknown;
  readonly error?: {
    readonly code?: unknown;
    readonly message?: unknown;
  };
}

function sdkFailurePresentation(
  value: unknown,
): WordTaskPaneFailurePresentation {
  const shape =
    value as PublicFailureShape;

  const code =
    shape.code ??
    shape.error?.code ??
    "TRANSLATION_FAILED";

  const message =
    shape.message ??
    shape.error?.message ??
    "The selected text could not be translated by the current Persian Braille profile.";

  return {
    domain: "translation",
    code: String(code),
    message: String(message),
  };
}

function hostFailurePresentation(
  failure:
    WordHostFailure,
): WordTaskPaneFailurePresentation {
  return {
    domain: "host",
    code: failure.code,
    message: failure.message,
  };
}

function successPresentation(
  preview:
    WordSelectionTranslationSuccess,
): WordTaskPaneSuccessPresentation {
  return {
    sourceText:
      preview.sourceText,
    unicodeBraille:
      preview.translation
        .unicodeBraille,
    cells:
      preview.translation
        .cells
        .join(" "),
    normalizedText:
      preview.translation
        .normalizedText,
    structuralTokens:
      preview.translation
        .structuralTokens
        .join(" "),
  };
}

export function createWordTaskPaneController(
  service:
    PersianBrailleWordSelectionService,
  view:
    WordTaskPaneView,
  clipboard:
    ClipboardPort,
): WordTaskPaneController {
  let preview:
    WordSelectionTranslationSuccess |
    null =
      null;

  let busy = false;

  async function runMutation(
    operation: (
      current:
        WordSelectionTranslationSuccess,
    ) => Promise<WordMutationResult>,
    successMessage: string,
  ): Promise<void> {
    if (
      busy ||
      !preview
    ) {
      return;
    }

    busy = true;
    view.setBusy(true);

    try {
      const result =
        await operation(
          preview,
        );

      if (!result.ok) {
        view.showFailure(
          hostFailurePresentation(
            result,
          ),
        );
        return;
      }

      preview = null;

      view.showIdle(
        successMessage,
      );
      view.announce(
        successMessage,
      );
    } finally {
      busy = false;
      view.setBusy(false);
    }
  }

  return Object.freeze({
    initialize() {
      view.setReady(true);
      view.showIdle(
        "Select Persian text in Word, then choose Translate Selection.",
      );
    },

    async translateSelection() {
      if (busy) {
        return;
      }

      preview = null;
      busy = true;
      view.setBusy(true);

      try {
        const result =
          await service
            .translateSelection();

        if (result.ok) {
          preview =
            result;
          view.showSuccess(
            successPresentation(
              result,
            ),
          );
          return;
        }

        if (
          result.source ===
          "host"
        ) {
          view.showFailure(
            hostFailurePresentation(
              result.failure,
            ),
          );
          return;
        }

        if (
          result.source ===
          "application"
        ) {
          view.showFailure({
            domain:
              "application",
            code:
              result.code,
            message:
              result.message,
          });
          return;
        }

        view.showFailure(
          sdkFailurePresentation(
            result.translation,
          ),
        );
      } finally {
        busy = false;
        view.setBusy(false);
      }
    },

    async copyBraille() {
      if (
        busy ||
        !preview
      ) {
        return;
      }

      try {
        await clipboard.writeText(
          preview.translation
            .unicodeBraille,
        );

        view.announce(
          "Unicode Braille copied.",
        );
      } catch {
        view.showFailure({
          domain: "clipboard",
          code:
            "CLIPBOARD_WRITE_FAILED",
          message:
            "The Braille result could not be copied automatically. Select the output and copy it manually.",
        });
      }
    },

    async replaceSelection() {
      await runMutation(
        (current) =>
          service
            .replaceWithBraille(
              current,
            ),
        "Word selection replaced with the current Braille result.",
      );
    },

    async insertAfterSelection() {
      await runMutation(
        (current) =>
          service
            .insertBrailleAfter(
              current,
            ),
        "Braille inserted after the current Word selection.",
      );
    },
  });
}
