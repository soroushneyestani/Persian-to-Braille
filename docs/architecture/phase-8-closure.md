# Phase 8 — CLI + Web Playground Closure

## Status

**Phase 8: CLOSED pending final branch fixed point, CI, and merge to `main`**

Phase 8 converts the public SDK created in Phase 7 into two real consumer
applications:

```text
CLI
Web Playground
```

Both remain strict consumers of the public SDK.

The architecture at Phase 8 closure is:

```text
Canonical Specification
        ↓
       Core
        ↓
    Public SDK
        ↓
   ┌────┴─────┐
   ↓          ↓
  CLI        Web
```

The applications do not own Persian Braille translation semantics.

---

## Finite exit criteria

Phase 8 was defined with exactly six exit criteria.

### 1. CLI / Web Baseline Audit

**Complete**

Baseline commit:

```text
533ccf6 Freeze Phase 8 CLI and Web baseline
```

The audit established that both applications were initially empty TypeScript
workspace skeletons:

```text
apps/cli/src/index.ts -> export {};
apps/web/src/index.ts -> export {};
```

Both already declared the correct workspace dependency:

```text
@persian-braille/sdk: workspace:*
```

No legacy CLI/Web implementation required migration.

### 2. Consumer Application Contract

**Complete**

Contract commit:

```text
c425ad2 Define Phase 8 CLI and Web consumer contract
```

The contract froze:

```text
CLI executable and commands
CLI input-source rules
CLI output formats
CLI exit codes
CLI stdout/stderr policy
browser-local Web runtime
Web controls and result presentation
draft-profile disclosure
accessibility requirements
privacy requirements
CLI/Web parity
finite Phase 8 exclusions
```

The machine-readable contract is validated by:

```text
pnpm run validate:phase8-consumer-contract
```

### 3. CLI Implementation

**Complete**

Implementation commit:

```text
5d94b9f Implement Phase 8 CLI consumer
```

The official CLI provides:

```text
persian-braille translate <text>
persian-braille translate --stdin
persian-braille profile
```

Translation formats:

```text
unicode
cells
json
```

Exit codes:

```text
0 success
1 expected SDK translation failure
2 CLI usage/input-contract error
3 unexpected internal CLI failure
```

The CLI passes translation input to the SDK without application-owned
normalization or Braille rules.

Its consumer suite contains 13 tests.

### 4. Web Playground Implementation

**Complete**

Implementation commit:

```text
d0ce057 Implement Phase 8 Web Playground
```

The browser application provides:

```text
Persian print-text input
Translate
Clear
Copy Unicode Braille
Unicode Braille output
cells
normalized text
structural tokens
public SDK failure presentation
profile metadata
draft-status disclosure
```

The runtime is browser-local.

Phase 8 introduces:

```text
no translation backend
no translation network request
no localStorage input persistence
no sessionStorage input persistence
```

The Web implementation uses:

```text
TypeScript
native ES modules
browser import maps
Node built-ins for static assembly/preview
```

No browser framework or bundler dependency is required at this phase.

Its consumer suite contains 13 tests.

### 5. Consumer Integration & Regression

**Complete**

Integration commits:

```text
c9a6a96 Add Phase 8 consumer integration regression
f0fc548 Fix Phase 8 consumer CI path coverage
```

The integration gate is:

```text
pnpm run validate:phase8-consumers
```

The suite contains 8 cross-consumer tests.

It verifies parity between:

```text
SDK
CLI JSON
Web public projection
```

including:

```text
successful Persian translation
layout-bearing multiline input
profile metadata
expected unknown-character failure
determinism
public-boundary preservation
CLI exit-code derivation
U+0622 consumer parity
```

The U+0622 (`آ`) case intentionally freezes only consumer parity against the
current public SDK result.

It does **not** freeze a future specification adjudication outcome.

Architecture Validation explicitly watches:

```text
tools/consumers/**
```

so integration-only changes still trigger CI on relevant pushes.

### 6. Phase 8 Closure

**This document**

Closure is complete only after the final clean-state fixed point passes, the
closure commit is pushed, the pull request CI is green, and the Phase 8 branch
is merged to `main`.

---

## Public consumer architecture

At closure:

```text
Specification owns the rules
Core executes the rules
SDK exposes the stable public API
CLI and Web consume only the SDK
```

