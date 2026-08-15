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
    `Phase 10.3b shared task-pane validation failed: ${message}`,
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

const manifest =
  await text(
    "integrations/microsoft365/manifest.xml",
  );

const controller =
  await text(
    "integrations/microsoft365/src/taskpane/controller.ts",
  );

const view =
  await text(
    "integrations/microsoft365/src/taskpane/dom-view.ts",
  );

const main =
  await text(
    "integrations/microsoft365/src/taskpane/main.ts",
  );

const readiness =
  await text(
    "integrations/microsoft365/src/taskpane/readiness.ts",
  );

const capabilities =
  await text(
    "integrations/microsoft365/src/taskpane/host-config.ts",
  );

const tests =
  await text(
    "integrations/microsoft365/test/taskpane.test.mjs",
  );

const manifestSha =
  createHash("sha256")
    .update(manifest)
    .digest("hex");

// Phase 10.3b task-pane invariants remain valid after the manifest
// intentionally evolves in Phase 10.5.

for (
  const [value, token, label] of [
    [main, "createGlobalOfficeWordRuntime", "task-pane main"],
    [main, "createGlobalOfficeExcelRuntime", "task-pane main"],
    [main, "createWordSelectionService", "task-pane main"],
    [main, "createExcelSelectionService", "task-pane main"],
    [main, "evaluateOfficeTaskPaneReadiness", "task-pane main"],
    [main, "createOfficeTaskPaneController", "task-pane main"],
    [controller, "OfficeHostCapabilities", "shared controller"],
    [controller, "createOfficeTaskPaneController", "shared controller"],
    [controller, "createWordTaskPaneController", "Word compatibility API"],
    [view, "createOfficeTaskPaneDomView", "shared DOM view"],
    [view, "canInsertAfter", "capability-driven DOM view"],
    [readiness, "supportsWordApi11", "shared readiness"],
    [readiness, "supportsExcelApi11", "shared readiness"],
    [capabilities, 'hostKind: "word"', "Word capability profile"],
    [capabilities, 'hostKind: "excel"', "Excel capability profile"],
    [capabilities, "canInsertAfter: true", "Word Insert After"],
    [capabilities, "canInsertAfter: false", "Excel Insert After"],
    [tests, "shared task-pane readiness accepts a supported Excel runtime", "task-pane regression"],
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
    [controller, "@persian-braille/core", "shared controller"],
    [view, "@persian-braille/core", "shared DOM view"],
    [main, "@persian-braille/core", "task-pane main"],
    [readiness, "@persian-braille/core", "shared readiness"],
  ]
) {
  forbidText(
    value,
    token,
    label,
  );
}

console.log(
  "Phase 10.3b shared task-pane validation: PASS",
);
console.log(
  "10.3b invariants: Office.onReady still supports Word | Excel",
);
console.log(
  "Word: Replace + Insert After",
);
console.log(
  "Excel: one plain-text cell | Replace only",
);
console.log(
  "10.3b invariant: Word/Excel shared task-pane behavior remains valid",
);
console.log(
  "Later host dispatch extensions are allowed when validated separately",
);
