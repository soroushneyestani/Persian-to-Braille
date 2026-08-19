# Phase 15.3K4 — BSKDL Kurzschrift §4.9.4 Wortstamm Restriction

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Core rule

Word and word-stem contractions from §§4.3–4.6 may only be used when the letter sequence actually represents a word or word stem.

Different lexical meanings are allowed, but the contraction must still recognizably represent the actual stem.

## Stem-relative position

The target sequence must begin the relevant stem/component after the source-permitted handling of prefixes and compounds.

This is **not** a naive absolute character-position-zero rule.

## Evidence coverage

- Positive stem cases: `21`
- Negative stem cases: `8`
- Explicit invalid stem-position cases: `9`
- LETZT historical examples: `3`
- KOMM explicit policy: `1`
- Formal rules: `7`
- Validation cases: `48`

## Historical deviations

Historically established deviations are not to be categorically discarded.

`KOMM` is explicitly source-backed as **always allowed**.

`LETZT` remains contracted in `letztes`, `zuletzt`, and `verletzt`.

`GE` in `genau` is retained here as a historical rationale witness; this contract does not silently invent a generic runtime allow-rule from that discussion.

## Doubt modality

§4.9.3:

```text
In Zweifelsfällen wird nicht gekürzt.
```

§4.9.4:

```text
In Zweifelsfällen sollte nicht gekürzt werden.
```

These two source modalities remain distinct in the contract.

## Dependency state

`WORD_STEM_RESTRICTIONS` is **FORMALLY RESOLVED**.

`SECTION_4_9_APPLICATION_RESTRICTIONS` remains open only for §4.9.5.

## Promotion state

- §4.9.4 formal coverage: `COMPLETE`
- Runtime word/stem identity: `PENDING`
- Runtime morphology: `PENDING`
- Historical registry completion: `PENDING`
- Overall §4.9: `IN PROGRESS`
- Executable specification: `NOT READY`
- Implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3K5 — §4.9.5 Beachtung von Prä- und Suffixen**.
