import {
  readFile,
} from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function json(path) {
  return JSON.parse(
    await readFile(
      new URL(path, root),
      "utf8",
    ),
  );
}

async function text(path) {
  return readFile(
    new URL(path, root),
    "utf8",
  );
}

function fail(message) {
  throw new Error(
    `U+0622 release-correction validation failed: ${message}`,
  );
}

function collectDots(value, output = []) {
  if (Array.isArray(value)) {
    for (const child of value) {
      collectDots(child, output);
    }
    return output;
  }

  if (
    value !== null
    && typeof value === "object"
  ) {
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey =
        key.toLowerCase();

      if (
        normalizedKey === "dots"
        && typeof child === "string"
      ) {
        output.push(child);
      }

      if (
        normalizedKey === "cells"
        && Array.isArray(child)
        && child.every(
          (cell) =>
            typeof cell === "string",
        )
      ) {
        output.push(...child);
      }

      collectDots(child, output);
    }
  }

  return output;
}

const historical =
  await json(
    "spec/fa-ir/adjudications/records/fa-adj-var-001-001.json",
  );

if (
  historical.decisionItemId !== "FA-VAR-001"
  || historical.disposition !== "defer-pending-evidence"
  || historical.decision?.result !== "deferred"
) {
  fail(
    "historical FA-VAR-001 adjudication was rewritten",
  );
}

const master =
  await json(
    "spec/fa-ir/evidence/master-decision-matrix.json",
  );

const masterItem =
  master.items.find(
    (item) =>
      item.id === "FA-VAR-001",
  );

if (
  masterItem?.classification !== "REVIEW-REQUIRED"
  || masterItem?.normative !== false
) {
  fail(
    "historical Phase 1 classification was rewritten",
  );
}

const correction =
  await json(
    "spec/fa-ir/governance/release-corrections/fa-rel-corr-u0622-001.json",
  );

if (
  correction.id !== "FA-REL-CORR-U0622-001"
  || correction.maintainerDecision?.decision
    !== "admit-candidate-direct-character-rule"
  || correction.maintainerDecision?.ruleStatus
    !== "candidate"
  || correction.maintainerDecision?.dots
    !== "345"
  || correction.maintainerDecision?.unicodeBraille
    !== "⠜"
  || correction.maintainerDecision?.normativePromotion
    !== false
  || correction.materialization?.promotionEligible
    !== false
) {
  fail(
    "maintainer correction record mismatch",
  );
}

const rule =
  await json(
    "spec/fa-ir/rules/records/fa-g1-var-001.json",
  );

if (
  rule.id !== "FA-G1-VAR-001"
  || rule.profile !== "fa-ir-g1"
  || rule.status !== "candidate"
  || rule.type !== "character"
  || rule.input?.kind !== "scalar"
  || rule.input?.text !== "آ"
  || JSON.stringify(rule.input?.codePoints)
    !== JSON.stringify(["U+0622"])
) {
  fail("candidate rule identity mismatch");
}

const ruleDots =
  collectDots(rule.output);

if (!ruleDots.includes("345")) {
  fail("candidate rule does not emit dots 345");
}

const profile =
  await json(
    "spec/fa-ir/profiles/fa-ir-g1.json",
  );

if (
  profile.status !== "draft"
  || !profile.ruleIds.includes(
    "FA-G1-VAR-001",
  )
) {
  fail(
    "draft fa-ir-g1 profile does not include the candidate rule",
  );
}

const conformance =
  await json(
    "spec/fa-ir/conformance/records/fa-conf-var-001.json",
  );

if (
  conformance.id !== "FA-CONF-VAR-001"
  || conformance.input?.text !== "آ"
  || JSON.stringify(
    conformance.input?.codePoints,
  ) !== JSON.stringify(["U+0622"])
) {
  fail(
    "U+0622 conformance identity mismatch",
  );
}

const runtime =
  await text(
    "packages/core/src/generated/fa-ir-g1.runtime.ts",
  );

for (const token of [
  '"FA-G1-VAR-001"',
  '"U+0622"',
  '"345"',
]) {
  if (!runtime.includes(token)) {
    fail(
      `generated runtime is missing ${token}`,
    );
  }
}

const regression =
  await text(
    "tools/consumers/u0622-release-regression.test.mjs",
  );

for (const token of [
  'translator.translate("آ")',
  'translator.translate("آموزش")',
  '"⠜"',
]) {
  if (!regression.includes(token)) {
    fail(
      `release regression is missing ${token}`,
    );
  }
}

const excel =
  await text(
    "integrations/microsoft365/test/excel-selection.test.mjs",
  );

const failureMarker =
  '"Excel SDK failures remain translation-domain results"';

const start =
  excel.indexOf(failureMarker);

if (start < 0) {
  fail("Excel SDK-failure regression missing");
}

const next =
  excel.indexOf(
    "\ntest(",
    start + failureMarker.length,
  );

const failureBlock =
  excel.slice(
    start,
    next < 0 ? excel.length : next,
  );

if (
  failureBlock.includes('"آ"')
  || !failureBlock.includes('"😀"')
) {
  fail(
    "Excel SDK-failure test still incorrectly treats U+0622 as a failure",
  );
}

console.log(
  "U+0622 release candidate correction: PASS",
);
console.log(
  "Historical Phase 1/2 governance: PRESERVED",
);
console.log(
  "Candidate rule: FA-G1-VAR-001 / U+0622 / dots 345 / PASS",
);
console.log(
  "Normative promotion: NONE",
);
console.log(
  "fa-ir-g1: DRAFT / PRESERVED",
);
console.log(
  "Public SDK regression: آ + آموزش / PASS",
);
console.log(
  "Microsoft365 host delegation: PRESERVED",
);
