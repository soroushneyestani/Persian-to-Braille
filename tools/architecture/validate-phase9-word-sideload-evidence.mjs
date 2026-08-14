import {
  readFile,
} from "node:fs/promises";

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

function fail(message) {
  throw new Error(
    `Phase 9.5 evidence validation failed: ${message}`,
  );
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

equal(
  evidence.schemaVersion,
  "1",
  "schemaVersion",
);

equal(
  evidence.phase,
  "9.5",
  "phase",
);

equal(
  evidence.manifest?.microsoftValidator?.status,
  "pass",
  "manifest Microsoft validation",
);

equal(
  evidence.localHttps?.trustedLocalhost,
  true,
  "trusted localhost",
);

equal(
  evidence.localHttps?.httpStatusObserved,
  200,
  "task pane HTTP status",
);

const clients =
  new Map(
    evidence.clients.map(
      (client) => [
        client.client,
        client,
      ],
    ),
  );

equal(
  clients.get(
    "Word for Microsoft 365 on Windows",
  )?.status,
  "verified-pass",
  "Windows status",
);

equal(
  clients.get(
    "Word on the web",
  )?.status,
  "expected-not-executed",
  "Web status",
);

equal(
  clients.get(
    "Word for Microsoft 365 on Mac",
  )?.status,
  "expected-not-executed",
  "Mac status",
);

equal(
  evidence.decision?.maintainerAcceptedDeferral,
  true,
  "maintainer deferral decision",
);

equal(
  evidence.decision?.phase9MayProceedToClosure,
  true,
  "Phase 9 closure decision",
);

for (
  const [
    check,
    status,
  ] of Object.entries(
    evidence.windowsWorkflowChecks,
  )
) {
  equal(
    status,
    "pass",
    `Windows workflow ${check}`,
  );
}

const nonClaims =
  new Set(
    evidence.nonClaims,
  );

if (
  !nonClaims.has(
    "Word on the web was not executed in Phase 9.",
  ) ||
  !nonClaims.has(
    "Word for Microsoft 365 on Mac was not executed in Phase 9.",
  )
) {
  fail(
    "Web/Mac non-execution must remain explicit.",
  );
}

console.log(
  "Phase 9.5 Word sideload evidence validation: PASS",
);
console.log(
  "Windows: VERIFIED / PASS",
);
console.log(
  "Web: EXPECTED / NOT EXECUTED",
);
console.log(
  "Mac: EXPECTED / NOT EXECUTED",
);
console.log(
  "Deferred release gate: actual Web + Mac execution before Phase 11 closure",
);
