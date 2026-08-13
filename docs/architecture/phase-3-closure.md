# Phase 3 — v2 Repository Architecture Closure

## Status

**Phase 3: CLOSED**

This document records the completed Phase 3 architecture baseline for the
Persian-to-Braille v2 repository.

Phase 3 establishes repository structure, package boundaries, toolchain,
specification consumption, and automated architecture enforcement. It does not
implement Braille translation semantics.

## Exit criteria

All six Phase 3 deliverables are complete:

- [x] Repository topology defined and documented.
- [x] Workspace and toolchain contract established.
- [x] Core/SDK/application/integration package boundaries established.
- [x] Canonical specification-consumption boundary established.
- [x] Local and CI architecture validation established and passing.
- [x] Architecture closure and Phase 4 handoff recorded.

## Frozen repository topology

```text
/
├── spec/                       # canonical Braille specification
├── packages/
│   ├── core/                   # platform-agnostic engine boundary
│   └── sdk/                    # public developer API boundary
├── apps/
│   ├── cli/                    # official CLI consumer
│   └── web/                    # official browser consumer
├── integrations/
│   └── microsoft365/           # official Microsoft 365 consumer
├── legacy/                     # frozen historical implementation
├── tools/                      # specification/repository tooling
├── docs/                       # project documentation
└── .github/                    # CI automation
```

## Architectural ownership

The governing dependency principle is:

> Specification owns the rules. Core executes them. SDK exposes them.
> Applications and integrations consume the SDK.

The internal package graph is:

```text
@persian-braille/core
          |
          v
@persian-braille/sdk
      /       |       \
     v        v        v
   cli       web    microsoft365
```

Applications and integrations do not bypass the SDK to import Core directly.

Core does not depend on SDK, applications, or integrations.

## Toolchain baseline

Phase 3 closes with the following pinned development baseline:

| Concern | Baseline |
|---|---|
| Node.js | 24.19.0 |
| pnpm | 11.21.0 |
| TypeScript | 6.0.3 |
| Module model | ESM |
| TypeScript module resolution | NodeNext |
| Workspace | pnpm workspace |

The repository lockfile and runtime declarations are committed and validated
from clean CI checkouts.

## Canonical specification boundary

`spec/fa-ir/` remains the single source of truth for Persian Braille rules.

At the Phase 3 closure baseline:

| Item | Value |
|---|---:|
| Profile | `fa-ir-g1` |
| Profile version | `0.1.0` |
| Profile status | `draft` |
| Admitted rules | 175 |
| Normative rules | 37 |
| Candidate rules | 138 |

The runtime rule set is selected through `profile.ruleIds`.

TypeScript does not redefine the 175 canonical rule documents. A deterministic
build-time generator creates a derivative runtime module for
`@persian-braille/core`.

The Phase 3 closure baseline canonical-source digest is:

```text
dcdb19f08c34d0f39784dfc8404ff8f177141460705d6b701f6d33755829c682
```

The corresponding deterministic generated-module SHA-256 observed during
Phase 3 validation is:

```text
931c9cfa676d2a666b1cef642c4227c12dacefe1040220b3c4eb46f101dff69a
```

These hashes describe the closure baseline. Future legitimate specification
changes are expected to produce new hashes.

## Lifecycle preservation

The runtime specification bundle preserves rule lifecycle state.

Candidate materialization is not normative promotion.

Phase 3 does not alter the Phase 2 governance boundary and does not promote
candidate rules.

## Automated enforcement

The repository now enforces architecture through:

```text
pnpm run validate:boundaries
pnpm run validate:hygiene
pnpm run validate:spec-determinism
pnpm run validate:architecture
pnpm run validate:runtime
```

Architecture validation covers:

- allowed internal package dependencies;
- forbidden direct internal dependency directions;
- TypeScript internal-package imports;
- tracked `node_modules/`, `dist/`, `*.tsbuildinfo`, and generated runtime data;
- deterministic runtime-specification generation;
- compiled-Core equivalence with the canonical admitted profile/rule set;
- workspace build and typecheck;
- clean-checkout reproducibility.

## CI separation

Two independent GitHub Actions concerns remain intentionally separate:

### Specification Validation

Owns the existing Phase 2 canonical specification, governance, regeneration,
negative fixtures, adjudication, promotion, and reproducibility checks.

### Architecture Validation

Owns the v2 TypeScript workspace, package boundaries, repository hygiene,
runtime-specification determinism, build/typecheck, compiled-Core
specification consumption, and clean-checkout architecture gate.

This separation prevents application architecture from becoming the owner of
Braille specification governance.

## Repository hygiene

Generated and dependency artifacts are excluded from version control:

```text
node_modules/
dist/
*.tsbuildinfo
packages/core/src/generated/
```

The generated runtime specification is rebuilt as needed and is not a second
tracked source of truth.

## Legacy boundary

Legacy implementation remains isolated under `legacy/`.

Phase 3 does not migrate legacy source code into the new Core package merely
to preserve historical implementation structure.

Future implementation behavior must be justified by the canonical
specification, conformance data, or an explicit migration decision.

## Explicitly outside Phase 3

Phase 3 does not implement:

- Unicode normalization behavior;
- translation-rule execution;
- rule matching or precedence execution;
- context resolution;
- mode transitions;
- layout execution;
- public SDK translation APIs;
- functional CLI behavior;
- functional web UI;
- Microsoft 365 Office.js behavior;
- reverse translation;
- Braille Music;
- multi-language Braille execution.

The presence of package/application scaffolds is not a claim that those
features are implemented.

## Phase 4 handoff

The next phase is:

**Phase 4 — Unicode Normalization**

Phase 4 begins from the following frozen assumptions:

- `spec/fa-ir/` remains canonical;
- Core consumes specification data through the Phase 3 boundary;
- normalization behavior must come from explicit specification policy/rules,
  not duplicated hard-coded Braille mappings;
- package dependency directions remain enforced;
- Phase 2 lifecycle and governance semantics remain preserved;
- Phase 4 implementation must keep both architecture and specification CI
  green.

Phase 4 should define its own finite exit criteria before implementation
begins.

## Reopening policy

Phase 3 should not be reopened for ordinary implementation work.

A Phase 3 correction is justified only for a genuine architecture defect in a
frozen Phase 3 contract. New features, new consumers, implementation details,
and ordinary refinements belong to subsequent phases unless they demonstrate
such a defect.

## Closure statement

With the repository topology, toolchain, package graph, specification
consumption boundary, automated enforcement, and CI gates established,
Phase 3 provides the stable architectural substrate required for v2
implementation.

**Phase 3 — v2 Repository Architecture: CLOSED**
