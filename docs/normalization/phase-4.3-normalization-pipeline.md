# Phase 4.3 — Deterministic Normalization Pipeline

## Status

**Phase 4.3: IMPLEMENTED**

This deliverable implements deterministic, profile-driven Unicode
preprocessing in `@persian-braille/core`.

It does not implement Braille translation.

## Implementation boundary

The default preprocessor is created with:

```text
createUnicodePreprocessor()
```

and consumes the canonical runtime specification bundle established in
Phase 3.

No independent table of Persian Braille mappings is introduced in TypeScript.

## Current policy execution

The current canonical profile requires:

```text
unicodeForm = none
unknownFormatControls = error
```

The implementation therefore:

- performs no NFC/NFD/NFKC/NFKD transformation;
- performs no Persian/Arabic orthographic remapping;
- preserves `inputText` byte-for-code-unit as `outputText`;
- reports `changed = false`;
- recognizes admitted Unicode format controls from canonical rule records;
- returns a typed failure for an unrecognized Unicode format control.

## Fail-closed policy evolution

The implementation deliberately supports only the currently admitted
normalization policy.

If a future canonical profile changes `unicodeForm` away from `none`, or
changes `unknownFormatControls` away from `error`, construction fails closed
until a later implementation explicitly supports the new policy.

This prevents a specification change from silently activating behavior that
was never implemented or reviewed.

## Specification-driven format-control recognition

Recognized format controls are derived from admitted runtime rules whose input
is exactly one Unicode format control.

The implementation does not hard-code the current list of:

```text
U+200B
U+200C
U+2060
U+FEFF
```

Those code points are recognized because the canonical runtime bundle contains
rules for them.

This also preserves the intentional cross-layer ZWNJ model. U+200C currently
produces one annotation containing both admitted rule references where
applicable, including their structural tokens and lifecycle states.

Recognition of a candidate rule is not normative promotion.

## Unknown format-control behavior

Any Unicode scalar whose General Category is `Cf` and which has no admitted
canonical rule is rejected with:

```text
code = UNKNOWN_FORMAT_CONTROL
codePoint
character
codePointIndex
utf16Index
policy
```

The operation returns a typed failure rather than silently deleting, rewriting,
or accepting the control.

## Position accounting

The implementation walks JavaScript strings by Unicode code point and tracks
both:

```text
codePointIndex
utf16Index
```

This keeps diagnostics correct even when supplementary-plane characters occur
before a format control.

## Text preservation

Successful preprocessing currently guarantees:

```text
outputText === inputText
changed === false
```

This is an implementation consequence of the frozen Phase 4.1 baseline, not a
claim that all future profiles must use `unicodeForm = none`.

## Explicitly outside this implementation

Phase 4.3 does not execute:

- Braille cell mappings;
- structural tokens;
- layout rendering;
- context matching;
- precedence;
- modes;
- translation;
- reverse translation.

The annotations produced here are metadata for later engine stages.

## Handoff

The next deliverable is:

**Phase 4.4 — Normalization Conformance Suite**

That suite must verify normal input preservation, all admitted format controls,
ZWNJ cross-layer annotations, unknown-format-control rejection, supplementary
plane index accounting, determinism, and idempotence-compatible behavior.
