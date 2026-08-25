import {
  createExcelHostAdapter,
  createExcelSelectionService,
  createGlobalOfficeExcelRuntime,
  createGlobalOfficePowerPointRuntime,
  createGlobalOfficeWordRuntime,
  createPowerPointHostAdapter,
  createPowerPointSelectionService,
  createWordHostAdapter,
  createWordSelectionService,
} from "../index.js";

import {
  createWordMusicInsertionService,
} from "../word/music-insertion.js";

import {
  createOfficeTaskPaneController,
} from "./controller.js";

import {
  createOfficeTaskPaneDomView,
} from "./dom-view.js";

import {
  createWordMusicTaskPane,
} from "./music-pane.js";

import {
  createWordMusicXmlTaskPane,
} from "./musicxml-pane.js";

import {
  createFeatureTabController,
} from "./feature-tabs.js";

import {
  createGermanTaskPane,
} from "./german-pane.js";

import type {
  GermanMutationResult,
  GermanSelectionPort,
} from "./german-pane.js";

import {
  evaluateOfficeTaskPaneReadiness,
} from "./readiness.js";

import type {
  OfficeReadyInfoPort,
} from "./readiness.js";

interface OfficeReadyPort {
  onReady(
    callback: (
      info:
        OfficeReadyInfoPort,
    ) => void,
  ):
    | Promise<unknown>
    | void;
}

function officeReadyPort():
  OfficeReadyPort | undefined {
  return (
    globalThis as unknown as {
      Office?:
        OfficeReadyPort;
    }
  ).Office;
}

function germanContextFailure(
  message: string,
): GermanMutationResult {
  return Object.freeze({
    ok: false,
    domain: "host",
    code:
      "SELECTION_CONTEXT_UNAVAILABLE",
    message,
  });
}

const view =
  createOfficeTaskPaneDomView(
    document,
  );

const musicPane =
  createWordMusicTaskPane(
    document,
  );

const musicXmlPane =
  createWordMusicXmlTaskPane(
    document,
  );

const featureTabs =
  createFeatureTabController(
    document,
  );

const clipboard = {
  async writeText(text: string) {
    await navigator
      .clipboard
      .writeText(
        text,
      );
  },
};

const germanPane =
  createGermanTaskPane(
    document,
    clipboard,
  );

const wordRuntime =
  createGlobalOfficeWordRuntime();

const wordMusicInsertionService =
  createWordMusicInsertionService(
    wordRuntime,
  );

musicPane.setInsertionService(
  wordMusicInsertionService,
);

musicXmlPane.setInsertionService(
  wordMusicInsertionService,
);

const excelRuntime =
  createGlobalOfficeExcelRuntime();

const powerPointRuntime =
  createGlobalOfficePowerPointRuntime();

const wordHostAdapter =
  createWordHostAdapter(
    wordRuntime,
  );

const excelHostAdapter =
  createExcelHostAdapter(
    excelRuntime,
  );

const powerPointHostAdapter =
  createPowerPointHostAdapter(
    powerPointRuntime,
  );

const wordService =
  createWordSelectionService(
    wordHostAdapter,
  );

const excelService =
  createExcelSelectionService(
    excelHostAdapter,
  );

const powerPointService =
  createPowerPointSelectionService(
    powerPointHostAdapter,
  );

const germanWordPort:
  GermanSelectionPort =
  Object.freeze({
    canReplace: true,
    canInsertAfter: true,

    async readSelection() {
      const result =
        await wordHostAdapter
          .readSelection();

      if (!result.ok) {
        return result;
      }

      return Object.freeze({
        ok: true,
        text:
          result.text,
        mutationContext:
          result.text,
      });
    },

    async replaceSelection(
      expected: unknown,
      replacementText: string,
    ) {
      if (
        typeof expected !==
          "string"
      ) {
        return germanContextFailure(
          "Die Word-Auswahl kann nicht sicher ersetzt werden, weil der Auswahlkontext fehlt.",
        );
      }

      return wordHostAdapter
        .replaceSelection(
          expected,
          replacementText,
        );
    },

    async insertAfterSelection(
      expected: unknown,
      insertedText: string,
    ) {
      if (
        typeof expected !==
          "string"
      ) {
        return germanContextFailure(
          "Die Brailleschrift kann nicht sicher eingefügt werden, weil der Word-Auswahlkontext fehlt.",
        );
      }

      return wordHostAdapter
        .insertAfterSelection(
          expected,
          insertedText,
        );
    },
  });

