import {
  POWERPOINT_HOST_FAILURE_CODES,
} from "./types.js";

import type {
  PersianBraillePowerPointHostAdapter,
  PowerPointHostFailure,
  PowerPointMutationResult,
  PowerPointSelectionReadResult,
  PowerPointSelectionSnapshot,
} from "./types.js";

import type {
  PowerPointRuntimePort,
} from "./runtime.js";

function failure(
  code:
    PowerPointHostFailure["code"],
  message:
    string,
): PowerPointHostFailure {
  return Object.freeze({
    ok: false,
    domain: "host",
    code,
    message,
  });
}

function preflight(
  runtime:
    PowerPointRuntimePort,
): PowerPointHostFailure | null {
  if (!runtime.isReady()) {
    return failure(
      POWERPOINT_HOST_FAILURE_CODES
        .officeNotReady,
      "Office.js and the PowerPoint runtime must be ready before presentation access.",
    );
  }

  if (
    !runtime
      .isPowerPointHost()
  ) {
    return failure(
      POWERPOINT_HOST_FAILURE_CODES
        .wrongHost,
      "This adapter requires Microsoft PowerPoint.",
    );
  }

  if (
    !runtime
      .supportsPowerPointApi15()
  ) {
    return failure(
      POWERPOINT_HOST_FAILURE_CODES
        .unsupportedRequirementSet,
      "PowerPointApi 1.5 is required for the Phase 10 PowerPoint add-in.",
    );
  }

  return null;
}

export function createPowerPointHostAdapter(
  runtime:
    PowerPointRuntimePort,
): PersianBraillePowerPointHostAdapter {
  return Object.freeze({
    async readSelection():
      Promise<PowerPointSelectionReadResult> {
      const blocked =
        preflight(runtime);

      if (blocked) {
        return blocked;
      }

      try {
        const snapshot =
          await runtime
            .readSelectionSnapshot();

        if (!snapshot) {
          return failure(
            POWERPOINT_HOST_FAILURE_CODES
              .selectionUnavailable,
            "Select text in PowerPoint before translating.",
          );
        }

        return Object.freeze({
          ok: true,
          text:
            snapshot.text,
          snapshot,
        });
      } catch {
        return failure(
          POWERPOINT_HOST_FAILURE_CODES
            .selectionUnavailable,
          "PowerPoint could not read the current text selection.",
        );
      }
    },

    async replaceSelection(
      expected:
        PowerPointSelectionSnapshot,
      replacementText:
        string,
    ): Promise<PowerPointMutationResult> {
      const blocked =
        preflight(runtime);

      if (blocked) {
        return blocked;
      }

      try {
        const outcome =
          await runtime
            .replaceSelectedText(
              expected,
              replacementText,
            );

        if (
          outcome ===
          "selection-changed"
        ) {
          return failure(
            POWERPOINT_HOST_FAILURE_CODES
              .selectionChanged,
            "The current PowerPoint text selection no longer matches the selection used to create the Braille preview.",
          );
        }

        return Object.freeze({
          ok: true,
        });
      } catch {
        return failure(
          POWERPOINT_HOST_FAILURE_CODES
            .presentationWriteFailed,
          "PowerPoint could not replace the current text selection.",
        );
      }
    },
  });
}
