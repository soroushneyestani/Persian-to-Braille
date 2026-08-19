# Phase 15.3I — BSKDL Kurzschrift Aufhebungspunkt Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Section: `4.7 Der Aufhebungspunkt`
- Section SHA-256: `5946ec525e87fdcb3f25408865e079f1e614d369fa62d143087939d7fc9f0266`

## Core rule

Punkt 6 `⠠` is the **Aufhebungspunkt**.

When a sign or sign sequence must retain its original meaning, the marker is prefixed to cancel the additional Kurzschrift meaning and restore the Basis- or Vollschrift meaning.

## Coverage

- Positive direct source examples: `8`
- Positive example Punkt-6 uses: `10`
- Accent exception examples: `1`
- In-word sign categories: `9`
- Arrow policy: `CAPTURED`
- Formal rules: `5`
- Validation cases: `24`
- Six-dot validation: `PASS`

## Direct examples

| Print | Braille | Punkt 6 count |
|---|---|---:|
| Center | ⠠⠉⠉⠞⠻ | 1 |
| Mocca | ⠍⠕⠠⠉⠠⠉⠁ | 2 |
| Quelle | ⠠⠟⠥⠑⠟⠑ | 1 |
| Xerxes | ⠠⠭⠻⠠⠭⠿ | 2 |
| Das Ei | ⠙ ⠠⠩ | 1 |
| Die Halbinsel Au (im Zürichsee) | ⠬ ⠓⠒⠃⠔⠎⠽ ⠠⠡ | 1 |
| Che Guevara | ⠠⠹⠑ ⠛⠥⠑⠧⠴⠁ | 1 |
| he (Ausruf) | ⠠⠓⠑ | 1 |

## In-word signs

§4.7 requires the Aufhebungspunkt before the source-listed punctuation/sign categories when they occur inside a word.

| Category | Source term |
|---|---|
| COMMA | Komma |
| SEMICOLON | Semikolon |
| COLON | Doppelpunkt |
| QUESTION_MARK | Fragezeichen |
| EXCLAMATION_MARK | Ausrufezeichen |
| ROUND_BRACKETS | runde Klammern |
| SQUARE_BRACKETS | eckige Klammern |
| QUOTATION_MARKS | Anführungszeichen |
| CHECK_MARKS | Häkchen |

The source additionally requires the Aufhebungspunkt **before arrows**.

## Accent exception

The Aufhebungspunkt is omitted before letters written with an accent.

Direct source example: `Dubček → ⠙⠥⠃⠈⠉⠑⠅`.

## §4.1 interaction

§4.7 supplies the general escape mechanism for restoring literal Basis-/Vollschrift meaning. Specific contexts such as the literal-letter rules remain governed by their originating §4.1 rules.

Therefore §4.7 must not itself be treated as an enumeration of `c/q/x/y/ß`.

## Promotion state

- Formal §4.7 audit: `COMPLETE`
- General escape mechanism: `CAPTURED`
- In-word sign policy: `CAPTURED`
- Accent exception: `CAPTURED`
- Runtime sign classification: `PENDING`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3J — Kurzschrift Basis-/Vollschrift Insert Audit** for §4.8.
