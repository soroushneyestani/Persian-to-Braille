# Phase 15.3J — BSKDL Kurzschrift Basis-/Vollschrift Insert Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Section: `4.8 Einschübe in Basis- oder Vollschrift`
- Section SHA-256: `1845c29a2f93609281f43cb7d34768401ff8f08f4f32babaa452729a381645ee`

## Control grammar

Single-word insert:

```text
⠠⠄ + WORD
```

Multi-word insert:

```text
⠤⠄ + WORD ... WORD + ⠠⠄
```

`⠿` in the source notation is a **placeholder for one word**, not part of either control sequence.

## Control sequences

| Context | Sequence | Dots |
|---|---|---|
| Single-word announcement | ⠠⠄ | 6 + 3 |
| Multi-word announcement | ⠤⠄ | 36 + 3 |
| Multi-word deannouncement | ⠠⠄ | 6 + 3 |

## Source examples

- One-word Basisschrift insert: `Boccaccio`
- Multi-word Basisschrift insert: `Au clair de la lune`
- Multi-word Vollschrift insert: `Dest war Reinmar dv riuwest mich`

## Optional announcement

If confusion is excluded, the source permits omission of the **Ankündigung**.

No general rule allowing omission of the Abkündigung is inferred from this sentence.

## Basisschrift inside Vollschrift

When Basisschrift is used inside Vollschrift, it need not be announced or deannounced.

## §4.7 interaction

`⠠` alone is the §4.7 Aufhebungspunkt, whereas `⠠⠄` is a §4.8 insert control sequence.

The implementation must therefore identify the longer valid control sequence before interpreting the leading `⠠` independently.

## Phase 15.1 dependency

`BSKDL_4_8`: **FORMALLY RESOLVED** by this source audit.

The historical Phase 15.1 closure artifact is not rewritten; the canonical resolved state will be carried into the later Phase 15.3 closure.

## Coverage

- Direct source examples: `3`
- Formal rules: `6`
- Validation cases: `9`
- Six-dot validation: `PASS`
- §4.8 formal coverage: `COMPLETE`

## Promotion state

- Formal §4.8 audit: `COMPLETE`
- `BSKDL_4_8`: `FORMALLY_RESOLVED`
- Control grammar: `CAPTURED`
- Ambiguity decision policy: `PENDING`
- Runtime tokenization: `PENDING`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3K — Kurzschrift Application Restrictions Audit** for §4.9.
