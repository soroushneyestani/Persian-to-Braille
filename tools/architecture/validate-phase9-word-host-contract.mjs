import {
  readFile,
} from "node:fs/promises";

const contractUrl =
  new URL(
    "../../docs/architecture/phase-9.2-word-host-adapter-contract.json",
    import.meta.url,
  );

const contract =
  JSON.parse(
    await readFile(
      contractUrl,
      "utf8",
    ),
  );

function fail(message) {
  throw new Error(
    `Phase 9 Word host contract validation failed: ${message}`,
  );
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function sameArray(actual, expected, label) {
  if (
    !Array.isArray(actual) ||
    actual.length !== expected.length ||
    actual.some(
      (value, index) =>
        value !== expected[index],
    )
  ) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

equal(contract.schemaVersion, "1", "schemaVersion");
equal(contract.phase, "9.2", "phase");
equal(contract.host, "Word", "host");

sameArray(
  contract.targetClients,
  [
    "Word on the web",
    "Word for Microsoft 365 on Windows",
    "Word for Microsoft 365 on Mac",
  ],
  "targetClients",
);

equal(
  contract.manifestStrategy?.phase9,
  "add-in-only-xml",
  "manifestStrategy.phase9",
);

equal(
  contract.minimumOfficeRequirementSet?.name,
  "WordApi",
  "minimumOfficeRequirementSet.name",
);
equal(
  contract.minimumOfficeRequirementSet?.version,
  "1.1",
  "minimumOfficeRequirementSet.version",
);

equal(
  contract.architecture?.translationOwner,
  "@persian-braille/sdk",
  "architecture.translationOwner",
);
equal(
  contract.architecture?.allowedInternalDependency,
  "@persian-braille/sdk",
  "architecture.allowedInternalDependency",
);
equal(
  contract.architecture?.officeLayerOwnsTranslationSemantics,
  false,
  "architecture.officeLayerOwnsTranslationSemantics",
);

sameArray(
  contract.architecture?.forbiddenDependencies,
  [
    "@persian-braille/core",
    "spec/fa-ir",
  ],
  "architecture.forbiddenDependencies",
);

sameArray(
  Object.keys(
    contract.adapter?.operations ?? {},
  ),
  [
    "readSelection",
    "replaceSelection",
    "insertAfterSelection",
  ],
  "adapter operations",
);

sameArray(
  contract.hostFailureCodes,
  [
    "OFFICE_NOT_READY",
    "WRONG_HOST",
    "UNSUPPORTED_REQUIREMENT_SET",
    "SELECTION_UNAVAILABLE",
    "SELECTION_CHANGED",
    "DOCUMENT_WRITE_FAILED",
  ],
  "hostFailureCodes",
);

equal(
  contract.selectionPolicy?.comparison,
  "exact-code-unit-string-equality",
  "selectionPolicy.comparison",
);
equal(
  contract.selectionPolicy?.stalePreviewProtection,
  true,
  "selectionPolicy.stalePreviewProtection",
);
equal(
  contract.selectionPolicy?.persistentBinding,
  false,
  "selectionPolicy.persistentBinding",
);
equal(
  contract.selectionPolicy?.trackedRangeAcrossUiActions,
  false,
  "selectionPolicy.trackedRangeAcrossUiActions",
);

equal(
  contract.officeExecutionPolicy?.batchModel,
  "Word.run",
  "officeExecutionPolicy.batchModel",
);
equal(
  contract.officeExecutionPolicy?.freshSelectionForEveryMutation,
  true,
  "officeExecutionPolicy.freshSelectionForEveryMutation",
);
equal(
  contract.officeExecutionPolicy?.officeErrorsMappedAtAdapterBoundary,
  true,
  "officeExecutionPolicy.officeErrorsMappedAtAdapterBoundary",
);
equal(
  contract.officeExecutionPolicy?.officeErrorObjectsExposedToSdk,
  false,
  "officeExecutionPolicy.officeErrorObjectsExposedToSdk",
);

equal(
  contract.phase9UiContractBoundary?.translation,
  "sdk-responsibility",
  "phase9UiContractBoundary.translation",
);
equal(
  contract.phase9UiContractBoundary?.copyUnicodeBraille,
  "browser-clipboard-ui-responsibility",
  "phase9UiContractBoundary.copyUnicodeBraille",
);

console.log(
  "Phase 9 Word host adapter contract validation: PASS",
);
console.log(
  "Host: Word",
);
console.log(
  "Clients: Web, Microsoft 365 Windows, Microsoft 365 Mac",
);
console.log(
  "Manifest baseline: add-in-only XML",
);
console.log(
  "Minimum requirement set: WordApi 1.1",
);
console.log(
  "Architecture: Word -> SDK only",
);
console.log(
  "Mutation guard: current selection must exactly equal preview source",
);
