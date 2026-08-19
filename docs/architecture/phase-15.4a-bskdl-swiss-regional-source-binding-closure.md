# Phase 15.4A — BSKDL Swiss/Regional Source & Binding Closure

Status: **SOURCE AND BINDING AUDIT COMPLETE — FORMAL RULE PROMOTION NOT STARTED**

## Normative source

- Authority: BSKDL
- Source: *Das System der deutschen Brailleschrift*
- Edition: `2., korrigierte Auflage 2021`
- PDF SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Section: `4.10 Abweichungen in der Schweiz`
- PDF page: `145`
- Printed page: `135`
- Canonical §4.10 SHA-256: `eafea077270a7a6caec77daec20f7a366a159b68301fbf483e19c31a17057e65`
- §4.11: `does not exist`
- Next structural boundary: `Anhang`

## Source scope

Section 4.10 contains exactly two prescriptive regional statements.

No examples, commentary, or additional Swiss subsections occur inside the frozen source span.

## Binding 1 — Eszett

Source statement:

> Das Eszett (ß) wird in der Schweiz nicht verwendet.

The existing Basisschrift mapping remains normative:

- print: `ß`
- Braille: `⠮`
- dots: `2346`
- source: §2.1

This mapping is inherited by Vollschrift and Kurzschrift.

Section 4.10 does **not** delete or change that mapping.

It also does **not** authorize automatic `ß → ss` input normalization.

The exact runtime behavior for an explicit `ß` input while Swiss regional configuration is active remains a later executable-policy decision.

## Binding 2 — Swiss Doppel-s forms

Source statement:

> Die zweiformigen Kürzungen für "groß" und "schließ" gelten auch für die Schreibweise mit Doppel-s.

This statement binds to the existing §4.4 two-cell contraction inventory:

`DE-KURZ-ZWEI-001`

### gross

Base form:

`groß`

Existing validation:

`DE-KURZ-ZWEI-MAP-050`

Braille:

`⠛⠮`

Dots:

`1245, 2346`

Swiss regional spelling:

`gross`

The same contraction applies.

### schliess

Base form:

`schließ`

Existing validation:

`DE-KURZ-ZWEI-MAP-117`

Braille:

`⠱⠮`

Dots:

`156, 2346`

Swiss regional spelling:

`schliess`

The same contraction applies.

No new Braille sequence is introduced.

## Explicit non-binding

`DE-KURZ-LG-021` from §4.1.2.6 is an SST double-s precedence rule.

It is **not** the Swiss Doppel-s rule from §4.10 and is not bound to this regional extension.

## Architecture conclusion

Swiss behavior is **not a fourth German text mode**.

The German modes remain:

- Basisschrift
- Vollschrift
- Kurzschrift

Regional behavior is an orthogonal configuration dimension.

The final regional/profile identifier is intentionally **not frozen** during Phase 15.4A.

In particular:

- `de-CH` is not yet frozen as a public identifier;
- the SDK/API shape is not yet frozen;
- no German Core implementation has started.

## Discovery caveat

The A3 discovery scanner used Unicode case folding.

Python case folding maps `ß` to `ss`.

Therefore raw `gross` / `schliess` discovery hit counts were not treated as literal evidence.

A3-2 corrected this by binding directly to exact canonical JSON objects and exact §4.4 meanings.

Normative impact: `NONE`.

## Open but non-blocking decisions

1. Runtime behavior for explicit `ß` input under Swiss regional configuration.
2. Final regional/profile identifier.
3. Public SDK/API representation of regional configuration.

These do not block closure of the source-and-binding audit.

## Closure metrics

- Source statements: `2`
- Source statements bound: `2`
- Binding decisions: `2`
- Formal rule IDs assigned: `0`
- Validation cases created: `0`
- Closed base artifacts modified: `0`
- Normative changes to closed base artifacts: `0`
- Implementation changes: `0`
- Blocking source issues: `0`
- Blocking binding issues: `0`
- Non-blocking open items: `3`

## Closure decision

Phase 15.4A is formally closed as a source-and-binding audit.

No Swiss formal rule has yet been promoted.

No implementation has started.

Next:

**Phase 15.4B — Formal Swiss/Regional Rule Taxonomy**
