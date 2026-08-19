# Phase 15.1D — BSKDL Basisschrift Normative Symbol Foundation

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`

## Covered sections

- `2.1` Das Alphabet
- `2.2.1` Einformige Zeichen
- `2.2.2` Mehrformige Zeichen
- `2.2.3` Brailleschrifttechnische Hilfs- und Zusatzzeichen

## Extracted inventory

- Alphabet signs: `30`
- Single-form signs: `12`
- Multi-form signs: `32`
- Technical/control signs: `21`

## Architecture

The alphabet cells themselves do not encode case.

Case announcement and state behavior remains deferred to
BSKDL section `2.6`.

Multi-cell signs and technical signs are retained as sequences,
not flattened into single abstract characters.

Several signs have contextual or multi-purpose semantics.
Those meanings must remain explicit in the future German
profile state machine.

Unicode Braille is used here as an auditable representation.
Executable Core behavior has **not** started.

## Next

Phase 15.1E extracts the numeric notation and numeric-state
rules from sections `2.3` and `2.4`.
