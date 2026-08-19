# Phase 15.1 — German Braille Standards Audit

Status: **IN PROGRESS**

## Normative source

**Brailleschriftkomitee der deutschsprachigen Länder (BSKDL)**

- Title: `Das System der deutschen Brailleschrift`
- Edition: `2., korrigierte Auflage 2021`
- Valid since: `2018-01-01`
- Upstream: `https://www.bskdl.org/download/textschrift/bs-2021-07-17-UBP.pdf`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Retrieved: `2026-08-19`
- Local source size: `1657986` bytes

The upstream rulebook is referenced and hashed for auditability.
The PDF itself is not vendored into this public repository.

## Phase 15 text-system scope

### Basisschrift

Six-dot German Braille without contractions.

### Vollschrift

Inherits Basisschrift and adds the eight canonical
sound-group contractions:

- AU
- EU
- EI
- CH
- SCH
- ST
- ÄU
- IE

### Kurzschrift

Inherits Basis- and Vollschrift.

The official rulebook extends the eight Vollschrift
sound-group contractions with 31 additional signs,
for 39 sound-group contractions in total.

Kurzschrift also contains additional contraction
classes and context-sensitive application rules.
It must therefore not be implemented as a simple
dictionary replacement layer.

## Regional scope

The BSKDL system covers the German-speaking region.

Swiss deviations are explicitly defined by the
standard and must remain representable by the
future profile architecture.

No final German profile identifier is frozen in
Phase 15.1.

## Explicitly separate systems

The following are not treated as German text-profile
aliases:

- Stenography
- 8-dot Computerbraille / Eurobraille
- German mathematical Braille
- Music Braille

Cross-system spans may still need explicit handling.

## Implementation policy

The BSKDL rulebook is the normative authority for
Phase 15.

Third-party translators and tables may later be
used for:

- differential testing
- implementation comparison
- regression discovery

They are not normative sources.

No German translation rule is promoted to executable
Core behavior during the standards-audit step.

## Next audit gates

1. Basisschrift rule-family inventory
2. Vollschrift exact contraction/rule inventory
3. Kurzschrift contraction taxonomy
4. Swiss deviation inventory
5. foreign-language span policy
6. capitalization and emphasis policy
7. numeric and punctuation policy
8. comparison against existing implementations
9. profile architecture recommendation
10. Phase 15.1 closure
