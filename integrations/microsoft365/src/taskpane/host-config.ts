import type {
  OfficeHostCapabilities,
} from "../shared/types.js";

export const WORD_TASK_PANE_CAPABILITIES:
  OfficeHostCapabilities =
  Object.freeze({
    hostKind: "word",
    hostLabel: "Word",
    requirementSet: "WordApi",
    minimumVersion: "1.1",
    canReplace: true,
    canInsertAfter: true,
  });

export const EXCEL_TASK_PANE_CAPABILITIES:
  OfficeHostCapabilities =
  Object.freeze({
    hostKind: "excel",
    hostLabel: "Excel",
    requirementSet: "ExcelApi",
    minimumVersion: "1.1",
    canReplace: true,
    canInsertAfter: false,
  });

export const POWERPOINT_TASK_PANE_CAPABILITIES:
  OfficeHostCapabilities =
  Object.freeze({
    hostKind: "powerpoint",
    hostLabel: "PowerPoint",
    requirementSet:
      "PowerPointApi",
    minimumVersion: "1.5",
    canReplace: true,
    canInsertAfter: false,
  });
