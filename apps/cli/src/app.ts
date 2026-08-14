import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  PersianBrailleProfileInfo,
  PersianBrailleTranslationResult,
} from "@persian-braille/sdk";

export const CLI_EXIT_CODES = Object.freeze({
  success: 0,
  translationFailure: 1,
  usageError: 2,
  internalError: 3,
} as const);

export interface PersianBrailleCliIo {
  readStdin(): Promise<string>;
  writeStdout(text: string): void;
  writeStderr(text: string): void;
}

type TranslateFormat =
  | "unicode"
  | "cells"
  | "json";

type ProfileFormat =
  | "text"
  | "json";

interface ParsedTranslateArgumentInput {
  readonly kind: "translate";
  readonly format: TranslateFormat;
  readonly inputSource: "argument";
  readonly input: string;
}

interface ParsedTranslateStdinInput {
  readonly kind: "translate";
  readonly format: TranslateFormat;
  readonly inputSource: "stdin";
}

type ParsedTranslateArguments =
  | ParsedTranslateArgumentInput
  | ParsedTranslateStdinInput;

interface ParsedProfileArguments {
  readonly kind: "profile";
  readonly format: ProfileFormat;
}

interface ParsedHelpArguments {
  readonly kind: "help";
  readonly text: string;
}

interface ParsedUsageError {
  readonly kind: "usage-error";
  readonly message: string;
  readonly help: string;
}

type ParsedArguments =
  | ParsedTranslateArguments
  | ParsedProfileArguments
  | ParsedHelpArguments
  | ParsedUsageError;

const ROOT_HELP = `Usage:
  persian-braille translate <text> [--format unicode|cells|json]
  persian-braille translate --stdin [--format unicode|cells|json]
  persian-braille profile [--format text|json]

Commands:
  translate   Translate Persian print text through the public SDK.
  profile     Show bundled profile metadata.

Options:
  -h, --help  Show help.
`;

const TRANSLATE_HELP = `Usage:
  persian-braille translate <text> [--format unicode|cells|json]
  persian-braille translate --stdin [--format unicode|cells|json]

Input:
  Provide exactly one positional text argument or use --stdin.
  Stdin is passed to the SDK verbatim; no application normalization is applied.

Formats:
  unicode   Unicode Braille output (default)
  cells     SDK cells joined by one ASCII space
  json      Versioned machine-readable SDK result envelope
`;

const PROFILE_HELP = `Usage:
  persian-braille profile [--format text|json]

Formats:
  text   Human-readable bundled profile metadata (default)
  json   Versioned machine-readable profile envelope
`;

function isHelpFlag(
  value: string,
): boolean {
  return (
    value === "--help" ||
    value === "-h"
  );
}

function usageError(
  message: string,
  help: string,
): ParsedUsageError {
  return {
    kind: "usage-error",
    message,
    help,
  };
}

function parseFormatFlag(
  args: readonly string[],
  index: number,
): {
  readonly consumed: number;
  readonly value?: string;
  readonly error?: string;
} {
  const current =
    args[index];

  if (current === "--format") {
    const value =
      args[index + 1];

    if (
      value === undefined ||
      value.startsWith("-")
    ) {
      return {
        consumed: 1,
        error:
          "--format requires a value.",
      };
    }

    return {
      consumed: 2,
      value,
    };
  }

  if (
    current?.startsWith(
      "--format=",
    )
  ) {
    const value =
      current.slice(
        "--format=".length,
      );

    if (value.length === 0) {
      return {
        consumed: 1,
        error:
          "--format requires a value.",
      };
    }

    return {
      consumed: 1,
      value,
    };
  }

  return {
    consumed: 0,
  };
}

function parseTranslate(
  args: readonly string[],
): ParsedArguments {
  if (
    args.some(isHelpFlag)
  ) {
    return {
      kind: "help",
      text: TRANSLATE_HELP,
    };
  }

  let format:
    TranslateFormat =
      "unicode";
  let useStdin = false;
  const positionals:
    string[] = [];

  for (
    let index = 0;
    index < args.length;
  ) {
    const current =
      args[index];

    if (current === undefined) {
      break;
    }

    if (current === "--stdin") {
      if (useStdin) {
        return usageError(
          "--stdin may be specified only once.",
          TRANSLATE_HELP,
        );
      }

      useStdin = true;
      index += 1;
      continue;
    }

    const formatFlag =
      parseFormatFlag(
        args,
        index,
      );

    if (
      formatFlag.consumed > 0
    ) {
      if (formatFlag.error) {
        return usageError(
          formatFlag.error,
          TRANSLATE_HELP,
        );
      }

      const value =
        formatFlag.value;

      if (
        value !== "unicode" &&
        value !== "cells" &&
        value !== "json"
      ) {
        return usageError(
          `Unsupported translate format: ${String(value)}.`,
          TRANSLATE_HELP,
        );
      }

      format = value;
      index +=
        formatFlag.consumed;
      continue;
    }

    if (current.startsWith("-")) {
      return usageError(
        `Unknown translate option: ${current}.`,
        TRANSLATE_HELP,
      );
    }

    positionals.push(
      current,
    );
    index += 1;
  }

  if (
    useStdin &&
    positionals.length > 0
  ) {
    return usageError(
      "Translation input must come from exactly one source: argument or --stdin.",
      TRANSLATE_HELP,
    );
  }

  if (useStdin) {
    return {
      kind: "translate",
      format,
      inputSource: "stdin",
    };
  }

  if (
    positionals.length !== 1
  ) {
    return usageError(
      "Translation requires exactly one text argument or --stdin.",
      TRANSLATE_HELP,
    );
  }

  const input =
    positionals[0];

  if (input === undefined) {
    return usageError(
      "Translation requires exactly one text argument or --stdin.",
      TRANSLATE_HELP,
    );
  }

  return {
    kind: "translate",
    format,
    inputSource: "argument",
    input,
  };
}

