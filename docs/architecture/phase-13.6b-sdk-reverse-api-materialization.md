# Phase 13.6b — SDK Reverse API Materialization

## Status

Materialization step. Do not close or commit this phase until the complete
validation chain is green and the later SDK documentation/closure step has
resolved any remaining historical documentation wording.

## Baseline

- Branch: `phase13-reverse-translation`
- Baseline commit: `aa5ce927d218ab2535d93e7b1e36d2fdb7a97317`
- Public Core reverse boundary: closed in Phase 13.5c-3c2.
- Canonical SDK reverse contract: frozen in Phase 13.2.

## Public runtime additions

Exactly two runtime exports are introduced:

- `PersianBrailleReverseTranslationError`
- `createPersianBrailleReverseTranslator`

The existing forward runtime exports remain unchanged.

## Public type additions

Exactly the fourteen type exports frozen in the Phase 13.2 `sdkContract` are
introduced. `PersianBrailleReverseDiagnosticCode` is intentionally **not** a
public type export; the six diagnostic code strings are represented by the
`code` field of `PersianBrailleReverseDiagnostic`.

## Projection boundary

The SDK owns its public reverse result objects and error class. The runtime
delegates reverse execution to the public Core `createReverseTranslator`
factory and projects Core results into frozen SDK objects.

Factory-level reverse options are defaults. Per-call options override those
defaults before execution.

## Historical validator composition

Historical validators that required the SDK reverse boundary to remain absent
are made milestone-composable. They require the reverse runtime factory and
reverse SDK error to appear atomically instead of requiring them to remain
absent forever.

Historical source-boundary guards continue to protect the pre-existing forward
SDK implementation files. Only the new reverse modules and the package root
index are admitted by the later milestone.

The Phase 12 ecosystem closure validator continues to assert that the original
forward SDK source files do not contain the Phase 13 reverse method.

A separate historical Phase 13.4 guard also froze the entire
`packages/sdk/src/` tree. The Phase 13.6b composition narrows that guard to the
two pre-existing forward implementation files, `public-api.ts` and
`translator.ts`, so the new reverse modules and package root may be introduced
without weakening the historical forward-SDK freeze.

## Explicit non-goals

This step does not modify:

- Core reverse semantics;
- forward SDK `public-api.ts` or `translator.ts`;
- CLI behavior;
- Web behavior;
- Microsoft 365 behavior;
- Phase 14+ domains.

SDK README modernization is not used as an implementation precondition in this
materialization step; historical Phase 12 documentation assertions remain
intact until the dedicated Phase 13.6 documentation/closure step.
