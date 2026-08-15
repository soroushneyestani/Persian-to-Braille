import {
  createHash,
} from "node:crypto";

import {
  readFile,
} from "node:fs/promises";

const root =
  new URL(
    "../../",
    import.meta.url,
  );

async function text(path) {
  return readFile(
    new URL(path, root),
    "utf8",
  );
}

function fail(message) {
  throw new Error(
    `Phase 10.4b PowerPoint task-pane validation failed: ${message}`,
  );
}

function requireText(
  value,
  expected,
  label,
) {
  if (!value.includes(expected)) {
    fail(
      `${label}: missing ${JSON.stringify(expected)}`,
    );
  }
}

function forbidText(
  value,
  forbidden,
  label,
) {
  if (value.includes(forbidden)) {
    fail(
      `${label}: forbidden ${JSON.stringify(forbidden)}`,
    );
  }
}

const baseline =
  JSON.parse(
    await text(
      "docs/architecture/phase-10.1-excel-powerpoint-baseline-audit.json",
    ),
  );

const contract =
  JSON.parse(
    await text(
      "docs/architecture/phase-10.2-shared-microsoft365-host-architecture.json",
    ),
  );

const manifest =
  await text(
    "integrations/microsoft365/manifest.xml",
  );

const main =
  await text(
    "integrations/microsoft365/src/taskpane/main.ts",
  );

const readiness =
  await text(
    "integrations/microsoft365/src/taskpane/readiness.ts",
  );

const hostConfig =
  await text(
    "integrations/microsoft365/src/taskpane/host-config.ts",
  );

const controller =
  await text(
    "integrations/microsoft365/src/taskpane/controller.ts",
  );

const view =
  await text(
    "integrations/microsoft365/src/taskpane/dom-view.ts",
  );

const tests =
  await text(
    "integrations/microsoft365/test/taskpane.test.mjs",
  );

const manifestSha =
  createHash("sha256")
    .update(manifest)
    .digest("hex");

if (
  manifestSha !==
  baseline.currentMicrosoft365State
    .manifestSha256AtAudit
) {
  fail(
    "manifest changed during 10.4b; multi-host manifest work belongs to Phase 10.5",
  );
}

const profile =
  contract.hostProfiles
    ?.powerpoint;

if (
  profile?.requirementSet !==
    "PowerPointApi" ||
  profile?.minimumVersion !==
    "1.5" ||
  profile?.selectionModel !==
    "selected-text-range" ||
  profile?.phase10Actions
    ?.replace !== true ||
  profile?.phase10Actions
    ?.insertAfter !== false
) {
  fail(
    "PowerPoint task-pane dispatch no longer matches the frozen Phase 10.2 contract",
  );
}

for (
  const [value, token, label] of [
    [main, "createGlobalOfficeWordRuntime", "three-host main"],
    [main, "createGlobalOfficeExcelRuntime", "three-host main"],
    [main, "createGlobalOfficePowerPointRuntime", "three-host main"],
    [main, "createWordSelectionService", "three-host main"],
    [main, "createExcelSelectionService", "three-host main"],
    [main, "createPowerPointSelectionService", "three-host main"],
    [main, "evaluateOfficeTaskPaneReadiness", "three-host main"],
    [hostConfig, "POWERPOINT_TASK_PANE_CAPABILITIES", "PowerPoint capability profile"],
    [hostConfig, 'hostKind: "powerpoint"', "PowerPoint capability profile"],
    [hostConfig, '"PowerPointApi"', "PowerPoint capability profile"],
    [hostConfig, 'minimumVersion: "1.5"', "PowerPoint capability profile"],
    [hostConfig, "canReplace: true", "capability profile"],
    [hostConfig, "canInsertAfter: false", "capability profile"],
    [readiness, "PowerPointRuntimePort", "shared readiness"],
    [readiness, "supportsPowerPointApi15", "shared readiness"],
    [readiness, '"powerpoint"', "shared readiness"],
    [tests, "shared task-pane readiness accepts a supported PowerPoint runtime", "PowerPoint task-pane regression"],
    [tests, "shared task-pane controller rejects Insert After for PowerPoint", "PowerPoint capability regression"],
    [controller, "createOfficeTaskPaneController", "shared controller preserved"],
    [view, "canInsertAfter", "capability-driven view preserved"],
  ]
) {
  requireText(
    value,
    token,
    label,
  );
}

for (
  const [value, token, label] of [
    [main, "@persian-braille/core", "three-host main"],
    [readiness, "@persian-braille/core", "shared readiness"],
    [hostConfig, "@persian-braille/core", "host config"],
    [controller, "PowerPoint.run", "shared controller"],
    [view, "PowerPoint.run", "shared DOM view"],
  ]
) {
  forbidText(
    value,
    token,
    label,
  );
}

console.log(
  "Phase 10.4b PowerPoint task-pane validation: PASS",
);
console.log(
  "Dispatch: Office.onReady -> Word | Excel | PowerPoint",
);
console.log(
  "Word: Replace + Insert After",
);
console.log(
  "Excel: Replace only",
);
console.log(
  "PowerPoint: PowerPointApi 1.5 | selected text range | Replace only",
);
console.log(
  "Manifest: unchanged / Word-only until Phase 10.5",
);
console.log(
  "Next: Phase 10.5 Sideload / Regression / Cross-host Evidence",
);
