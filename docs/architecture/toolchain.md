# Phase 3 — Workspace and Toolchain Contract

## Status

The v2 workspace/toolchain baseline is frozen for Phase 3.

## Baseline

| Concern | Contract |
|---|---|
| Runtime | Node.js 24.19.0 |
| Package manager | pnpm 11.21.0 |
| Language | TypeScript 6.0.3 |
| Module model | ECMAScript modules (ESM) |
| Workspace | pnpm workspace |
| TypeScript module resolution | NodeNext |
| JavaScript target | ES2024 |

## Runtime ownership

The repository declares Node.js 24.19.0 through both the root manifest and
`.node-version`.

`devEngines.runtime` is authoritative for pnpm-managed project execution.
The resolved runtime is expected to be represented in the pnpm lockfile.

The root `engines.node` range intentionally accepts patch/minor releases in
the Node.js 24 line at manifest-validation time, while the project runtime
declaration pins development and scripted execution to 24.19.0.

## Package-manager ownership

The repository pins pnpm 11.21.0 in the root `packageManager` field.

`pmOnFail: error` prevents silently continuing with a different pnpm version.

## Workspace membership

The pnpm workspace owns:

```text
packages/*
apps/*
integrations/*
```

`spec/`, `tools/`, `docs/`, and `legacy/` are repository assets but are not
JavaScript workspace packages merely because they exist in the repository.

## TypeScript baseline

The shared base configuration uses:

- strict type checking;
- ESM/NodeNext semantics;
- exact optional-property behavior;
- unchecked-index protection;
- explicit override and switch-safety checks;
- declaration/source-map defaults for packages that later emit artifacts.

Package-specific `tsconfig.json` files may extend this base but must not
weaken repository-wide correctness settings without an explicit architecture
decision.

## Root commands

The root manifest defines orchestration commands for:

```text
pnpm build
pnpm test
pnpm typecheck
```

During Phase 3 these commands delegate only to workspace packages that
actually define the corresponding script. Concrete package build/test/typecheck
contracts are established with the package boundaries and validation work.

## Phase boundary

This contract establishes tooling and workspace behavior only. It does not
implement translation, normalization, CLI behavior, web behavior, or
Microsoft 365 integration behavior.
