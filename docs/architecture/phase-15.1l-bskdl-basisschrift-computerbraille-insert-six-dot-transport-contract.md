# Phase 15.1L — BSKDL Basisschrift Computerbraille Insert & Six-Dot Transport Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Section: `2.11 Einschübe in Computerbraille`
- Section extraction SHA-256: `319add3b4595c680aaf58926acfc35f8a7422b766e70b6ef9fb8c3f19270473c`
- PDF pages: `91–94`

## Primary Computerbraille model

Computerbraille is primarily an eight-dot Braille system.

One computer character is normally represented by one
eight-dot Braille cell.

The six-dot mechanism specified in section `2.11` is
therefore modeled as a transport serialization, not as a
replacement definition of native Computerbraille.

## Six-dot transport

When eight-dot insertion is unavailable:

- dots 1–6 are retained,
- dot 7 becomes a preceding dot-4 cell,
- dot 8 becomes a preceding dot-6 cell,
- dots 7+8 become a preceding dots-4-6 cell.

A source cell consisting only of dot 7, dot 8, or dots
7+8 creates a second blank cell in the six-dot transport
form.

That blank is an encoding artifact, not semantic
whitespace.

## Collision protection

Source cells consisting only of:

- dot 4,
- dot 6,
- dots 4+6

are doubled to prevent confusion with transport prefixes.

## Insert boundaries

Start-marker selection depends on the serialized Braille
form, not simply the number of source-language words.

- no serialized blank: `⠠⠨`
- at least one serialized blank: `⠨⠨`
- terminator: `⠠⠄`

An encoding-generated blank also counts when selecting
the start marker.

## Line breaking

A real content blank is the preferred break point.

If a suitable real blank is unavailable, the line may
end with `⠈`.

Two-cell transport signs are atomic and may not be split
across lines.

## Common mapping table

Expanded records: `102`

The source labels this as a list of **frequently used**
Computerbraille signs.

It is therefore explicitly **not** treated as a complete
eight-dot Computerbraille charset specification.

The `A–Z` and `a–z` ellipses in the source table are
expanded into individual auditable records.

## Architectural conclusion

Native eight-dot Computerbraille and the section `2.11`
six-dot representation are separate concerns:

1. Computerbraille defines the source modality.
2. Six-dot transport serializes that modality when the
   output environment cannot carry eight-dot cells.
3. German Textschrift supplies the outer span boundaries.
4. Layout rules must preserve atomic two-cell forms.

This distinction should migrate into the future modality
and transport resolver rather than being implemented as
ordinary German character mappings.

## Extracted contract

- Rules: `17`
- Validation cases: `14`
- Transport examples: `10`
- Expanded common mappings: `102`

## Promotion policy

No Computerbraille translation or transport behavior is
executable in Braille Hub Core yet.

The section `2.11` common table is not sufficient to
claim complete native eight-dot Computerbraille
conformance.

## Next

Phase 15.1M audits the table-cell separator from BSKDL
section `2.12`.
