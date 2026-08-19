# Phase 15.3K3 — BSKDL Kurzschrift §4.9.3 Eigennamen Restriction

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Rule families

### Lautgruppenkürzungen

Vowel pronunciation must be respected. The direct source example `Pierre` uses `er`, not `ie`.

### Einformige Wortkürzungen and Komma-Kürzungen

They may be used standalone, in compounds, and in umlauted form only when the original meaning is **obviously preserved**.

### Zweiformige and §4.2 prefix/suffix contractions

They are forbidden by default in proper names.

A narrow exception exists for political or geographic terms when the meaning of the relevant word or word-part is **unequivocally preserved**.

### Doubt fallback

In doubtful cases: **do not contract**.

## Semantic threshold precision

`offensichtlich erhalten` and `eindeutig erhalten` are preserved as distinct source conditions.

## Evidence coverage

- Semantic source cases: `7`
- Direct application outputs: `7`
- Direct resolution outputs: `6`
- Formal rules: `5`
- Validation cases: `25`
- Six-dot validation: `PASS`

## Dependency state

The `PROPER_NAME_RESTRICTIONS` component of `SECTION_4_9_APPLICATION_RESTRICTIONS` is **FORMALLY RESOLVED**.

The overall §4.9 dependency remains open for §§4.9.4–4.9.5.

## Promotion state

- §4.9.3 formal coverage: `COMPLETE`
- Runtime proper-name detection: `PENDING`
- Runtime pronunciation evidence: `PENDING`
- Runtime semantic preservation: `PENDING`
- Executable specification: `NOT READY`
- Implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3K4 — §4.9.4 Beachtung von Wortstämmen**.
