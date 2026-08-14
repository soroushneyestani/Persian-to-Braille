import {
  readFile,
} from "node:fs/promises";

const rootPackage =
  JSON.parse(
    await readFile(
      new URL(
        "../../package.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );

const evidence =
  JSON.parse(
    await readFile(
      new URL(
        "../../docs/architecture/phase-9.5-word-sideload-regression.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );

const closure =
  await readFile(
    new URL(
      "../../docs/architecture/phase-9-closure.md",
      import.meta.url,
    ),
    "utf8",
  );

const gitignore =
  await readFile(
    new URL(
      "../../.gitignore",
      import.meta.url,
    ),
    "utf8",
  );

function fail(message) {
  throw new Error(
    `Phase 9 closure validation failed: ${message}`,
  );
}

function requireText(value, text, label) {
  if (!value.includes(text)) {
    fail(`${label}: missing ${JSON.stringify(text)}`);
  }
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

equal(
  evidence.clients.find(
    (client) =>
      client.client ===
      "Word for Microsoft 365 on Windows",
  )?.status,
  "verified-pass",
  "Windows evidence",
);

equal(
  evidence.clients.find(
    (client) =>
      client.client ===
      "Word on the web",
  )?.status,
  "expected-not-executed",
  "Web evidence",
);

equal(
  evidence.clients.find(
    (client) =>
      client.client ===
      "Word for Microsoft 365 on Mac",
  )?.status,
  "expected-not-executed",
  "Mac evidence",
);

requireText(
  closure,
  "Word for Microsoft 365 / Windows   VERIFIED / PASS",
  "closure platform matrix",
);

requireText(
  closure,
  "Word on the web                    EXPECTED / NOT EXECUTED",
  "closure platform matrix",
);

requireText(
  closure,
  "Word for Microsoft 365 / Mac       EXPECTED / NOT EXECUTED",
  "closure platform matrix",
);

requireText(
  closure,
  "Actual Web and Mac execution are mandatory release gates before Phase 11",
  "deferred release gate",
);

requireText(
  gitignore,
  "integrations/microsoft365/addin-dist/",
  "generated add-in output ignore rule",
);

const requiredScripts = [
  "validate:phase9-word-contract",
  "validate:phase9-word-selection",
  "validate:phase9-word-addin",
  "validate:phase9-word-sideload-evidence",
  "validate:phase9",
];

for (const script of requiredScripts) {
  if (!rootPackage.scripts?.[script]) {
    fail(`missing root script ${script}`);
  }
}

console.log(
  "Phase 9 closure validation: PASS",
);
console.log(
  "Word Windows: VERIFIED / PASS",
);
console.log(
  "Word Web: EXPECTED / NOT EXECUTED",
);
console.log(
  "Word Mac: EXPECTED / NOT EXECUTED",
);
console.log(
  "Architecture: Specification -> Core -> SDK -> Microsoft365 -> Word",
);
console.log(
  "Phase 11 release gate: actual Web + Mac execution",
);
