# Phase 15.3H — BSKDL Kurzschrift Umlautungspunkt Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Section: `4.6 Der Umlautungspunkt`
- Section SHA-256: `acb0699ded198df4fea4b380ecc28f918b39d6c4e5176045ed814d47e0c13e80`

## Coverage

- Umlaut mappings: `33`
- Two-form derived: `26`
- Komma-derived: `5`
- VOLL/WAR special one-form derived: `2`
- Direct examples: `15`
- Formal rules: `7`
- Validation cases: `60`
- Six-dot validation: `PASS`
- Whitelist: `CLOSED`

## Transformation grammar

For `VOLL`, `WAR`, and the permitted §4.4 two-form contractions, Punkt 5 `⠐` is prefixed to the base contraction.

For permitted §4.5 Komma-Kürzungen, integral Punkt 2 `⠂` is replaced by Punkt 5 `⠐`.

Examples:

- `LASS ⠂⠇ → LÄSS ⠐⠇`
- `STAND ⠂⠾ → STÄND ⠐⠾`
- `FALL ⠋⠟ → FÄLL ⠐⠋⠟`
- `VOLL ⠟ → VÖLL ⠐⠟`
- `WAR ⠴ → WÄR ⠐⠴`

## Closed whitelist

The source defines exactly `33` Umlautkürzungen and explicitly prohibits other Umlautkürzungen.

## Punkt 5 disambiguation

Punkt 5 in `ATION`, `ATIV`, `ISMUS`, `ISTISCH`, and `ITÄT` is explicitly **not** an Umlautungspunkt.

## LASS / LÄSS / LÄSST

`LASS = ⠂⠇` from §4.5 and `LÄSS = ⠐⠇` from §4.6 now establish the normative umlaut transformation.

The complete derived word `LÄSST` is not listed as a §4.6 mapping; runtime generation of derived forms still requires morphological extension logic.

## Promotion state

- Formal §4.6 audit: `COMPLETE`
- Closed whitelist: `CAPTURED`
- Umlaut grammar: `CAPTURED`
- Runtime morphology: `PENDING`
- §4.9 restrictions: `PENDING`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3I — Kurzschrift Aufhebungspunkt Audit** for §4.7.
