import {
  WORD_HOST_FAILURE_CODES,
} from "./types.js";

import type {
  WordHostFailure,
} from "./types.js";

import type {
  WordRuntimePort,
} from "./runtime.js";

export interface WordMusicInsertionSuccess {
  readonly ok: true;
  readonly unicodeBraille: string;
}

export type WordMusicInsertionResult =
  | WordMusicInsertionSuccess
  | WordHostFailure;

export interface WordMusicInsertionService {
  insertCurrentSelection(
    unicodeBraille: string,
  ): Promise<WordMusicInsertionResult>;
}

function hostFailure(
  code: WordHostFailure["code"],
  message: string,
): WordHostFailure {
  return Object.freeze({
    ok: false,
    domain: "host",
    code,
    message,
  });
}

export function createWordMusicInsertionService(
  runtime: WordRuntimePort,
): WordMusicInsertionService {
  return Object.freeze({
    async insertCurrentSelection(
      unicodeBraille: string,
    ) {
      if (!runtime.isReady()) {
        return hostFailure(
          WORD_HOST_FAILURE_CODES.officeNotReady,
          "Office.js and the Word runtime must be ready before Music Braille can be inserted.",
        );
      }

      if (!runtime.isWordHost()) {
        return hostFailure(
          WORD_HOST_FAILURE_CODES.wrongHost,
          "Braille Music insertion is available only in Microsoft Word during Phase 14.",
        );
      }

      if (!runtime.supportsWordApi11()) {
        return hostFailure(
          WORD_HOST_FAILURE_CODES.unsupportedRequirementSet,
          "WordApi 1.1 is required for Music Braille insertion.",
        );
      }

      try {
        await runtime.replaceCurrentSelection(
          unicodeBraille,
        );
      } catch {
        return hostFailure(
          WORD_HOST_FAILURE_CODES.documentWriteFailed,
          "Word could not insert the Music Braille preview into the current selection or caret.",
        );
      }

      return Object.freeze({
        ok: true,
        unicodeBraille,
      });
    },
  });
}
