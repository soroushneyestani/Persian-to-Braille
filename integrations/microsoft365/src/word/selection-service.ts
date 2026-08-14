import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  PersianBrailleWordHostAdapter,
  PersianBrailleWordSelectionService,
  WordSelectionTranslationResult,
} from "./types.js";

export function createWordSelectionService(
  host:
    PersianBrailleWordHostAdapter,
  translator:
    PersianBrailleTranslator =
      createPersianBrailleTranslator(),
): PersianBrailleWordSelectionService {
  return Object.freeze({
    translator,

    async translateSelection():
      Promise<WordSelectionTranslationResult> {
      const selection =
        await host.readSelection();

      if (!selection.ok) {
        return Object.freeze({
          ok: false,
          source: "host",
          failure:
            selection,
        });
      }

      if (
        selection.text.length ===
        0
      ) {
        return Object.freeze({
          ok: false,
          source: "application",
          code: "EMPTY_SELECTION",
          message:
            "Select text in Word before translating.",
        });
      }

      const translation =
        translator.translate(
          selection.text,
        );

      if (!translation.ok) {
        return Object.freeze({
          ok: false,
          source:
            "translation",
          sourceText:
            selection.text,
          translation,
        });
      }

      return Object.freeze({
        ok: true,
        sourceText:
          selection.text,
        translation,
      });
    },

    async replaceWithBraille(
      preview:
        import("./types.js").WordSelectionTranslationSuccess,
    ) {
      return host
        .replaceSelection(
          preview.sourceText,
          preview.translation
            .unicodeBraille,
        );
    },

    async insertBrailleAfter(
      preview:
        import("./types.js").WordSelectionTranslationSuccess,
    ) {
      return host
        .insertAfterSelection(
          preview.sourceText,
          preview.translation
            .unicodeBraille,
        );
    },
  });
}
