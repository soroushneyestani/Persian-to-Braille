export type WordMutationLocation =
  | "Replace"
  | "After";

export type WordRuntimeMutationOutcome =
  | "written"
  | "selection-changed";

export interface WordRuntimePort {
  isReady(): boolean;
  isWordHost(): boolean;
  supportsWordApi11(): boolean;

  readSelectionText():
    Promise<string>;

  mutateSelection(
    expectedSourceText: string,
    text: string,
    location:
      WordMutationLocation,
  ): Promise<WordRuntimeMutationOutcome>;
}

interface OfficeRequirementsPort {
  isSetSupported(
    name: string,
    version: string,
  ): boolean;
}

interface OfficeContextPort {
  readonly host: unknown;
  readonly requirements:
    OfficeRequirementsPort;
}

interface OfficeGlobalPort {
  readonly context:
    OfficeContextPort;
  readonly HostType?: {
    readonly Word?: unknown;
  };
}

interface WordRangePort {
  text: string;

  load(
    property: "text",
  ): void;

  insertText(
    text: string,
    location:
      WordMutationLocation,
  ): unknown;
}

interface WordDocumentPort {
  getSelection():
    WordRangePort;
}

interface WordRequestContextPort {
  readonly document:
    WordDocumentPort;

  sync():
    Promise<void>;
}

interface WordGlobalPort {
  run<T>(
    callback: (
      context:
        WordRequestContextPort,
    ) => Promise<T>,
  ): Promise<T>;
}

export interface OfficeWordGlobals {
  readonly Office?:
    OfficeGlobalPort;
  readonly Word?:
    WordGlobalPort;
}

function wordHostValue(
  office:
    OfficeGlobalPort,
): unknown {
  return (
    office.HostType?.Word ??
    "Word"
  );
}

export function createOfficeWordRuntime(
  globals:
    OfficeWordGlobals,
): WordRuntimePort {
  function office():
    OfficeGlobalPort | undefined {
    return globals.Office;
  }

  function word():
    WordGlobalPort | undefined {
    return globals.Word;
  }

  return Object.freeze({
    isReady() {
      return Boolean(
        office() &&
        word(),
      );
    },

    isWordHost() {
      const currentOffice =
        office();

      if (!currentOffice) {
        return false;
      }

      return (
        currentOffice.context.host ===
        wordHostValue(
          currentOffice,
        )
      );
    },

    supportsWordApi11() {
      const currentOffice =
        office();

      if (!currentOffice) {
        return false;
      }

      return currentOffice
        .context
        .requirements
        .isSetSupported(
          "WordApi",
          "1.1",
        );
    },

    async readSelectionText() {
      const currentWord =
        word();

      if (!currentWord) {
        throw new Error(
          "Word runtime unavailable.",
        );
      }

      return currentWord.run(
        async (context) => {
          const range =
            context.document
              .getSelection();

          range.load("text");
          await context.sync();

          return range.text;
        },
      );
    },

    async mutateSelection(
      expectedSourceText: string,
      text: string,
      location: WordMutationLocation,
    ) {
      const currentWord =
        word();

      if (!currentWord) {
        throw new Error(
          "Word runtime unavailable.",
        );
      }

      return currentWord.run(
        async (context) => {
          const range =
            context.document
              .getSelection();

          range.load("text");
          await context.sync();

          if (
            range.text !==
            expectedSourceText
          ) {
            return "selection-changed";
          }

          range.insertText(
            text,
            location,
          );

          await context.sync();

          return "written";
        },
      );
    },
  });
}

export function createGlobalOfficeWordRuntime():
  WordRuntimePort {
  const globals =
    globalThis as unknown as
      OfficeWordGlobals;

  return createOfficeWordRuntime(
    globals,
  );
}
