# Phase 9.1 — Word Office Platform & Manifest Baseline Audit

## Status

**BASELINE FROZEN**

This audit records the Microsoft 365 integration state immediately after Phase 8
and before any Office Add-in implementation is introduced.

## Phase 9 target

Phase 9 is intentionally limited to **Microsoft Word**.

Target clients:

```text
Word on the web
Word for Microsoft 365 on Windows
Word for Microsoft 365 on Mac
```

Explicitly outside Phase 9:

```text
Excel
PowerPoint
Office mobile
perpetual/non-subscription Office compatibility work
reverse translation
Braille Music
Microsoft Marketplace submission
```

Excel and PowerPoint remain future host adapters and are not implemented in
Phase 9.

## Manifest strategy decision

For Phase 9 implementation, the project will use the **add-in only manifest**
(XML) as the production-oriented baseline.

Reason:

- Microsoft currently supports the unified manifest on the desired Word
  platforms, but its Excel/PowerPoint/Word Yo Office project option remains
  documented as **preview**.
- Microsoft explicitly documents that this preview option should not be used for
  production add-ins.
- Phase 11 intends to prepare the add-in for Microsoft Marketplace publication,
  so Phase 9 should avoid creating a manifest migration requirement without a
  concrete benefit.

The unified manifest is therefore **deferred**, not rejected permanently.
Its production status can be re-audited before Phase 11.

## Current integration package

```text
name: @persian-braille/microsoft365
version: 2.0.0-dev
private: true
module type: module
```

Current runtime dependencies:

```text
{
  "@persian-braille/sdk": "workspace:*"
}
```

Current development dependencies:

```text
{}
```

The current package already has the correct high-level translation dependency:

```text
microsoft365 -> @persian-braille/sdk
```

No direct Core or canonical specification dependency is declared.

## Current source state

Current source entry point:

```text
integrations/microsoft365/src/index.ts
```

Content:

```ts
export {};
```

Therefore no Office host adapter, Word interaction, task pane, command runtime,
or application composition root exists yet.

## Current files

Files currently present outside generated/dependency directories:

```text
integrations/microsoft365/README.md
integrations/microsoft365/package.json
integrations/microsoft365/src/index.ts
integrations/microsoft365/tsconfig.json
```

Manifest files found:

```text
none
```

There is currently no Office Add-in manifest in the integration package.

## Office implementation markers

Files containing Office/Word/tooling terminology:

```text
integrations/microsoft365/README.md
```

The current README describes intended Microsoft 365 responsibility, but there is
no actual Office.js implementation.

## TypeScript build baseline

```text
rootDir: ./src
outDir: ./dist
tsBuildInfoFile: ./dist/.tsbuildinfo
composite: true
```

The current `tsBuildInfoFile` is inside `dist`.

When the real Office application build is introduced, Phase 9 should move this
file outside `dist`, following the clean-state pattern already established for
CLI and Web.

## Local dependency directory

`integrations/microsoft365/node_modules` exists locally:

```text
true
```

This is a workspace/dependency artifact and must remain untracked.

Its presence is not part of the Office Add-in source baseline.

## Global npm tooling observation

The pre-audit global npm listing failed because the user's roaming npm directory
did not exist.

That result does **not** establish whether Office tooling is installed globally,
and global tooling is not required as a Phase 9 repository invariant.

Phase 9 will not require globally installed Yeoman/Office tooling as part of the
project contract.

If a Microsoft-generated scaffold is needed for reference, it should be created
outside the repository and inspected before any selected pieces are ported into
the monorepo.

## Architecture boundary

The Phase 9 dependency rule is:

```text
Specification
    ↓
Core
    ↓
SDK
    ↓
Microsoft 365 integration
    ↓
Word host adapter / task pane
```

Forbidden:

```text
Word -> Core
Word -> canonical spec
task pane -> duplicated Braille mappings
manifest -> translation semantics
Office-specific normalization
```

Office-specific code is responsible only for host interaction and presentation.

## Intended Word MVP

The Phase 9 Word workflow is frozen to:

```text
Select Persian text in Word
        ↓
Translate Selection
        ↓
Public SDK
        ↓
Braille preview
        ↓
Copy / Replace Selection / Insert After
```

A single ribbon command opens or activates the Persian-to-Braille task pane.

## Tooling policy

Phase 9 must not run an Office project generator directly in the repository
before the adapter contract is defined.

The implementation sequence is:

```text
9.1 baseline audit
9.2 host adapter contract
9.3 selection translation
9.4 task pane + ribbon
9.5 Web/Windows/Mac sideload and regression
9.6 closure
```

Any reference scaffold is disposable evidence, not repository architecture.

## Current gaps

At baseline, the following are intentionally absent:

```text
Office.js dependency/runtime
Word JavaScript API types
manifest.xml
task pane HTML/CSS/TypeScript
ribbon command configuration
HTTPS development server
Office development certificate tooling
sideload scripts
Word host adapter
selection read/write behavior
Office-specific tests
cross-client sideload evidence
```

These are Phase 9 implementation work, not Phase 8 regressions.

## Phase 9.1 exit decision

Phase 9.1 is complete when this baseline artifact is committed on the Phase 9
feature branch with no Office implementation changes.

The next finite deliverable is:

**Phase 9.2 — Microsoft 365 Word Host Adapter Contract**
