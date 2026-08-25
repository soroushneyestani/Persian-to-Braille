# Phase 16 — MusicXML Final Closure

## Status

Phase 16 adds MusicXML and compressed MXL input to Braille Hub without creating
a second Braille Music engine.

The final architecture is:

```text
MIDI ------------------------------------\
                                         \
MusicXML -> Parser -> Semantic Adapter ----> Neutral Music Model
                                           -> existing Braille Music Engine
                                           -> Public SDK
                                           -> Microsoft 365

MXL -> hardened ZIP -> MusicXML ---------/
```

## Microsoft 365 product surface

Microsoft 365 intentionally exposes two separate Word-only tabs:

- **Music / MIDI** for `.mid` and `.midi`;
- **MusicXML** for `.musicxml`, `.xml`, and `.mxl`.

The MusicXML tab is not merged into the MIDI tab. MIDI source-line selection
belongs only to the MIDI workflow. Both tabs reuse the same existing Word Music
Braille insertion service after successful translation.

## Public SDK

The SDK surfaces are also intentionally independent:

- `createMusicBrailleMidiTranslator()`
- `createMusicBrailleMusicXmlTranslator()`

No unified `translateMusicFile()` façade is introduced.

## Implemented MusicXML semantics

The closed Phase 16 implementation includes:

- `score-partwise`, parts, measures, attributes, divisions, key, time and clef;
- notes, written pitch, rests, durations, dots, accidentals, voices and staves;
- chords, ties, exact rational onset/duration normalization;
- single-staff H4C full-measure polyphony;
- terminal single-section H4D part-measure polyphony;
- explicit complete 3:2 triplets;
- BANA-backed `staccato`, `staccatissimo`, `accent`, and `tenuto`;
- bounded short/long appoggiatura support;
- contained simple short slurs;
- forward/backward print repeats and first/second volta endings;
- independent `pp`, `p`, `mf`, `f`, and `ff` dynamics;
- measure-boundary key replacement;
- stored and deflated MXL containers with hardened rootfile loading.

## Explicit fail-closed/deferred semantics

Phase 16 does not guess semantics where the direct normative/source contract or
selection policy is incomplete. Deferred cases remain explicit failures,
including generic arbitrary tuplets, advanced slur topologies, 4+ appoggiatura
doubling, grace chords, third-or-higher endings, advanced repeat devices,
arbitrary direction words/hairpins, key cancellation to zero, mid-measure key
changes, multi-staff/crossed polyphony, multi-section H4D, and other constructs
listed in the machine-readable closure contract.

## MXL security closure

The MXL loader supports stored and deflated members while enforcing:

- maximum 256 members;
- maximum 32 MiB declared/actual uncompressed size per member;
- maximum 64 MiB total declared uncompressed size;
- maximum declared compression ratio 200;
- bounded streamed inflate;
- unsafe-path and duplicate-normalized-member rejection;
- encrypted member rejection;
- ZIP64/multi-disk fail-closed behavior;
- no archive extraction to disk.

## Regression integration

Phase 16.9 promotes every Phase 16 MusicXML/MXL test into the default
`@persian-braille/music` package test command. A normal package regression run
therefore covers both the pre-existing MIDI/Braille Music tests and all Phase 16
MusicXML/MXL tests, including the real external Beethoven MXL corpus when the
closure gate is executed.

## Closure invariants

Phase 16 can close only when:

- Core, Music, SDK and Microsoft 365 builds/typechecks pass;
- the default Music test suite includes and passes all Phase 16 tests;
- SDK and Microsoft 365 full regressions pass with zero skipped tests;
- Beethoven executes through both the hardened MXL loader and bridge path;
- package boundaries, specification determinism and runtime-spec validation pass;
- `git diff --check` passes;
- there are no staged changes;
- the worktree contains only the known Phase 16 changes plus the preserved
  external untracked corpus.

No Git staging, commit, push, or clean operation is part of the closure gate.

## External corpus path contract

The Beethoven MXL corpus remains intentionally untracked. Its tests resolve the
corpus from `import.meta.url`, not `process.cwd()`, so package-local and repo-root
test execution are equivalent. In a clean checkout where the external corpus is
absent, only the external-corpus assertion may skip; the Phase 16.9 closure gate
requires the corpus to be present and requires zero skipped Music tests.
