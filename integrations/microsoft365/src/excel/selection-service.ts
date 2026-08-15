import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  ExcelSelectionTranslationResult,
  ExcelSelectionTranslationSuccess,
  PersianBrailleExcelHostAdapter,
  PersianBrailleExcelSelectionService,
} from "./types.js";

export function createExcelSelectionService(
  host:
    PersianBrailleExcelHostAdapter,
  translator:
    PersianBrailleTranslator =
      createPersianBrailleTranslator(),
): PersianBrailleExcelSelectionService {
  return Object.freeze({
    translator,

    async translateSelection():
      Promise<ExcelSelectionTranslationResult> {
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
          source:
            "application",
          code:
            "EMPTY_SELECTION",
          message:
            "Select a non-empty plain-text cell in Excel before translating.",
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
        mutationContext:
          selection.snapshot,
      });
    },

    async replaceWithBraille(
      preview:
        ExcelSelectionTranslationSuccess,
    ) {
      return host
        .replaceSelection(
          preview
            .mutationContext,
          preview
            .translation
            .unicodeBraille,
        );
    },
  });
}
