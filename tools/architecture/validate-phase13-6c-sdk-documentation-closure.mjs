import assert from "node:assert/strict";
import {
  execFileSync,
} from "node:child_process";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(
  relativePath,
) {
  return readFile(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}

async function json(
  relativePath,
) {
  return JSON.parse(
    await text(
      relativePath,
    ),
  );
}

const audit =
  await json(
    "docs/architecture/phase-13.6c-sdk-documentation-closure-audit.json",
  );

assert.equal(
  audit.decision,
  "READY_FOR_PHASE13_6C_DOCUMENTATION_MATERIALIZATION",
);

const sdkReadme =
  await text(
    "packages/sdk/README.md",
  );

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

const phase12_5 =
  await text(
    "tools/architecture/validate-phase12-5-developer-docs.mjs",
  );

for (const phrase of [
  "does not expose or promise a `translateFromBraille` API",
  "Reverse translation is deliberately outside this phase",
]) {
  assert.equal(
    sdkReadme.includes(
      phrase,
    ),
    false,
    `SDK README retains stale reverse deferral wording: ${phrase}`,
  );
}

const runtimeExports = [
  "PersianBrailleReverseTranslationError",
  "createPersianBrailleReverseTranslator",
];

const typeExports = [
  "CreatePersianBrailleReverseTranslator",
  "PersianBrailleReverseProfileInfo",
  "PersianBrailleReverseTranslationOptions",
  "PersianBrailleReverseDigitFamily",
  "PersianBrailleReversePunctuationStyle",
  "PersianBrailleReverseEllipsisStyle",
  "PersianBrailleReverseAmbiguityPolicy",
  "PersianBrailleReverseDiagnostic",
  "PersianBrailleReverseTranslationFailureCode",
  "PersianBrailleReverseTranslationFailure",
  "PersianBrailleReverseTranslationResult",
  "PersianBrailleReverseTranslationSuccess",
  "PersianBrailleReverseTranslator",
  "PersianBrailleReverseUnicodeLocation",
];

for (const symbol of [
  ...runtimeExports,
  ...typeExports,
]) {
  assert.equal(
    sdkIndex.includes(
      symbol,
    ),
    true,
    `SDK root missing reverse symbol: ${symbol}`,
  );

  assert.equal(
    sdkReadme.includes(
      `\`${symbol}\``,
    ),
    true,
    `SDK README missing reverse symbol: ${symbol}`,
  );
}

assert.equal(
  sdkIndex.includes(
    "PersianBrailleReverseDiagnosticCode",
  ),
  false,
);

for (const token of [
  "translateFromBraille",
  "translateFromBrailleOrThrow",
  "digitFamily",
  "punctuationStyle",
  "ellipsisStyle",
  "ambiguityPolicy",
]) {
  assert.equal(
    sdkReadme.includes(
      token,
    ),
    true,
    `SDK README missing reverse method/option: ${token}`,
  );
}

for (const token of [
  "INVALID_BRAILLE_INPUT",
  "UNKNOWN_BRAILLE_CELL",
  "UNKNOWN_BRAILLE_SEQUENCE",
  "AMBIGUOUS_REVERSE_MATCH",
  "MALFORMED_MODE_SEQUENCE",
  "UNTERMINATED_LATIN_SPAN",
  "DANGLING_CAPITAL_INDICATOR",
  "UNSUPPORTED_REVERSE_STATE",
]) {
  assert.equal(
    sdkReadme.includes(
      token,
    ),
    true,
    `SDK README missing reverse failure code: ${token}`,
  );
}

for (const token of [
  "CANONICALIZED_DIGIT_FAMILY",
  "CANONICALIZED_PUNCTUATION",
  "CANONICALIZED_ELLIPSIS",
  "AMBIGUITY_CANONICALIZED",
  "LOSSY_LAYOUT_RECONSTRUCTION",
  "LOSSY_NORMALIZATION_RECONSTRUCTION",
]) {
  assert.equal(
    sdkReadme.includes(
      token,
    ),
    true,
    `SDK README missing reverse diagnostic code: ${token}`,
  );
}

for (const token of [
  "Living SDK README reverse documentation: Phase 13.6 / PASS",
  "reverseRuntimeExports",
  "reverseTypeExports",
]) {
  assert.equal(
    phase12_5.includes(
      token,
    ),
    true,
    `Phase 12.5 documentation validator is not milestone-composable: ${token}`,
  );
}

for (const archived of [
  "docs/architecture/phase-13.6a-sdk-reverse-api-pattern-contract-audit.json",
  "docs/architecture/phase-13.6a1-corrected-sdk-reverse-contract-shape-audit.json",
  "docs/architecture/phase-13.6a2-sdk-reverse-projection-mapping-audit.json",
  "docs/architecture/phase-13.6a3-sdk-reverse-deferred-assumption-audit.json",
  "docs/architecture/phase-13.6c-sdk-documentation-closure-audit.json",
]) {
  await text(
    archived,
  );
}

const diffNames =
  execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "HEAD",
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  )
  .split(/\r?\n/)
  .filter(Boolean);

for (const frozenPrefix of [
  "packages/core/",
  "packages/sdk/src/public-api.ts",
  "packages/sdk/src/translator.ts",
  "integrations/microsoft365/",
  "apps/cli/",
  "apps/web/",
]) {
  assert.equal(
    diffNames.some(
      (name) =>
        name.startsWith(
          frozenPrefix,
        ),
    ),
    false,
    `Phase 13.6c touched frozen scope: ${frozenPrefix}`,
  );
}

console.log(
  "Phase 13.6c SDK Documentation and Closure: PASS",
);
console.log(
  "SDK reverse runtime documentation: 2 / 2",
);
console.log(
  "SDK reverse type documentation: 14 / 14",
);
console.log(
  "Reverse methods/options: DOCUMENTED / PASS",
);
console.log(
  "Reverse failure codes: 8 / 8",
);
console.log(
  "Reverse diagnostic codes: 6 / 6",
);
console.log(
  "Lossy reconstruction semantics: DOCUMENTED / PASS",
);
console.log(
  "Historical Phase 12 architecture docs: PRESERVED / PASS",
);
console.log(
  "Phase 12.5 living README validator: COMPOSABLE / PASS",
);
console.log(
  "Core / Forward SDK / CLI / Web / Microsoft365: UNCHANGED / PASS",
);
console.log(
  "Next: Phase 13 final closure audit",
);
