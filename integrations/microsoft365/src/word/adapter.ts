import {
  WORD_HOST_FAILURE_CODES,
} from "./types.js";

import type {
  PersianBrailleWordHostAdapter,
  WordHostFailure,
  WordMutationResult,
  WordSelectionReadResult,
} from "./types.js";

import type {
  WordMutationLocation,
  WordRuntimePort,
} from "./runtime.js";

function failure(
  code:
    WordHostFailure["code"],
  message: string,
): WordHostFailure {
  return Object.freeze({
    ok: false,
    domain: "host",
    code,
    message,
  });
}

function preflight(
  runtime:
    WordRuntimePort,
): WordHostFailure | null {
  if (!runtime.isReady()) {
    return failure(
      WORD_HOST_FAILURE_CODES
        .officeNotReady,
      "Office.js and the Word runtime must be ready before document access.",
    );
  }

  if (!runtime.isWordHost()) {
    return failure(
      WORD_HOST_FAILURE_CODES
        .wrongHost,
      "Phase 9 supports Microsoft Word only.",
    );
  }

  if (
    !runtime
      .supportsWordApi11()
  ) {
    return failure(
      WORD_HOST_FAILURE_CODES
        .unsupportedRequirementSet,
      "WordApi 1.1 is required for the Phase 9 Word add-in.",
    );
  }

  return null;
}

async function mutate(
  runtime:
    WordRuntimePort,
  expectedSourceText: string,
  text: string,
  location:
    WordMutationLocation,
): Promise<WordMutationResult> {
  const blocked =
    preflight(runtime);

  if (blocked) {
    return blocked;
  }

  try {
    const outcome =
      await runtime
        .mutateSelection(
          expectedSourceText,
          text,
          location,
        );

    if (
      outcome ===
      "selection-changed"
    ) {
      return failure(
        WORD_HOST_FAILURE_CODES
          .selectionChanged,
        "The current Word selection no longer matches the text used to create the Braille preview.",
      );
    }

    return Object.freeze({
      ok: true,
    });
  } catch {
    return failure(
      WORD_HOST_FAILURE_CODES
        .documentWriteFailed,
      "Word could not update the current document selection.",
    );
  }
}

export function createWordHostAdapter(
  runtime:
    WordRuntimePort,
): PersianBrailleWordHostAdapter {
  return Object.freeze({
    async readSelection():
      Promise<WordSelectionReadResult> {
      const blocked =
        preflight(runtime);

      if (blocked) {
        return blocked;
      }

      try {
        const text =
          await runtime
            .readSelectionText();

        return Object.freeze({
          ok: true,
          text,
        });
      } catch {
        return failure(
          WORD_HOST_FAILURE_CODES
            .selectionUnavailable,
          "Word could not read the current document selection.",
        );
      }
    },

    async replaceSelection(
      expectedSourceText: string,
      replacementText: string,
    ) {
      return mutate(
        runtime,
        expectedSourceText,
        replacementText,
        "Replace",
      );
    },

    async insertAfterSelection(
      expectedSourceText: string,
      insertedText: string,
    ) {
      return mutate(
        runtime,
        expectedSourceText,
        insertedText,
        "After",
      );
    },
  });
}
