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
  createFeatureTabController,
} from "./feature-tabs.js";

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

const view =
  createOfficeTaskPaneDomView(
    document,
  );

const musicPane =
  createWordMusicTaskPane(
    document,
  );

const featureTabs =
  createFeatureTabController(
    document,
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

const excelRuntime =
  createGlobalOfficeExcelRuntime();

const powerPointRuntime =
  createGlobalOfficePowerPointRuntime();

const wordService =
  createWordSelectionService(
    createWordHostAdapter(
      wordRuntime,
    ),
  );

const excelService =
  createExcelSelectionService(
    createExcelHostAdapter(
      excelRuntime,
    ),
  );

const powerPointService =
  createPowerPointSelectionService(
    createPowerPointHostAdapter(
      powerPointRuntime,
    ),
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

view.setReady(false);
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

          featureTabs.setHost(
            readiness.hostKind,
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
