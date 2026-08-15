import {
  createExcelHostAdapter,
  createExcelSelectionService,
  createGlobalOfficeExcelRuntime,
  createGlobalOfficeWordRuntime,
  createWordHostAdapter,
  createWordSelectionService,
} from "../index.js";

import {
  createOfficeTaskPaneController,
} from "./controller.js";

import {
  createOfficeTaskPaneDomView,
} from "./dom-view.js";

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

const wordRuntime =
  createGlobalOfficeWordRuntime();

const excelRuntime =
  createGlobalOfficeExcelRuntime();

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
      "Office.js did not load. Open this task pane from Microsoft Word or Excel.",
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

          if (
            readiness.hostKind ===
              "word"
          ) {
            const controller =
              createOfficeTaskPaneController(
                wordService,
                view,
                clipboard,
                readiness.capabilities,
              );

            view.bind(
              controller,
            );
            controller.initialize();
            return;
          }

          const controller =
            createOfficeTaskPaneController(
              excelService,
              view,
              clipboard,
              readiness.capabilities,
            );

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
