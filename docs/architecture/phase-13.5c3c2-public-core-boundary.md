# Phase 13.5c-3c2 — Public Core Reverse Boundary

## Status

**MATERIALIZED / VALIDATION REQUIRED**

Coverage entering this milestone:

```text
forward rules             176
reverse vectors           142
canonical collisions      34 / 34
direct reversal           16 / 16
parser-required            8 / 8
```

The corrected readiness audit confirmed that the earlier
`NOT_READY_FOR_PUBLIC_CORE_BOUNDARY` result was a false negative. The actual
Core contract uses `ReverseTranslationOutcome` and
`ReverseTranslationFailure`.

## Frozen Core root surface

Runtime:

```text
createReverseTranslator
```

Types:

```text
ReverseAmbiguityPolicy
ReverseDiagnostic
ReverseDiagnosticCode
ReverseDigitFamily
ReverseEllipsisStyle
ReverseProfileSnapshot
ReversePunctuationStyle
ReverseTranslationFailure
ReverseTranslationFailureCode
ReverseTranslationOptions
ReverseTranslationOutcome
ReverseTranslationSuccess
ReverseTranslator
ReverseUnicodeLocation
```

The root uses explicit named exports. Reverse modules are not exposed with
`export *`.

The existing `@persian-braille/core` package exports map remains unchanged; no
new subpath is introduced.

Six historical Core-root validators and one Phase 13.4 foundation test
previously required the Core reverse root to remain private. They are made
milestone-composable by requiring runtime and type root exposure to move
together. Both-private and both-public are valid milestones; partial exposure
is invalid.

The historical Phase 13.3 specification-only source-boundary guard remains
strict for `packages/core/src/` generally, but explicitly admits only
`packages/core/src/index.ts` for this later public-boundary milestone. No other
Core source file is added to that allowance.

The Phase 13.4 internal-only source comments are updated to reflect the new
public Core milestone while preserving the still-deferred SDK boundary.

The historical Phase 13.5c-3b frozen/deferred guard admits those two reverse
source files only through exact comment substitution against `HEAD`. Any other
change in either file remains a validation failure, so reverse parser/runtime
semantics stay frozen during the public-boundary step.

This step does not change parser semantics, Forward Core, SDK reverse API, CLI,
Web, or Microsoft 365 integrations.

## Next

After validation and commit, proceed to the separately frozen SDK reverse API.
