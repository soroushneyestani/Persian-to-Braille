# Phase 15.1K — BSKDL Basisschrift Mathematical Signs & Insert Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Section: `2.10 Mathematische Zeichen und Einschübe`
- Section extraction SHA-256: `a3c8c43ec2a94b80ba983a557eca207713fe2430029dfde9bbdf8af282dce700`
- PDF pages: `83–91`

## Inline mathematical notation

German Textschrift provides an inline mathematical-sign
technique.

The first mathematical sign is normally announced with
point 4.

That announcement may remain active through subsequent
mathematical signs until a defined boundary occurs.

Typical boundaries include:

- blank,
- hyphen,
- slash,
- letter-case announcement,
- cancellation point.

The multiplication dot, rear exponents and rear indices
have special point-4 behavior.

## Mathematical symbol inventory

- Table rows: `35`
- Atomic symbol forms: `37`

The inventory includes arithmetic, relation, grouping,
index/exponent, arrow, set, comparison and logical signs.

## Exponent and index subgrammar

Upper and lower indices are not ordinary punctuation.

Rear and front positions have different announcement
rules.

Internal blanks inside exponent/index scope are replaced
by point 4 so that the scope is not accidentally ended.

## Full Mathematikschrift span

Complex or ambiguous expressions may switch to the
German Mathematikschrift system.

- Text to Math: `⠐⠂`
- Math to Text: `⠠⠄`

Inside that span, the inline Textschrift point-4
announcement mechanism no longer applies.

The full Mathematikschrift profile owns its internal notation.

Short Mathematikschrift expressions may alternatively be
bounded by two blanks before and after.

## Architectural conclusion

Inline mathematical notation and full Mathematikschrift are
two different modalities.

A German-language text span does not cease being German
merely because it contains mathematical signs.

Likewise, switching to Mathematikschrift is a modality/profile
transition rather than a language transition.

This distinction must remain explicit in the future
Braille profile and modality resolver.

## Extracted contract

- Rules: `20`
- Validation cases: `10`
- Symbol-table rows: `35`
- Atomic symbol forms: `37`

## Promotion policy

No mathematical translation behavior is executable in
Braille Hub Core yet.

The complete German Mathematikschrift rulebook remains a
separate normative dependency and must be audited before
a full Math Braille profile can claim conformance.

## Next

Phase 15.1L audits Computerbraille inserts from BSKDL
section `2.11`.
