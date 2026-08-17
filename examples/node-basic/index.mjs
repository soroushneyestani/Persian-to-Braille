import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

export function translatePersian(input) {
  const translator =
    createPersianBrailleTranslator();

  return translator.translate(input);
}

export function runNodeBasic(
  input = "سلام",
  writer = console,
) {
  const result =
    translatePersian(input);

  if (!result.ok) {
    writer.error(
      `${result.code}: ${result.message}`,
    );
    return 1;
  }

  writer.log(result.unicodeBraille);
  return 0;
}

const executedPath =
  process.argv[1]
    ? new URL(
        `file://${process.argv[1]}`,
      ).href
    : null;

if (
  executedPath
  && executedPath === import.meta.url
) {
  process.exitCode =
    runNodeBasic(
      process.argv.slice(2).join(" ") || "سلام",
    );
}
