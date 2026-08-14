import {
  createGlobalOfficeWordRuntime,
  createWordHostAdapter,
  createWordSelectionService,
} from "../index.js";

import {
  createWordTaskPaneController,
} from "./controller.js";

import {
  createWordTaskPaneDomView,
} from "./dom-view.js";

import {
  evaluateWordTaskPaneReadiness,
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
  createWordTaskPaneDomView(
    document,
  );

const runtime =
  createGlobalOfficeWordRuntime();

const service =
  createWordSelectionService(
    createWordHostAdapter(
      runtime,
    ),
  );

const controller =
  createWordTaskPaneController(
    service,
    view,
    {
      async writeText(text) {
        await navigator
          .clipboard
          .writeText(
            text,
          );
      },
    },
  );

view.bind(
  controller,
);

view.setReady(false);
view.showIdle(
  "Waiting for Microsoft Word…",
);

const office =
  officeReadyPort();

if (!office) {
  view.showFailure({
    domain: "host",
    code:
      "OFFICE_NOT_READY",
    message:
      "Office.js did not load. Open this task pane from Microsoft Word.",
  });
} else {
  try {
    const ready =
      office.onReady(
        (info) => {
          const readiness =
            evaluateWordTaskPaneReadiness(
              info,
              runtime,
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

          controller
            .initialize();
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
              "Microsoft Word did not complete Office.js initialization.",
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
        "Microsoft Word did not complete Office.js initialization.",
    });
  }
}
