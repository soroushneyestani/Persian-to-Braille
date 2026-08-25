# Phase 16.R2B — Semantic Word Expressions

## Purpose

R2B consumes the Phase 16.R2A Music Terminology Resolver and projects safe
MusicXML `<words>` into the existing stateful Braille Music engine.

The terminology registry remains the semantic authority. R2B does not create
a second literary or Music Braille engine.

## Executable word-expression surface

- recognized `word-expression` terminology;
- recognized canonical crescendo / decrescendo / diminuendo text;
- basic-Latin free-text fallback explicitly classified by R2A as a BANA
  literary fallback candidate;
- global expressions before the first note of a backup/forward in-accord
  measure;
- expression-before-independent-dynamic ordering;
- following pitched-note octave context.

Canonical dynamic-word normalization:

- crescendo aliases → `cr.`
- decrescendo aliases → `decr.`
- diminuendo aliases → `dim.`

## Explicit fail-closed surface

- continuation fragments such as the split Beethoven `cre - ... scen ... do`;
- private-use score glyphs;
- recognized navigation/register instructions;
- unsupported literary punctuation / characters;
- unsafe terminal or cross-cursor placement.

Those cases remain semantic and visible; none is silently discarded.