function parseProfile(
  args: readonly string[],
): ParsedArguments {
  if (
    args.some(isHelpFlag)
  ) {
    return {
      kind: "help",
      text: PROFILE_HELP,
    };
  }

  let format:
    ProfileFormat =
      "text";

  for (
    let index = 0;
    index < args.length;
  ) {
    const current =
      args[index];

    if (current === undefined) {
      break;
    }

    const formatFlag =
      parseFormatFlag(
        args,
        index,
      );

    if (
      formatFlag.consumed > 0
    ) {
      if (formatFlag.error) {
        return usageError(
          formatFlag.error,
          PROFILE_HELP,
        );
      }

      const value =
        formatFlag.value;

      if (
        value !== "text" &&
        value !== "json"
      ) {
        return usageError(
          `Unsupported profile format: ${String(value)}.`,
          PROFILE_HELP,
        );
      }

      format = value;
      index +=
        formatFlag.consumed;
      continue;
    }

    if (current.startsWith("-")) {
      return usageError(
        `Unknown profile option: ${current}.`,
        PROFILE_HELP,
      );
    }

    return usageError(
      "The profile command does not accept positional arguments.",
      PROFILE_HELP,
    );
  }

  return {
    kind: "profile",
    format,
  };
}

function parseArguments(
  args: readonly string[],
): ParsedArguments {
  if (
    args.length === 0
  ) {
    return usageError(
      "A command is required.",
      ROOT_HELP,
    );
  }

  const [
    command,
    ...rest
  ] = args;

  if (
    command === "help" ||
    isHelpFlag(
      command ?? "",
    )
  ) {
    return {
      kind: "help",
      text: ROOT_HELP,
    };
  }

  if (
    command === "translate"
  ) {
    return parseTranslate(
      rest,
    );
  }

  if (
    command === "profile"
  ) {
    return parseProfile(
      rest,
    );
  }

  return usageError(
    `Unknown command: ${String(command)}.`,
    ROOT_HELP,
  );
}

function serializeJson(
  value: unknown,
): string {
  return (
    JSON.stringify(value) +
    "\n"
  );
}

function formatProfileText(
  profile:
    PersianBrailleProfileInfo,
): string {
  return [
    `Profile: ${profile.id}`,
    `Version: ${profile.version}`,
    `Status: ${profile.status}`,
    `Direction: ${profile.direction}`,
    "",
  ].join("\n");
}

function formatHumanFailure(
  result:
    Extract<
      PersianBrailleTranslationResult,
      { readonly ok: false }
    >,
): string {
  return (
    `${result.code}: ${result.message}\n`
  );
}

function translationExitCode(
  result:
    PersianBrailleTranslationResult,
): number {
  return result.ok
    ? CLI_EXIT_CODES.success
    : CLI_EXIT_CODES
        .translationFailure;
}

export async function runCli(
  args: readonly string[],
  io: PersianBrailleCliIo,
): Promise<number> {
  try {
    const parsed =
      parseArguments(
        args,
      );

    if (
      parsed.kind === "help"
    ) {
      io.writeStdout(
        parsed.text,
      );
      return CLI_EXIT_CODES
        .success;
    }

    if (
      parsed.kind ===
      "usage-error"
    ) {
      io.writeStderr(
        `USAGE_ERROR: ${parsed.message}\n\n${parsed.help}`,
      );
      return CLI_EXIT_CODES
        .usageError;
    }

    const translator =
      createPersianBrailleTranslator();

    if (
      parsed.kind ===
      "profile"
    ) {
      if (
        parsed.format ===
        "json"
      ) {
        io.writeStdout(
          serializeJson({
            schemaVersion: "1",
            command: "profile",
            profile:
              translator.profile,
          }),
        );
      } else {
        io.writeStdout(
          formatProfileText(
            translator.profile,
          ),
        );
      }

      return CLI_EXIT_CODES
        .success;
    }

    const input =
      parsed.inputSource ===
      "stdin"
        ? await io.readStdin()
        : parsed.input;

    const result =
      translator.translate(
        input,
      );

    if (
      parsed.format ===
      "json"
    ) {
      io.writeStdout(
        serializeJson({
          schemaVersion: "1",
          command: "translate",
          result,
        }),
      );

      return translationExitCode(
        result,
      );
    }

    if (!result.ok) {
      io.writeStderr(
        formatHumanFailure(
          result,
        ),
      );
      return CLI_EXIT_CODES
        .translationFailure;
    }

    if (
      parsed.format ===
      "cells"
    ) {
      io.writeStdout(
        `${result.cells.join(" ")}\n`,
      );
    } else {
      io.writeStdout(
        `${result.unicodeBraille}\n`,
      );
    }

    return CLI_EXIT_CODES
      .success;
  } catch {
    io.writeStderr(
      "INTERNAL_ERROR: Unexpected CLI failure.\n",
    );
    return CLI_EXIT_CODES
      .internalError;
  }
}
