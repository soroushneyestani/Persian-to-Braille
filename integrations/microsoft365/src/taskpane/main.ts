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

interface OfficeReadyPort {
  onReady(
    callback: () => void,
  ):
    | Promise<unknown>
    | void;
}

function officeReadyPort():
  OfficeReadyPort | undefined {
  const candidate =
    (
      globalThis as unknown as {
        Office?:
          OfficeReadyPort;
      }
    ).Office;

  return candidate;
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
        () => {
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
    view.showFailure({
      domain: "host",
      code:
        "OFFICE_NOT_READY",
      message:
        "Microsoft Word did not complete Office.js initialization.",
    });
  }
}
