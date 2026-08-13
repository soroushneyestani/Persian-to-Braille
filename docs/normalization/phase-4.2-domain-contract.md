# Phase 4.2 — Normalization Domain Contract

## Status

**Phase 4.2: DOMAIN CONTRACT DEFINED**

This deliverable defines the Core TypeScript contract for deterministic,
profile-driven Unicode preprocessing.

It does not implement normalization behavior.

## Architectural boundary

Phase 4 normalization sits between raw Unicode input and later translation
rule execution:

```text
raw Unicode input
        |
        v
Unicode preprocessing / normalization contract
        |
        v
preserved text + structural annotations
        |
        v
future translation engine
```

The contract does not own Braille cells, mode execution, context matching, or
layout rendering.

## Canonical authority

The contract is constrained by `spec/fa-ir/`.

For the current `fa-ir-g1` baseline:

```text
unicodeForm = none
unknownFormatControls = error
canonicalInput rewrites = 0
```

The TypeScript types do not promote or modify any specification lifecycle
state.

## Policy snapshot

Every normalization result carries a `NormalizationPolicySnapshot` containing:

```text
profileId
profileVersion
unicodeForm
unknownFormatControls
```

This makes preprocessing results attributable to the exact profile policy that
produced them.

## Success contract

A successful preprocessing operation returns:

```text
ok
inputText
outputText
changed
policy
annotations
```

`changed` describes text mutation only.

Under the current Phase 4.1 baseline, the future implementation is expected to
return unchanged text because no global Unicode normalization form or
canonical scalar rewrite is admitted.

That expectation is enforced later by implementation/conformance tests; this
domain contract itself performs no transformation.

## Unicode position model

Format-control diagnostics and annotations carry both:

```text
codePointIndex
utf16Index
```

JavaScript string offsets are UTF-16 code-unit offsets, while specification
reasoning is based on Unicode scalar values/code points. Recording both avoids
ambiguous positions for supplementary-plane characters.

## Recognized format controls

A recognized format control is represented by:

```text
codePoint
character
location
ruleIds
structuralTokens
ruleStatuses
```

`ruleIds` is intentionally plural.

The current specification represents ZWNJ (`U+200C`) in both layout and
normalization layers, and the domain model must preserve that cross-layer
fact rather than collapse it.

Lifecycle states are also retained so candidate rules are not silently treated
as normative.

## Unknown format-control failure

The profile policy currently requires:

```text
unknownFormatControls = error
```

The domain contract represents this as a typed failure:

```text
code = UNKNOWN_FORMAT_CONTROL
codePoint
character
location
policy
```

Phase 4 uses an explicit outcome union rather than requiring callers to infer
failure from mutated text or untyped exceptions.

## Unicode normalization forms

The domain model recognizes the Unicode forms:

```text
none
NFC
NFD
NFKC
NFKD
```

Their presence in the type model is not authorization to apply them.

The active profile remains authoritative. For `fa-ir-g1` the permitted runtime
policy is currently `none`.

## Public implementation boundary

The contract exposes a `UnicodePreprocessor` interface:

```text
normalize(inputText) -> NormalizationOutcome
```

Phase 4.3 will provide the deterministic implementation.

## Explicitly not implemented here

This deliverable does not implement:

- NFC/NFD/NFKC/NFKD transformation;
- Persian/Arabic orthographic remapping;
- ZWNJ deletion;
- Braille cell generation;
- structural-token execution;
- context/precedence matching;
- mode handling;
- layout rendering;
- translation.

## Handoff

The next deliverable is:

**Phase 4.3 — Deterministic Normalization Pipeline**

It must implement this contract from the canonical runtime specification
bundle and preserve all Phase 4.1 constraints.
