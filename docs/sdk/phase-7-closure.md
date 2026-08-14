# Phase 7 — Public SDK Closure

## Status

**Closure candidate**

Phase 7 is considered **CLOSED** when this closure commit is present on `main`
after all required CI checks are green.

No npm package is published by Phase 7 closure.

## Phase objective

Phase 7 establishes a stable, consumer-facing SDK boundary above Core:

```text
Specification -> Core -> SDK -> Consumers
```

The SDK exposes Persian Braille translation without transferring ownership of
translation semantics, rule selection, normalization, precedence, or canonical
specification records away from Core.

## Exit criteria

Phase 7 had exactly six finite exit criteria:

```text
1. SDK Baseline Audit
2. Public API Contract
3. SDK Implementation
4. Consumer & Error-Surface Tests
5. Packaging & Release Readiness
6. Phase 7 Closure
```

All implementation criteria 1-5 are complete.

This document is the Phase 7.6 closure artifact.

## Phase 7.1 — SDK Baseline Audit

Completed by:

```text
docs/sdk/phase-7.1-baseline-audit.md
tools/sdk/audit-phase7-sdk-baseline.py
```

The audit froze the original SDK topology and publication gaps before the public
surface was introduced.

Key baseline findings included:

```text
SDK package: @persian-braille/sdk
version: 2.0.0-dev
module format: ESM
Core dependency: @persian-braille/core workspace:*
direct Core imports outside SDK: 0
dedicated SDK tests: none
public package metadata: incomplete
```

## Phase 7.2 — Public API Contract

Completed by:

```text
packages/sdk/src/public-api.ts
docs/sdk/phase-7.2-public-api-contract.md
```

The public contract defines:

```text
PersianBrailleTranslationResult
PersianBrailleTranslationSuccess
PersianBrailleTranslationFailure
PersianBrailleTranslationFailureCode
PersianBrailleTranslationErrorData
PersianBrailleProfileInfo
PersianBrailleUnicodeLocation
PersianBrailleTranslator
CreatePersianBrailleTranslator
```

The stable public failure-code surface is:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
UNKNOWN_SEQUENCE
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

The public contract intentionally excludes Core-internal execution structures.

## Phase 7.3 — SDK Implementation

Completed by:

```text
packages/sdk/src/translator.ts
packages/sdk/src/index.ts
docs/sdk/phase-7.3-sdk-implementation.md
```

The runtime root exposes only:

```text
createPersianBrailleTranslator
PersianBrailleTranslationError
```

plus selected type-only public API exports.

The SDK:

```text
delegates translation to Core
reads bundled profile metadata from Core
projects Core results into SDK-owned immutable objects
copies/freeze public arrays
preserves dual Unicode location indices
maps supported Core failures to the stable SDK failure surface
does not re-export Core engine internals
```

## Phase 7.4 — Consumer & Error-Surface Tests

Completed by:

```text
packages/sdk/test/public-api.test.mjs
docs/sdk/phase-7.4-consumer-error-tests.md
```

The package-name consumer suite contains:

```text
12 tests
12 pass
0 fail
```

Coverage includes:

```text
runtime root export boundary
profile metadata immutability
Persian translation
ZWNJ final structural aggregate
numeric translation
UNKNOWN_CHARACTER
PREPROCESSING_FAILED
dual Unicode indices
translateOrThrow success
SDK error failure
result immutability
determinism
```

## Phase 7.5 — Packaging & Release Readiness

Completed by:

```text
LICENSE
packages/core/LICENSE
packages/sdk/LICENSE
packages/core/package.json
packages/sdk/package.json
packages/core/README.md
packages/sdk/README.md
tools/sdk/validate-sdk-package.mjs
docs/sdk/phase-7.5-packaging-release-readiness.md
```

The intended npm namespace is:

```text
@persian-braille
```

Publishable packages are:

```text
@persian-braille/core
@persian-braille/sdk
```

Both remain at the prerelease development version:

```text
2.0.0-dev
```

The repository and both public packages use:

```text
MIT
```

The packaging validator performs real package-level checks:

```text
Core build
SDK build
Core pnpm pack
SDK pnpm pack
tarball inspection
packed manifest inspection
workspace:* conversion validation
MIT license validation
published-file boundary validation
isolated local tarball install
package-name SDK import
isolated translation/error smoke
```

The packed SDK dependency is required to resolve from:

```text
@persian-braille/core: workspace:*
```

