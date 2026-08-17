import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

const translator =
  createPersianBrailleTranslator();

export function describeTranslation(input) {
  const result =
    translator.translate(input);

  if (result.ok) {
    return Object.freeze({
      ok: true,
      unicodeBraille:
        result.unicodeBraille,
    });
  }

  return Object.freeze({
    ok: false,
    code: result.code,
    message: result.message,
  });
}

export function demonstrateFailure() {
  return describeTranslation("😀");
}
