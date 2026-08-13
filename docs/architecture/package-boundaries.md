# Phase 3 — Package Boundaries

## Status

The v2 package dependency boundaries are frozen for Phase 3.

## Workspace packages

| Package | Role | Allowed direct internal dependency |
|---|---|---|
| `@persian-braille/core` | platform-agnostic translation engine | none |
| `@persian-braille/sdk` | public developer-facing API | `@persian-braille/core` |
| `@persian-braille/cli` | official CLI consumer | `@persian-braille/sdk` |
| `@persian-braille/web` | official web consumer | `@persian-braille/sdk` |
| `@persian-braille/microsoft365` | official Microsoft 365 consumer | `@persian-braille/sdk` |

## Dependency graph

```text
@persian-braille/core
          |
          v
@persian-braille/sdk
     /        |        \
    v         v         v
  cli        web     microsoft365
```

The arrows represent consumption direction: consumers depend on the package
above them.

## Forbidden dependency directions

The following dependency directions are architectural violations:

```text
core -> sdk
core -> apps/*
core -> integrations/*
sdk  -> apps/*
sdk  -> integrations/*
cli  -> core
web  -> core
microsoft365 -> core
```

Applications and integrations consume the SDK rather than bypassing it to
reach core internals.

## Package visibility

All Phase 3 package manifests are temporarily marked `private: true`.

This is a release-safety gate, not a statement that `core`, `sdk`, or `cli`
must remain private forever. Publication policy and package-release metadata
belong to later release work.

## Source scaffolds

Each workspace package contains a minimal `src/index.ts` with no translation
behavior. These files exist only so package boundaries are real TypeScript
compilation units during Phase 3.

No Braille rule, normalization behavior, translation algorithm, Office API
behavior, CLI behavior, or web behavior is implemented by this scaffold.

## Build contract

Every workspace package supports:

```text
pnpm run build
pnpm run typecheck
pnpm run clean
```

The root workspace orchestrates these commands recursively.

## Next architectural handoff

Phase 3 specification-consumption work will define how
`@persian-braille/core` receives validated Phase 2 specification artifacts
without duplicating Braille rules in TypeScript source code.
