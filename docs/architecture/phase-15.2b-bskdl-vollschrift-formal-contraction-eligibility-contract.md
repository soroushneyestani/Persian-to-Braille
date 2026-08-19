# Phase 15.2B — BSKDL Vollschrift Formal Contraction Eligibility Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Chapter: `3 Die Vollschrift`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter SHA-256: `a852e5acdf41910feb3cb1e91dceb9a7fbb9cecbb0a6db2766eed4d4c0df9e2a`
- PDF pages: `99–103`

## Inheritance

Vollschrift retains all Basisschrift signs and rules.

It adds eight Lautgruppenkürzungen and eligibility
rules controlling when those contractions may be used.

## Contractions

- `au` → ⠡
- `eu` → ⠣
- `ei` → ⠩
- `ch` → ⠹
- `sch` → ⠱
- `st` → ⠾
- `äu` → ⠌
- `ie` → ⠬

## Formal eligibility constraints

A candidate contraction may be rejected because it:

- crosses a compound-word seam,
- crosses a recognizable prefix/suffix boundary,
- crosses a spoken-syllable boundary,
- does not satisfy pronunciation requirements,
- violates the special `sch` rule,
- violates a special `st` rule.

`st` has a normative exception to the general
spoken-syllable-boundary restriction, but it also has
its own explicit prohibited contexts.

## Pronunciation

Orthographic matching alone is insufficient.

Vowel groups depend on whether the letters represent
one sound or diphthong.

The `sch` contraction likewise requires pronunciation
as one sound.

Foreign pronunciation may still permit contraction
when explicitly supported by the normative source.

## Standalone contractions

The sound group may itself form an independent word.

Source examples include:

- `Au`
- `Ei`

## Implementation boundary

The source defines eligibility constraints.

The exact ordering of software checks is an
architectural design decision, not a claimed normative
ordering.

## Coverage

- Formal rules: `14`
- Validation cases: `28`
- Contractions: `8`
- Six-dot validation: `PASS`

## Open dependencies

The following remain open:

- Kurzschrift double-s priority,
- software pronunciation-resolution policy,
- morphological segmentation policy.

These dependencies are preserved explicitly rather
than silently inferred.

## Promotion

No Vollschrift rule is executable yet.

No German Core, SDK or Microsoft 365 implementation
starts in this phase.

## Next

Proceed to Phase 15.2C — Morphological Boundary Contract.
