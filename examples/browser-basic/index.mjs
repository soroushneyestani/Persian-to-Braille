import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

const translator =
  createPersianBrailleTranslator();

export function translateForBrowser(input) {
  const result =
    translator.translate(input);

  if (!result.ok) {
    return Object.freeze({
      ok: false,
      code: result.code,
      message: result.message,
    });
  }

  return Object.freeze({
    ok: true,
    unicodeBraille:
      result.unicodeBraille,
    cells:
      result.cells,
    normalizedText:
      result.normalizedText,
  });
}
