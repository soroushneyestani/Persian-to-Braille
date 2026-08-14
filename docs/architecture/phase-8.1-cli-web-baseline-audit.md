# Phase 8.1 — CLI / Web Baseline Audit

## Status

**Phase 8.1: CLOSED**

This artifact freezes the CLI/Web consumer baseline before Phase 8 application implementation.

The source audit was read-only. No CLI or Web functionality was introduced by this step.

## Baseline point

Phase 8 starts from:

```text
branch: phase8-cli-web-playground
base: 08efb25
```

At this point Phase 7 — Public SDK is closed on `main`.

## Toolchain

The audited workspace uses:

```text
Node.js: 24.19.0
pnpm: 11.21.0
TypeScript: 6.0.3
module system: ESM / NodeNext
target: ES2024
```

## Existing dependency boundary

The repository already enforces:

```text
Specification -> Core -> SDK -> Consumers
```

For Phase 8 specifically:

```text
CLI -> SDK
Web -> SDK
```

The architecture validator allows `@persian-braille/cli` and `@persian-braille/web` to depend on `@persian-braille/sdk`, and forbids direct Core dependencies from either application.

Both application manifests already declare:

```json
"@persian-braille/sdk": "workspace:*"
```

## CLI baseline

Package:

```text
@persian-braille/cli
version: 2.0.0-dev
private: true
type: module
```

Tracked files:

```text
apps/cli/README.md
apps/cli/package.json
apps/cli/src/index.ts
apps/cli/tsconfig.json
```

Source implementation:

```ts
export {};
```

Therefore the CLI is currently a repository skeleton, not an executable command-line application.

### Present

The CLI baseline already has:

```text
workspace package identity
ESM/TypeScript build contract
SDK workspace dependency
dist export/type declaration boundary
clean/typecheck/build scripts
architecture responsibility documentation
```

### Absent

The CLI baseline has no:

```text
runtime command entrypoint
bin manifest entry
argument parser
stdin/stdout workflow
exit-code contract
human-readable output contract
machine-readable JSON output contract
translation invocation
SDK import
error rendering
tests
CLI framework dependency
```

The baseline scan found:

```text
SDK imports: 0
Core imports: 0
Specification imports: 0
Node API imports: 0
test files: 0
```

## Web baseline

Package:

```text
@persian-braille/web
version: 2.0.0-dev
private: true
type: module
```

Tracked files:

```text
apps/web/README.md
apps/web/package.json
apps/web/src/index.ts
apps/web/tsconfig.json
```

Source implementation:

```ts
export {};
```

Therefore the Web application is also a repository skeleton, not a browser playground.

### Present

The Web baseline already has:

```text
workspace package identity
ESM/TypeScript build contract
SDK workspace dependency
dist export/type declaration boundary
clean/typecheck/build scripts
architecture responsibility documentation
```

### Absent

The Web baseline has no:

```text
HTML application entrypoint
browser bootstrap
bundler/dev server
UI framework
translation UI
input/output controls
copy/download workflow
profile/status presentation
SDK import
browser error presentation
browser tests
accessibility interaction contract
```

The baseline scan found:

```text
SDK imports: 0
Core imports: 0
Specification imports: 0
browser-framework markers: 0
bundler markers: 0
test files: 0
```

## SDK surface available to Phase 8

Phase 8 consumers already have the Phase 7 public runtime surface:

```text
createPersianBrailleTranslator
PersianBrailleTranslationError
```

The public success result already provides:

```text
input
profile
normalizedText
cells
unicodeBraille
structuralTokens
```

The public failure result already provides stable error codes and optional Unicode location/context fields.

Therefore neither application needs direct Core access.

## Baseline gap summary

The current consumer layer is structurally prepared but functionally empty.

The major gaps are:

```text
1. no application-level consumer contract
2. no CLI runtime behavior
3. no Web runtime behavior
4. no application tests
5. no browser toolchain
6. no user-facing error/output conventions
7. no CLI/Web parity rules
```

These are Phase 8 implementation gaps, not SDK or Core gaps.

## Architectural invariants for Phase 8

Phase 8 implementation must preserve:

```text
CLI/Web consume SDK only
no direct Core imports
no direct specification imports
no duplicated Braille mappings
no duplicated normalization rules
no duplicated rule precedence
no application-owned translation semantics
```

CLI and Web may own only consumer concerns such as:

```text
input acquisition
argument/UI validation
formatting
presentation
copy/download behavior
process exit codes
browser state
accessibility UX
```

## Observed packaging detail

Both application `tsconfig.json` files currently place TypeScript build-info inside:

```text
dist/.tsbuildinfo
```

Unlike the public Core/SDK packages, CLI/Web are private and are not currently release packages. This is not a Phase 8.1 failure.

Phase 8 implementation should revisit application build-cache placement when the real CLI/Web build and distribution model is defined.

## CI baseline

The existing Architecture Validation workflow already reacts to:

```text
apps/**
```

and executes architecture, build, typecheck, tests, conformance, and SDK package validation.

Phase 8 should add application tests into the workspace test graph rather than creating an isolated validation path.

## Exit decision

Phase 8.1 establishes that both consumer applications are intentionally empty skeletons with the correct dependency declaration but no runtime behavior.

No legacy CLI/Web implementation needs to be preserved or migrated.

The next finite deliverable is:

**Phase 8.2 — Consumer Application Contract**
