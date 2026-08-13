# Phase 4 — Unicode Normalization Closure

## Status

**Phase 4 — Unicode Normalization: CLOSED**

This document closes Phase 4 of the Persian-to-Braille v2 roadmap.

Phase 4 established deterministic, specification-driven Unicode preprocessing
inside `@persian-braille/core` without implementing Braille translation.

## Exit criteria

Phase 4 was defined by six finite deliverables.

```text
1. Canonical Normalization Audit        COMPLETE
2. Normalization Domain Contract        COMPLETE
3. Deterministic Normalization Pipeline COMPLETE
4. Normalization Conformance Suite      COMPLETE
5. CI / Regression Enforcement          COMPLETE
6. Phase 4 Closure                      COMPLETE
```

No additional normalization implementation work is required to close this
phase.

## 1. Canonical Normalization Audit

The Phase 4 audit froze the normalization baseline inherited from the canonical
`fa-ir-g1` specification.

The current profile policy is:

```text
profile                      fa-ir-g1 0.1.0
unicodeForm                  none
unknownFormatControls        error
admitted rules               175
canonicalInput rewrites      0
normalization rules          1
```

All admitted rules declare:

```text
normalization.form = none
```

The audit also confirmed that unresolved orthographic variants remain deferred
and must not be converted into implementation-specific rewrites.

Audit artifacts:

```text
tools/normalization/audit-phase4-normalization.py
docs/normalization/phase-4.1-normalization-audit.md
```

## 2. Normalization Domain Contract

Core now defines an explicit preprocessing contract for:

```text
NormalizationPolicySnapshot
UnicodeLocation
RecognizedFormatControl
NormalizationSuccess
NormalizationFailure
NormalizationOutcome
UnicodePreprocessor
```

Unicode positions retain both:

```text
codePointIndex
utf16Index
```

so specification-level Unicode scalar indexing is not confused with JavaScript
UTF-16 offsets.

Contract artifacts:

```text
packages/core/src/normalization.ts
docs/normalization/phase-4.2-domain-contract.md
```

## 3. Deterministic Normalization Pipeline

Core now provides:

```text
createUnicodePreprocessor()
```

The implementation consumes the canonical runtime specification bundle
established in Phase 3.

For the current profile it performs no NFC, NFD, NFKC, or NFKD transformation
and performs no Persian/Arabic orthographic remapping.

Successful preprocessing currently preserves text exactly:

```text
outputText === inputText
changed === false
```

Recognized Unicode format controls are derived from admitted specification
rules rather than from an independently maintained implementation table.

Unknown Unicode format controls are rejected according to the profile policy
with the typed failure:

```text
UNKNOWN_FORMAT_CONTROL
```

Implementation artifacts:

```text
packages/core/src/unicode-preprocessor.ts
docs/normalization/phase-4.3-normalization-pipeline.md
```

## 4. ZWNJ cross-layer semantics

U+200C ZERO WIDTH NON-JOINER intentionally remains represented in two admitted
semantic layers:

```text
FA-G1-LAYOUT-027
  status: candidate
  token: layout:shaping-control:U+200C

FA-G1-NORM-ZWNJ-001
  status: candidate
  token: normalization:zwnj-orthographic-boundary
```

The normalization preprocessor preserves both references in its annotation.

This cross-layer aggregation does not promote either candidate rule to
normative status.

The canonical normalization conformance vector remains:

```text
FA-CONF-NORM-ZWNJ-001
status: draft
```

Its vector-scoped expectations are verified as a subset of the complete
runtime annotation so that canonical vector scope is not incorrectly treated
as the entire cross-layer runtime state.

## 5. Format-control baseline

The current admitted rule set recognizes four distinct Unicode format-control
code points:

```text
U+200B ZERO WIDTH SPACE
U+200C ZERO WIDTH NON-JOINER
U+2060 WORD JOINER
U+FEFF ZERO WIDTH NO-BREAK SPACE
```

U+200D ZERO WIDTH JOINER is not admitted by the current profile and is used as
an implementation regression case for unknown-format-control rejection.

The implementation does not hard-code the admitted set as its source of
truth. The Phase 4 regression validator freezes the current set only so a
future specification change cannot silently alter behavior without deliberate
review.

