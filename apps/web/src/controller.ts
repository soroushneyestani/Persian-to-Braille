import type {
  PersianBrailleProfileInfo,
  PersianBrailleTranslationResult,
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

export interface PersianBraillePlaygroundResultView {
  readonly ok: boolean;
  readonly unicodeBraille: string;
  readonly cells: readonly string[];
  readonly normalizedText: string;
  readonly structuralTokens: readonly string[];
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly errorDetails: readonly string[];
}

export interface PersianBraillePlaygroundView {
  readInput(): string;
  writeInput(value: string): void;
  renderProfile(
    profile: PersianBrailleProfileInfo,
  ): void;
  renderResult(
    result: PersianBraillePlaygroundResultView,
  ): void;
  clearResult(): void;
  renderCopyFeedback(
    message: string,
  ): void;
  focusInput(): void;
}

export interface PersianBrailleClipboard {
  writeText(
    text: string,
  ): Promise<void>;
}

export interface PersianBraillePlaygroundController {
  readonly profile:
    PersianBrailleProfileInfo;
  translate(): void;
  clear(): void;
  copyUnicodeBraille():
    Promise<void>;
}

function errorDetails(
  result: Extract<
    PersianBrailleTranslationResult,
    { readonly ok: false }
  >,
): readonly string[] {
  const details: string[] = [];

  if (result.location) {
    details.push(
      `Code-point index: ${result.location.codePointIndex}`,
    );
    details.push(
      `UTF-16 index: ${result.location.utf16Index}`,
    );
  }

  if (result.character) {
    details.push(
      `Character: ${result.character}`,
    );
  }

  if (result.codePoint) {
    details.push(
      `Code point: ${result.codePoint}`,
    );
  }

  if (
    result.candidateRuleIds &&
    result.candidateRuleIds.length > 0
  ) {
    details.push(
      `Candidate rules: ${result.candidateRuleIds.join(", ")}`,
    );
  }

  if (result.causeCode) {
    details.push(
      `Cause: ${result.causeCode}`,
    );
  }

  return details;
}

export function projectTranslationResult(
  result:
    PersianBrailleTranslationResult,
): PersianBraillePlaygroundResultView {
  if (result.ok) {
    return Object.freeze({
      ok: true,
      unicodeBraille:
        result.unicodeBraille,
      cells:
        Object.freeze(
          [...result.cells],
        ),
      normalizedText:
        result.normalizedText,
      structuralTokens:
        Object.freeze(
          [...result.structuralTokens],
        ),
      errorCode: "",
      errorMessage: "",
      errorDetails:
        Object.freeze([]),
    });
  }

  return Object.freeze({
    ok: false,
    unicodeBraille: "",
    cells:
      Object.freeze([]),
    normalizedText: "",
    structuralTokens:
      Object.freeze([]),
    errorCode:
      result.code,
    errorMessage:
      result.message,
    errorDetails:
      Object.freeze(
        [...errorDetails(result)],
      ),
  });
}

export function createPlaygroundController(
  translator:
    PersianBrailleTranslator,
  view:
    PersianBraillePlaygroundView,
  clipboard:
    PersianBrailleClipboard,
): PersianBraillePlaygroundController {
  let lastUnicodeBraille = "";

  view.renderProfile(
    translator.profile,
  );

  return Object.freeze({
    profile:
      translator.profile,

    translate() {
      view.renderCopyFeedback(
        "",
      );

      const result =
        translator.translate(
          view.readInput(),
        );

      const projected =
        projectTranslationResult(
          result,
        );

      lastUnicodeBraille =
        projected.ok
          ? projected.unicodeBraille
          : "";

      view.renderResult(
        projected,
      );
    },

    clear() {
      lastUnicodeBraille = "";
      view.writeInput("");
      view.clearResult();
      view.renderCopyFeedback("");
      view.focusInput();
    },

    async copyUnicodeBraille() {
      if (
        lastUnicodeBraille.length === 0
      ) {
        view.renderCopyFeedback(
          "Nothing to copy yet.",
        );
        return;
      }

      try {
        await clipboard.writeText(
          lastUnicodeBraille,
        );
        view.renderCopyFeedback(
          "Braille output copied.",
        );
      } catch {
        view.renderCopyFeedback(
          "Copy failed. Select the Braille output and copy it manually.",
        );
      }
    },
  });
}