in the development workspace to:

```text
@persian-braille/core: 2.0.0-dev
```

in the packed manifest.

No `workspace:` protocol may leak into the public tarball.

The isolated installation is registry-independent and uses the locally packed
Core and SDK tarballs.

## Final local fixed point

The Phase 7 closure candidate must pass the following commands from a clean
feature-branch state:

```text
pnpm run clean
pnpm run typecheck
pnpm run test
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run validate:runtime
pnpm run validate:conformance
pnpm run validate:sdk-package
```

### Clean-state workspace typecheck invariant

Consumer packages resolve internal workspace package types through each
package's published `dist` export boundary.

Therefore the root workspace typecheck gate first builds the workspace in
dependency order and then runs each package's `--noEmit` typecheck:

```text
pnpm run build
pnpm -r --if-present run typecheck
```

This prevents a false green result that depends on stale `dist` artifacts from
an earlier build and makes `pnpm run typecheck` reproducible immediately after
`pnpm run clean`.

Individual package `typecheck` scripts remain non-emitting checks; dependency
materialization is an orchestration responsibility of the root workspace gate.

The latest pre-closure fixed point established:

```text
Core tests:                    210 / 210 PASS
SDK public API tests:           12 / 12 PASS
Conformance tests:              22 / 22 PASS
Profile scenarios:              15 / 15 PASS
Required scenarios:             13 / 13 PASS
Draft scenarios:                 2 / 2 PASS
Normalization validation:              PASS
Architecture boundaries:               PASS
Repository hygiene:                    PASS
Runtime specification determinism:     PASS
Runtime specification consumption:     PASS
SDK package validation:                PASS
Isolated packed SDK smoke:             PASS
```

The closure run must reproduce this fixed point after this document is added.

## Repository hygiene

After the final validation run:

```text
pnpm run clean
```

must leave no tracked/generated publication or compiler artifacts.

The closure audit checks for tracked:

```text
dist/
node_modules/
*.tsbuildinfo
*.tgz
packages/core/src/generated/
```

and requires zero matches.

## Governance boundary

Phase 7 does not change Persian Braille normative governance.

The bundled profile remains:

```text
id: fa-ir-g1
version: 0.1.0
status: draft
direction: print-to-braille
```

Candidate rules admitted by the draft profile may execute through Core, but SDK
publication does not promote any candidate rule to normative status.

CI has no normative-promotion authority.

## Security and publication boundary

Phase 7 introduces no committed registry credentials.

No npm access token, auth token, or credential-bearing `.npmrc` is added to the
repository.

Phase 7 closure does **not** publish:

```text
@persian-braille/core
@persian-braille/sdk
```

Actual npm publication is a deliberate post-closure release action.

For the current development prerelease, the intended explicit distribution tag
is:

```text
next
```

A final stable `2.0.0` release may move to `latest` only as a separate deliberate
release decision.

## Commit lineage

Phase 7 implementation lineage:

```text
825ec18 Freeze Phase 7 SDK baseline
4d37bf5 Define Phase 7 public SDK API contract
75d1456 Implement Phase 7 public SDK facade
4a75386 Add Phase 7 SDK consumer contract tests
230452e Add Phase 7 SDK packaging and release readiness
c7c5b6b Close Phase 7 public SDK
```

A post-closure clean-state audit exposed and corrected the workspace typecheck
orchestration dependency on pre-existing `dist` output. The final Phase 7
closure state includes that correction after `c7c5b6b`.

Commit hashes may change if the branch is rebased before merge; the semantic
phase ordering is authoritative.

## CI and merge gate

Phase 7 is not closed merely because local tests pass.

Closure requires:

```text
1. final local fixed point is green
2. working tree is clean after the closure commit
3. feature branch is pushed
4. required GitHub Actions checks are green
5. closure commit is merged to main
6. local main is updated to the merged origin/main state
```

Only then should the project roadmap mark:

```text
Phase 7 — Public SDK: CLOSED
```

## Explicitly outside Phase 7

Phase 7 does not implement:

```text
CLI user experience
Web Playground
Microsoft 365 add-in behavior
Marketplace submission
reverse Braille translation
Braille Music
multi-language Braille framework
normative standards promotion
npm publication
```

Those remain later roadmap work.

## Next phase

After this closure is merged and verified on `main`, the next implementation
phase is:

**Phase 8 — CLI + Web Playground**
