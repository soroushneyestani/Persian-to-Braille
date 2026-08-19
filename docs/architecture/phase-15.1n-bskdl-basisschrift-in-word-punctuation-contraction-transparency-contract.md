# Phase 15.1N — BSKDL Basisschrift In-Word Punctuation & Contraction-Transparency Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Section: `2.13 Satzzeichen in Wörtern`
- Section extraction SHA-256: `1785b5cb589888c2b006d9daa420cc99e94f519cde8a9987e20731f9f89887be`
- PDF pages: `95–99`

## General rule

Except for the sentence period, covered punctuation and
arrows occurring inside words receive a preceding
cancellation point.

This rule applies uniformly to:

- Basisschrift,
- Vollschrift,
- Kurzschrift.

## Covered classes

The source explicitly includes:

- comma,
- semicolon,
- colon,
- question mark,
- exclamation mark,
- brackets,
- quotation marks,
- arrows.

## Position matters

Section `2.13` governs signs occurring **inside words**.

The normative examples demonstrate that a closing sign
at the lexical word edge is not treated identically to a
closing sign followed by further lexical material.

Examples:

- `Hundert(e)`
- `Student(inn)en`
- `Hundert[e]`
- `Student[inn]en`

## Special forms

Cancellation point:

`⠠`

Square bracket inside a word:

`⠠⠠⠶`

Ordinary double quotation marks inside words:

- opening: `⠠⠦`
- closing: `⠠⠴`

Single or half quotation marks inside words:

- opening: `⠠⠠⠦`
- closing: `⠠⠠⠴`

## Contraction transparency

Covered punctuation inside words has no influence on
possible contractions.

For contraction analysis it is treated as though it does
not exist.

The punctuation itself is nevertheless preserved in the
serialized Braille output.

This means lexical analysis and punctuation serialization
must remain distinct operations.

## Cross-profile behavior

The punctuation semantics remain stable across
Basisschrift, Vollschrift and Kurzschrift.

The surrounding lexical Braille may differ because the
active profile applies its own contraction rules.

## Extracted contract

- Rules: `11`
- Normative source examples: `10`
- Validation cases: `9`
- Six-dot validation: `PASS`

## Chapter 2 status

Normative rule-family coverage now exists for BSKDL
Basisschrift sections `2.1` through `2.13`.

This does **not** yet mean Basisschrift conformance has
been promoted.

A closure audit is still required.

## Promotion policy

No section `2.13` behavior is executable in Braille Hub
Core yet.

## Next

Run the Phase 15.1 Basisschrift closure audit before any
implementation or commit.

## Pre-closure precision consolidation

The word-internal position model is retained as a
normative-example derivation. It is explicitly
distinguished from a rule stated verbatim in prose.
