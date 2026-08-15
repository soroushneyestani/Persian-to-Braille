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
    `Phase 10.4a PowerPoint host-layer validation failed: ${message}`,
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

const types =
  await text(
    "integrations/microsoft365/src/powerpoint/types.ts",
  );

const runtime =
  await text(
    "integrations/microsoft365/src/powerpoint/runtime.ts",
  );

const adapter =
  await text(
    "integrations/microsoft365/src/powerpoint/adapter.ts",
  );

const service =
  await text(
    "integrations/microsoft365/src/powerpoint/selection-service.ts",
  );

const taskpaneMain =
  await text(
    "integrations/microsoft365/src/taskpane/main.ts",
  );

const packageJson =
  JSON.parse(
    await text(
      "integrations/microsoft365/package.json",
    ),
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
    "manifest changed during 10.4a",
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
    "PowerPoint implementation no longer matches the frozen Phase 10.2 host contract",
  );
}

for (
  const [value, token, label] of [
    [runtime, "PowerPoint.run", "runtime"],
    [runtime, "getSelectedTextRangeOrNullObject", "runtime"],
    [runtime, "getParentTextFrame", "runtime"],
    [runtime, "getParentShape", "runtime"],
    [runtime, "getParentSlide", "runtime"],
    [runtime, '"PowerPointApi"', "runtime"],
    [runtime, '"1.5"', "runtime"],
    [runtime, "slideId", "runtime snapshot"],
    [runtime, "shapeId", "runtime snapshot"],
    [runtime, "start", "runtime snapshot"],
    [runtime, "length", "runtime snapshot"],
    [runtime, "text", "runtime snapshot"],
    [types, '"SELECTION_UNAVAILABLE"', "PowerPoint failure codes"],
    [types, '"SELECTION_CHANGED"', "PowerPoint failure codes"],
    [types, '"PRESENTATION_WRITE_FAILED"', "PowerPoint failure codes"],
    [adapter, "selectionChanged", "adapter"],
    [adapter, "presentationWriteFailed", "adapter"],
    [service, "@persian-braille/sdk", "selection service"],
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
    [runtime, "@persian-braille/core", "runtime"],
    [adapter, "@persian-braille/core", "adapter"],
    [service, "@persian-braille/core", "selection service"],
    [service, "insertBrailleAfter", "PowerPoint selection service"],
    [taskpaneMain, "createGlobalOfficePowerPointRuntime", "10.4a task-pane main"],
  ]
) {
  forbidText(
    value,
    token,
    label,
  );
}

if (
  !packageJson.scripts
    ?.test
    ?.includes(
      "powerpoint-selection.test.mjs",
    )
) {
  fail(
    "Microsoft 365 package test script does not include PowerPoint regression tests",
  );
}

console.log(
  "Phase 10.4a PowerPoint host-layer validation: PASS",
);
console.log(
  "PowerPoint: PowerPointApi 1.5 | selected text range | Replace only",
);
console.log(
  "Snapshot: slideId + shapeId + start + length + text",
);
console.log(
  "Stale guard: exact five-field snapshot",
);
console.log(
  "Manifest: unchanged",
);
console.log(
  "Shared task pane: untouched in 10.4a",
);
console.log(
  "Next: Phase 10.4b PowerPoint task-pane dispatch",
);
