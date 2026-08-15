import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  PersianBraillePowerPointHostAdapter,
  PersianBraillePowerPointSelectionService,
  PowerPointSelectionTranslationResult,
  PowerPointSelectionTranslationSuccess,
} from "./types.js";

export function createPowerPointSelectionService(
  host:
    PersianBraillePowerPointHostAdapter,
  translator:
    PersianBrailleTranslator =
      createPersianBrailleTranslator(),
): PersianBraillePowerPointSelectionService {
  return Object.freeze({
    translator,

    async translateSelection():
      Promise<PowerPointSelectionTranslationResult> {
      const selection =
        await host.readSelection();

      if (!selection.ok) {
        return Object.freeze({
          ok: false,
          source:
            "host",
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
            "Select non-empty text in PowerPoint before translating.",
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
        PowerPointSelectionTranslationSuccess,
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
