# Phase 16.5 — Unified Advanced Musical Structures Closure

## Closure criterion

Phase 16.5 is considered complete when every advanced MusicXML semantic in the
frozen scope is either:

1. represented through an existing, source-backed Braille Music engine surface; or
2. explicitly classified and fail-closed.

Silent semantic discard is not permitted.

## Authority and provenance

Primary normative source:

- Braille Authority of North America, *Music Braille Code, 2015*
- official PDF SHA-256:
  `34d769731f69ed7586f96b221ca4e22d3e009d36e8024008dfe0fc935348595c`

The source corpus remains external provenance material and is not added to Git.

## Executable Phase 16.5 profile

### Polyphony

- H4C full-measure single-staff non-crossing in-accord: supported.
- H4D terminal incomplete, single-section in-accord: supported.
- multi-staff, crossed voices, nested in-accord, and multi-section H4D: deferred.

### Tuplets

- explicit complete 3:2 triplet: supported through the existing triplet surface.
- `_3'`, `_2'`, and `_10'`: known authoritative signs but not auto-selected.
- generic `_N'`: not proven and remains fail-closed.

### Articulation

The already-validated Phase 16.5D3 subset is retained:

- `staccato` → `8`
- `staccatissimo` → `,8`
- `accent` → `.8`
- `tenuto` → `_8`

The initial executable profile accepts one supported articulation per event.

### Appoggiaturas / grace notes

BANA Table 16 and section 16.2 are used:

- short appoggiatura → `5`
- long appoggiatura → `"5`
- appoggiatura duration is not added to the rhythmic sum of the measure;
- the appoggiatura sign precedes the small note, accidental, and octave mark.

MusicXML selection:

- one slashed grace note → short;
- one unslashed grace note → long;
- a run of two or three successive grace notes → short;
- four or more successive grace notes require BANA doubling and remain fail-closed;
- grace chords and advanced grace combinations remain fail-closed.

### Slurs

BANA section 13.2 freezes the simple short slur `c` for phrases of two, three,
or four events. The sign follows every event except the last; a rest inside the
printed slur phrase is treated as an event.

The executable MusicXML subset is limited to a contained, same-measure,
non-overlapping short slur with two through four source event groups.

Deferred:

- more than four events, because BANA permits doubled or bracket long slurs and
  the bridge does not make a transcriber choice;
- nested/layered/convergent slurs;
- cross-measure and unattached slurs;
- part-to-part slurs;
- slur/tie redundancy policy;
- slurs involving appoggiaturas.

### Print repeats and voltas

BANA Table 17 / section 17.1:

- initial print repeat → `<7`
- terminal print repeat → `<2`
- first ending → `#1`
- second ending → `#2`

Only simple two-pass print repeats and first/second volta starts are executable.
The printed volta bracket itself is not emitted. Higher/combined endings,
advanced repeat counts, aperiodic repeats, Braille optimization repeats, D.C.,
and D.S. remain deferred.

### Dynamics and words

Frozen independent dynamic subset:

- `pp` → `>pp`
- `p` → `>p`
- `mf` → `>mf`
- `f` → `>f`
- `ff` → `>ff`

Independent dynamics are emitted as word-sign expressions before the affected
note. The existing stateful encoder forces an octave mark on the next note and
adds the required dot-3 separator when the following Braille cell contains
dot 1, 2, or 3.

General expression words require literary-code transcription and remain
fail-closed. Hairpins/wedges and unknown MusicXML direction-types are preserved
and fail explicitly rather than being silently discarded. Tempo remains
preserved as a diagnostic and is not synthesized.

### Key transitions

BANA confirms that a change of key is placed where it occurs and that the first
note after a key signature requires an octave mark.

Executable subset:

- a key change represented at a MusicXML measure boundary;
- nonzero replacement signatures.

Deferred:

- transition from a nonzero signature to zero, because the cancellation
  representation is not frozen by the current project contract;
- mid-measure key changes.

## Architecture invariant

MusicXML continues to use the same stateful Braille Music engine as MIDI:

`MusicXML → semantic adapter → existing stateful Braille Music engine`

No second Braille Music engine is introduced.

## Closure validation

The unified master gate must pass:

- music package build;
- each new Phase 16.5 feature test group independently;
- the complete accumulated Phase 16 MusicXML targeted suite;
- real Beethoven MXL corpus execution with zero skipped targeted tests;
- the existing 97-test MIDI/Music Braille regression suite;
- package typecheck;
- `git diff --check`;
- Git safety check with no stage/commit/push/clean.
