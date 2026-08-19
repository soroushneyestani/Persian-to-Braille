# Phase 15.3K5 — BSKDL Kurzschrift §4.9.5 Prä-/Suffix Boundary Restriction

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Core rule

Clearly recognizable prefixes and suffixes must not be joined to the word stem by a contraction.

## Double-consonant exception

The source explicitly excepts **Doppelkonsonanten** from this general boundary prohibition.

This does **not** imply that a contraction is mandatory whenever a double consonant is present; it only means the §4.9.5 prohibition is not automatically applied.

## Doubt cases

§4.9.5 does not define a new local doubt policy. It explicitly delegates doubt cases to **§4.1.2.4**.

The corresponding rule family already exists in the Phase 15.3C audit and must be reused.

## Evidence coverage

- Formal rules: `3`
- Direct lexical examples: `0`
- Policy validation cases: `4`
- §4.9.5 formal coverage: `COMPLETE`

## §4.9 source coverage

All five source subsections are now formally audited:

- `4.9.1` — Vollschrift inheritance
- `4.9.2` — Wortfugen
- `4.9.3` — Eigennamen
- `4.9.4` — Wortstämme
- `4.9.5` — Prä-/Suffixe

The source audit is therefore complete, but the canonical §4.9 dependency remains open until the consolidated K6 closure.

## Promotion state

- §4.9.5 formal coverage: `COMPLETE`
- All §4.9 source subsections: `AUDITED`
- Canonical §4.9 closure: `PENDING K6`
- Runtime affix segmentation: `PENDING`
- Runtime double-consonant handling: `PENDING`
- Executable specification: `NOT READY`
- Implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3K6 — Consolidated §4.9 Application Restrictions Closure**.