## 6. Normalization conformance and regression suite

The Core package contains a committed Node.js test suite:

```text
packages/core/test/unicode-preprocessor.test.mjs
```

The suite currently contains nine tests covering:

```text
plain Persian text preservation
no invented Arabic/Persian orthographic remapping
all admitted single-code-point format controls
canonical ZWNJ conformance-vector bridge
ZWNJ cross-layer annotation preservation
Unicode code-point versus UTF-16 indexing
unknown format-control rejection
deterministic repeated preprocessing
idempotence-compatible current behavior
```

The supplementary-plane indexing regression uses a Unicode escape rather than
a terminal-dependent literal character.

Current result:

```text
tests 9
pass 9
fail 0
```

## 7. Fail-closed regression enforcement

Phase 4 provides:

```text
pnpm run validate:normalization
```

implemented by:

```text
tools/normalization/validate-phase4-normalization.mjs
```

The validator rejects silent changes to the Phase 4 baseline, including:

```text
unicodeForm
unknownFormatControls
canonicalInput rewrites
normalization-rule count/identity
ZWNJ lifecycle state
ZWNJ structural semantics
known format-control set
ZWNJ conformance-vector lifecycle/scope
```

A legitimate future specification change may change these values, but the
implementation and its contract must then be updated deliberately.

## 8. CI integration

The existing `Architecture Validation` workflow now includes Phase 4
normalization validation.

Normalization implementation, tests, tooling, and documentation trigger the
architecture workflow.

The repository-wide test command now executes the Core normalization suite.

The independent `Specification Validation` workflow remains the authority for
Phase 2 specification/governance integrity.

The Phase 4 pull request passed both required validation tracks before closure:

```text
Architecture Validation     PASS
Specification Validation    PASS
```

## 9. Architecture invariants preserved

Phase 4 preserves the Phase 3 dependency direction:

```text
specification
    |
    v
core
    |
    v
sdk
    |
    +--> cli
    +--> web
    +--> integrations/microsoft365
```

Normalization remains a Core concern.

No Office-specific behavior is introduced into Core.

No SDK, CLI, Web, or Microsoft 365 feature is required for Phase 4 closure.

## 10. Specification governance preserved

Phase 4 does not modify the normative-promotion model.

In particular:

```text
candidate != normative
draft conformance != active conformance
runtime admission != normative promotion
CI success != normative promotion
```

`FA-G1-NORM-ZWNJ-001` remains candidate.

`FA-CONF-NORM-ZWNJ-001` remains draft.

The deferred normalization-related adjudication backlog remains deferred.

## 11. Explicitly outside Phase 4

The following are not Phase 4 responsibilities:

```text
character-to-Braille translation
sequence/precedence execution
context matching
numeric mode
Latin mode
layout rendering
CLI translation commands
Web translation UI
Microsoft 365 integration behavior
reverse translation
Braille Music
multi-language Braille framework
```

Their absence does not prevent Phase 4 closure.

## 12. Repository fixed-point requirements

Immediately before the closure commit, the branch must satisfy:

```text
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run build
pnpm run typecheck
pnpm run validate:runtime
pnpm run test
pnpm run clean
git diff --check
```

No generated runtime specification, `dist`, `node_modules`, or TypeScript build
artifact may remain tracked.

After the closure commit is pushed, the pull request must return to a green CI
state before merge.

## 13. Phase 5 handoff

The next roadmap phase is:

**Phase 5 — Core Translation Engine**

Phase 5 may rely on the following frozen Phase 4 contract:

```text
raw Unicode input
        |
        v
deterministic profile-driven preprocessing
        |
        v
preserved text + typed structural annotations
        |
        v
Phase 5 translation engine
```

Phase 5 must consume normalization output rather than re-implementing Unicode
preprocessing or embedding alternate normalization policy.

Phase 5 is where Braille rule execution begins.

## Closure statement

All six Phase 4 exit criteria have been satisfied subject only to the final
post-closure-commit CI fixed point.

No additional Unicode normalization feature is required for Phase 4.

**Phase 4 — Unicode Normalization: CLOSED**
