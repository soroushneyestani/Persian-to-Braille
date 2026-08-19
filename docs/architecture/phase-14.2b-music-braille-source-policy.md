# Phase 14.2b — Music Braille Source Policy

## Status

Frozen source-precedence policy for Phase 14 Braille Music.

This repository stores normalized rule facts, conformance records, provenance,
and implementation contracts. It does **not** vendor or rewrite the complete
Music Braille Code publication.

## Normative and primary references

1. **International Council on English Braille (ICEB) — Braille Music**
   - Source: `https://iceb.org/music-html/`
   - Role: source-precedence authority for international Music Braille work.
   - ICEB endorses *Music Braille Code 2015* as the most up-to-date resource
     and the *New International Manual of Braille Music Notation (1996)* as a
     complementary international reference.

2. **Braille Authority of North America (BANA) — Music Braille Code, 2015**
   - Source: `https://brailleauthority.org/music-braille-code`
   - Role: primary Phase 14 rule/codebook source.
   - Repository policy: extract only the normalized facts needed by the
     implementation and retain provenance. Do not alter or republish the full
     codebook as project source.

3. **The MIDI Association — Standard MIDI Files**
   - Source: `https://midi.org/standard-midi-files`
   - Role: primary input-container/event-model authority for `.mid` / `.midi`.

4. **Microsoft Learn — Office Add-ins / Word**
   - WebView source:
     `https://learn.microsoft.com/en-us/office/dev/add-ins/concepts/browsers-used-by-office-web-add-ins`
   - Word insertion source:
     `https://learn.microsoft.com/en-us/office/dev/add-ins/tutorials/word-tutorial`
   - Role: Word Desktop host behavior and insertion boundary.

## Conflict policy

For Music Braille notation:

1. Music Braille Code 2015 controls the Phase 14 normalized rule set.
2. The 1996 International Manual is a companion source for international
   semantics and cross-checking.
3. If an apparent conflict affects emitted Braille, do not guess. Record an
   adjudication item and block the affected rule from normative materialization
   until evidence is resolved.

For MIDI:

1. Standard MIDI File semantics are taken from The MIDI Association.
2. Playback-oriented or DAW-specific conventions must not silently become
   notation semantics.
3. Information not preserved by MIDI must never be presented as exact source
   notation.

## Phase 14 scope

- Word Desktop on Windows only.
- Standard MIDI File input only: `.mid` and `.midi`.
- MusicXML is deferred.
- Excel, PowerPoint, Office on the web, and Mac are excluded from Phase 14.