Allowed internal dependencies:

```text
core -> none
sdk -> core
cli -> sdk
web -> sdk
microsoft365 -> sdk
```

The repository architecture validator enforces this dependency graph.

---

## CLI deliverable

Package:

```text
@persian-braille/cli
```

Current package status:

```text
version: 2.0.0-dev
private: true
```

Executable:

```text
persian-braille
```

The CLI is functional inside the workspace but is not published to npm by
Phase 8.

---

## Web deliverable

Package:

```text
@persian-braille/web
```

Current package status:

```text
version: 2.0.0-dev
private: true
```

Local preview:

```text
pnpm --filter @persian-braille/web run preview
```

Default preview address:

```text
http://127.0.0.1:4173
```

The Web application is a real browser-runnable static application.

Phase 8 does not deploy or publish the Web application to a public host.

---

## Profile lifecycle

The bundled translation profile remains:

```text
id: fa-ir-g1
version: 0.1.0
status: draft
direction: print-to-braille
```

Phase 8 does not promote any rule or profile lifecycle state.

Consumers render the lifecycle metadata supplied by the public SDK.

---

## Known specification edge observed during Phase 8

Manual Web testing surfaced:

```text
آ
U+0622
ARABIC LETTER ALEF WITH MADDA ABOVE
```

as a useful current specification edge.

At Phase 8 closure, consumer behavior is defined only as:

```text
CLI result == public SDK result
Web result == public SDK result
```

The Phase 8 integration suite deliberately does not hard-code the future
semantic outcome for U+0622.

Specification adjudication remains outside the consumer phase.

---

## Test fixed point

Before the closure commit, the Phase 8 branch established:

```text
Core tests: 210/210
SDK tests: 12/12
CLI tests: 13/13
Web tests: 13/13
Phase 8 consumer integration tests: 8/8
Conformance tests: 22/22
Profile scenarios: 15/15
Normalization validation: PASS
Architecture validation: PASS
Runtime specification consumption: PASS
SDK package validation: PASS
```

The final closure fixed point must reproduce these gates from a clean state.

---

## Final clean-state fixed point

Run from:

```text
phase8-cli-web-playground
```

with a clean working tree except for this closure artifact.

Required sequence:

```text
pnpm run clean
pnpm run typecheck
pnpm run test
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run validate:runtime
pnpm run validate:conformance
pnpm run validate:sdk-package
pnpm run validate:phase8-consumers
pnpm run clean
```

Then verify:

```text
git diff --check
git status --short
```

Tracked repository hygiene must also report no generated/dependency artifacts:

```text
(^|/)(dist|node_modules)/
.tsbuildinfo
.tgz
packages/core/src/generated/
```

No fixed-point gate may depend on stale build artifacts.

---

## CI closure gate

The Phase 8 pull request must pass GitHub Architecture Validation before merge.

The workflow includes:

```text
architecture contracts
normalization baseline
workspace build
workspace typecheck
workspace tests
Phase 8 consumer integration
profile conformance
public SDK package validation
final cleanup/repository cleanliness
```

A local green result is necessary but not sufficient for final Phase 8 merge.

---

## Publication state

Phase 8 performs no npm publication.

The Phase 7 public packages remain prepared but unpublished:

```text
@persian-braille/core
@persian-braille/sdk
```

The Phase 8 CLI and Web packages remain private workspace applications.

No package publication is required to close Phase 8.

---

## Phase 8 implementation lineage

```text
533ccf6 Freeze Phase 8 CLI and Web baseline
c425ad2 Define Phase 8 CLI and Web consumer contract
5d94b9f Implement Phase 8 CLI consumer
d0ce057 Implement Phase 8 Web Playground
c9a6a96 Add Phase 8 consumer integration regression
f0fc548 Fix Phase 8 consumer CI path coverage
```

The Phase 8 closure commit follows this lineage.

Commit hashes may change if GitHub rebases the branch during merge. The semantic
ordering and patch equivalence are authoritative.

---

## Exit decision

Phase 8 is ready to close when all final fixed-point gates pass and the feature
branch merges successfully into `main`.

At that point the project has a complete consumer stack:

```text
formal specification
Unicode-aware Core
conformance suite
public SDK
CLI
browser Web Playground
```

with all consumer translation behavior delegated to the same public SDK.
