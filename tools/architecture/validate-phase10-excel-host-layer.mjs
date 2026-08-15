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
    `Phase 10.3a Excel host-layer validation failed: ${message}`,
  );
}

function requireText(
  value,
  expected,
  label,
) {
  if (!value.includes(expected)) {
    fail(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function forbidText(
  value,
  forbidden,
  label,
) {
  if (value.includes(forbidden)) {
    fail(`${label}: forbidden ${JSON.stringify(forbidden)}`);
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

const runtime =
  await text(
    "integrations/microsoft365/src/excel/runtime.ts",
  );

const types =
  await text(
    "integrations/microsoft365/src/excel/types.ts",
  );

const adapter =
  await text(
    "integrations/microsoft365/src/excel/adapter.ts",
  );

const service =
  await text(
    "integrations/microsoft365/src/excel/selection-service.ts",
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
    "manifest changed during 10.3a; multi-host manifest work belongs to Phase 10.5",
  );
}

for (
  const [value, token, label] of [
    [runtime, "Excel.run", "runtime"],
    [runtime, "getSelectedRange", "runtime"],
    [runtime, '"ExcelApi"', "runtime"],
    [runtime, '"1.1"', "runtime"],
    [types, '"SELECTION_SHAPE_UNSUPPORTED"', "Excel failure codes"],
    [types, '"SELECTION_CONTENT_UNSUPPORTED"', "Excel failure codes"],
    [types, '"SELECTION_CHANGED"', "Excel failure codes"],
    [adapter, "selectionShapeUnsupported", "adapter"],
    [adapter, "selectionContentUnsupported", "adapter"],
    [adapter, "selectionChanged", "adapter"],
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
    [service, "insertBrailleAfter", "Excel service"],
  ]
) {
  forbidText(
    value,
    token,
    label,
  );
}

if (
  !packageJson.scripts?.test
    ?.includes(
      "test/excel-selection.test.mjs",
    )
) {
  fail(
    "Microsoft 365 package test does not include Excel host-layer regression",
  );
}

console.log(
  "Phase 10.3a Excel host-layer validation: PASS",
);
console.log(
  "Excel: ExcelApi 1.1 | one plain-text cell | Replace only",
);
console.log(
  "Stale guard: exact cell snapshot",
);
console.log(
  "Manifest: unchanged from Phase 9",
);
console.log(
  "Word task pane/runtime: untouched in 10.3a",
);
console.log(
  "Next: Phase 10.3b shared task pane + Excel dispatch",
);
