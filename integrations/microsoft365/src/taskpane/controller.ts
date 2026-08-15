import type {
  OfficeHostCapabilities,
  OfficeHostFailure,
  OfficeMutationResult,
  OfficeSdkTranslationSuccess,
} from "../shared/types.js";

import type {
  PersianBrailleWordSelectionService,
} from "../word/types.js";

import {
  WORD_TASK_PANE_CAPABILITIES,
} from "./host-config.js";

export interface OfficeTaskPaneSuccessPresentation {
  readonly sourceText: string;
  readonly unicodeBraille: string;
  readonly cells: string;
  readonly normalizedText: string;
  readonly structuralTokens: string;
}

export interface OfficeTaskPaneFailurePresentation {
  readonly domain:
    | "host"
    | "application"
    | "translation"
    | "clipboard";
  readonly code: string;
  readonly message: string;
}

export interface OfficeTaskPaneView {
  setCapabilities?(
    capabilities:
      OfficeHostCapabilities,
  ): void;

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
      OfficeTaskPaneSuccessPresentation,
  ): void;

  showFailure(
    presentation:
      OfficeTaskPaneFailurePresentation,
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

export interface OfficeTaskPaneController {
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

export interface TaskPaneTranslationSuccess {
  readonly ok: true;
  readonly sourceText: string;
  readonly translation:
    OfficeSdkTranslationSuccess;
}

interface TaskPaneHostTranslationFailure {
  readonly ok: false;
  readonly source: "host";
  readonly failure:
    OfficeHostFailure;
}

interface TaskPaneApplicationFailure {
  readonly ok: false;
  readonly source: "application";
  readonly code: string;
  readonly message: string;
}

interface TaskPaneTranslationFailure {
  readonly ok: false;
  readonly source: "translation";
  readonly sourceText?: string;
  readonly translation:
    unknown;
}

type TaskPaneTranslationResult<
  TPreview extends
    TaskPaneTranslationSuccess,
> =
  | TPreview
  | TaskPaneHostTranslationFailure
  | TaskPaneApplicationFailure
  | TaskPaneTranslationFailure;

export interface OfficeTaskPaneSelectionService<
  TPreview extends
    TaskPaneTranslationSuccess,
> {
  translateSelection():
    Promise<
      TaskPaneTranslationResult<
        TPreview
      >
    >;

  replaceWithBraille(
    preview: TPreview,
  ): Promise<OfficeMutationResult>;

  insertBrailleAfter?(
    preview: TPreview,
  ): Promise<OfficeMutationResult>;
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
): OfficeTaskPaneFailurePresentation {
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
    OfficeHostFailure,
): OfficeTaskPaneFailurePresentation {
  return {
    domain: "host",
    code: failure.code,
    message: failure.message,
  };
}

function successPresentation(
  preview:
    TaskPaneTranslationSuccess,
): OfficeTaskPaneSuccessPresentation {
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

function initialInstruction(
  capabilities:
    OfficeHostCapabilities,
): string {
  if (
    capabilities.hostKind ===
      "excel"
  ) {
    return "Select one non-empty plain-text cell in Excel, then choose Translate Selection.";
  }

  return `Select Persian text in ${capabilities.hostLabel}, then choose Translate Selection.`;
}

function unsupportedAction(
  capabilities:
    OfficeHostCapabilities,
  action: string,
): OfficeTaskPaneFailurePresentation {
  return {
    domain: "application",
    code: "ACTION_UNSUPPORTED",
    message:
      `${action} is not available for ${capabilities.hostLabel} in the current Microsoft 365 integration.`,
  };
}

export function createOfficeTaskPaneController<
  TPreview extends
    TaskPaneTranslationSuccess,
>(
  service:
    OfficeTaskPaneSelectionService<
      TPreview
    >,
  view:
    OfficeTaskPaneView,
  clipboard:
    ClipboardPort,
  capabilities:
    OfficeHostCapabilities,
): OfficeTaskPaneController {
  let preview:
    TPreview |
    null =
      null;

  let busy = false;

  async function runMutation(
    operation: (
      current:
        TPreview,
    ) => Promise<OfficeMutationResult>,
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
      view.setCapabilities?.(
        capabilities,
      );
      view.setReady(true);
      view.showIdle(
        initialInstruction(
          capabilities,
        ),
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
      if (
        !capabilities.canReplace
      ) {
        view.showFailure(
          unsupportedAction(
            capabilities,
            "Replace Selection",
          ),
        );
        return;
      }

      await runMutation(
        (current) =>
          service
            .replaceWithBraille(
              current,
            ),
        `${capabilities.hostLabel} selection replaced with the current Braille result.`,
      );
    },

    async insertAfterSelection() {
      if (
        !capabilities
          .canInsertAfter ||
        !service
          .insertBrailleAfter
      ) {
        view.showFailure(
          unsupportedAction(
            capabilities,
            "Insert After",
          ),
        );
        return;
      }

      await runMutation(
        (current) =>
          service
            .insertBrailleAfter!(
              current,
            ),
        `Braille inserted after the current ${capabilities.hostLabel} selection.`,
      );
    },
  });
}

export type WordTaskPaneSuccessPresentation =
  OfficeTaskPaneSuccessPresentation;

export type WordTaskPaneFailurePresentation =
  OfficeTaskPaneFailurePresentation;

export type WordTaskPaneView =
  OfficeTaskPaneView;

export type WordTaskPaneController =
  OfficeTaskPaneController;

export function createWordTaskPaneController(
  service:
    PersianBrailleWordSelectionService,
  view:
    WordTaskPaneView,
  clipboard:
    ClipboardPort,
): WordTaskPaneController {
  return createOfficeTaskPaneController(
    service,
    view,
    clipboard,
    WORD_TASK_PANE_CAPABILITIES,
  );
}