const germanExcelPort:
  GermanSelectionPort =
  Object.freeze({
    canReplace: true,
    canInsertAfter: false,

    async readSelection() {
      const result =
        await excelHostAdapter
          .readSelection();

      if (!result.ok) {
        return result;
      }

      return Object.freeze({
        ok: true,
        text:
          result.text,
        mutationContext:
          result.snapshot,
      });
    },

    async replaceSelection(
      expected: unknown,
      replacementText: string,
    ) {
      if (
        expected === null
        || typeof expected !==
          "object"
      ) {
        return germanContextFailure(
          "Die Excel-Auswahl kann nicht sicher ersetzt werden, weil der Zellkontext fehlt.",
        );
      }

      return excelHostAdapter
        .replaceSelection(
          expected as Parameters<
            typeof excelHostAdapter.replaceSelection
          >[0],
          replacementText,
        );
    },
  });

const germanPowerPointPort:
  GermanSelectionPort =
  Object.freeze({
    canReplace: true,
    canInsertAfter: false,

    async readSelection() {
      const result =
        await powerPointHostAdapter
          .readSelection();

      if (!result.ok) {
        return result;
      }

      return Object.freeze({
        ok: true,
        text:
          result.text,
        mutationContext:
          result.snapshot,
      });
    },

    async replaceSelection(
      expected: unknown,
      replacementText: string,
    ) {
      if (
        expected === null
        || typeof expected !==
          "object"
      ) {
        return germanContextFailure(
          "Die PowerPoint-Auswahl kann nicht sicher ersetzt werden, weil der Auswahlkontext fehlt.",
        );
      }

      return powerPointHostAdapter
        .replaceSelection(
          expected as Parameters<
            typeof powerPointHostAdapter.replaceSelection
          >[0],
          replacementText,
        );
    },
  });

view.setReady(false);
germanPane.setReady(false);
germanPane.setSelectionPort(
  undefined,
);

view.showIdle(
  "Waiting for Microsoft Office…",
);

const office =
  officeReadyPort();

if (!office) {
  view.showFailure({
    domain: "host",
    code:
      "OFFICE_NOT_READY",
    message:
      "Office.js did not load. Open this task pane from Microsoft Word, Excel, or PowerPoint.",
  });
} else {
  try {
    const ready =
      office.onReady(
        (info) => {
          const readiness =
            evaluateOfficeTaskPaneReadiness(
              info,
              wordRuntime,
              excelRuntime,
              powerPointRuntime,
            );

          if (!readiness.ok) {
            germanPane.setReady(
              false,
            );
            germanPane.setSelectionPort(
              undefined,
            );

            view.setReady(false);
            view.showFailure({
              domain: "host",
              code:
                readiness.code,
              message:
                readiness.message,
            });
            return;
          }

          musicPane.setHost(
            readiness.hostKind,
          );

          musicXmlPane.setHost(
            readiness.hostKind,
          );

          featureTabs.setHost(
            readiness.hostKind,
          );

          if (
            readiness.hostKind ===
              "word"
          ) {
            germanPane.setSelectionPort(
              germanWordPort,
            );
          } else if (
            readiness.hostKind ===
              "excel"
          ) {
            germanPane.setSelectionPort(
              germanExcelPort,
            );
          } else {
            germanPane.setSelectionPort(
              germanPowerPointPort,
            );
          }

          germanPane.setReady(
            true,
          );

          let controller;

          if (
            readiness.hostKind ===
              "word"
          ) {
            controller =
              createOfficeTaskPaneController(
                wordService,
                view,
                clipboard,
                readiness.capabilities,
              );
          } else if (
            readiness.hostKind ===
              "excel"
          ) {
            controller =
              createOfficeTaskPaneController(
                excelService,
                view,
                clipboard,
                readiness.capabilities,
              );
          } else {
            controller =
              createOfficeTaskPaneController(
                powerPointService,
                view,
                clipboard,
                readiness.capabilities,
              );
          }

          view.bind(
            controller,
          );
          controller.initialize();
        },
      );

    if (
      ready &&
      typeof (
        ready as Promise<unknown>
      ).catch ===
        "function"
    ) {
      void (
        ready as Promise<unknown>
      ).catch(
        () => {
          germanPane.setReady(
            false,
          );
          germanPane.setSelectionPort(
            undefined,
          );

          view.setReady(false);
          view.showFailure({
            domain: "host",
            code:
              "OFFICE_NOT_READY",
            message:
              "Microsoft Office did not complete Office.js initialization.",
          });
        },
      );
    }
  } catch {
    germanPane.setReady(
      false,
    );
    germanPane.setSelectionPort(
      undefined,
    );

    view.setReady(false);
    view.showFailure({
      domain: "host",
      code:
        "OFFICE_NOT_READY",
      message:
        "Microsoft Office did not complete Office.js initialization.",
    });
  }
}
