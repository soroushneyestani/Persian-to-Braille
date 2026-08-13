# Phase 3 — Repository Topology

## Status

Repository topology is frozen for Phase 3.

## Top-level ownership

```text
/
├── spec/                       # Braille specification source of truth
├── packages/
│   ├── core/                   # translation engine
│   └── sdk/                    # public developer API
├── apps/
│   ├── cli/                    # official CLI consumer
│   └── web/                    # official browser consumer
├── integrations/
│   └── microsoft365/           # official Microsoft 365 consumer
├── legacy/                     # frozen historical implementation
├── tools/                      # repository/specification tooling
├── docs/                       # documentation and architecture records
└── .github/                    # CI and repository automation
```

## Architectural ownership

The repository follows this rule:

> Specification owns the rules. Core executes them. SDK exposes them. Applications and integrations consume the SDK.

## Dependency direction

```text
specification data
      |
      v
packages/core
      |
      v
packages/sdk
   /   |   \
  v    v    v
CLI   Web   Integrations
```

Allowed dependency direction:

- `packages/core` is independent from `packages/sdk`, `apps/*`, and `integrations/*`.
- `packages/sdk` may depend on `packages/core`.
- `apps/*` may depend on `packages/sdk`.
- `integrations/*` may depend on `packages/sdk`.
- application or integration code must not become a source of Braille rules.

## Legacy boundary

`legacy/` remains historical reference material. Legacy implementation code is not copied into the new core merely to preserve old structure. Required behavior must be represented through the specification, conformance tests, or explicit migration decisions.

## Phase boundary

This document defines repository topology only. Translation-engine implementation, Unicode normalization implementation, UI implementation, and Microsoft 365 feature implementation belong to later phases.
