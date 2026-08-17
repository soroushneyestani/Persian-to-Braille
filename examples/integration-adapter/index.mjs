import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

export function createPersianBrailleAdapter(
  translator =
    createPersianBrailleTranslator(),
) {
  return Object.freeze({
    translate(input) {
      const result =
        translator.translate(input);

      if (!result.ok) {
        return Object.freeze({
          ok: false,
          code:
            result.code,
          message:
            result.message,
        });
      }

      return Object.freeze({
        ok: true,
        braille:
          result.unicodeBraille,
        cells:
          result.cells,
      });
    },
  });
}
