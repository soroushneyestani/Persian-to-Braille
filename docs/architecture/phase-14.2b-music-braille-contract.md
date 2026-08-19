# Phase 14.2b — Braille Music Contract Freeze

## Status

Architecture, MIDI interpretation, notation-truthfulness, and Word-only host
scope are frozen before implementation.

## Hard architecture boundary

```text
Local MIDI file
  -> Standard MIDI File parser
  -> normalized raw MIDI events
  -> neutral semantic music model
  -> deterministic notation policy
  -> Music Braille rule engine
  -> Unicode Braille
  -> public SDK boundary
  -> Word Desktop task pane
  -> current Word selection/cursor
```

Direct `MIDI event -> Braille cell` mapping is prohibited.

Microsoft365 must consume the Music Braille capability through a public SDK
boundary. It must not import private Music Braille engine internals.

A future MusicXML input adapter must terminate at the same neutral semantic
music model; adding MusicXML must not require a Braille encoder rewrite.

## Accepted MIDI subset

Phase 14 initially accepts:

- Standard MIDI File (MIDI 1.0 SMF) format **0** and format **1**;
- metrical PPQN/TPQN time division;
- `.mid` and `.midi` filenames;
- files whose content validates as an SMF header/track structure.

Phase 14 initially rejects:

- SMF format 2;
- SMPTE time-division files;
- MIDI 2.0 Clip Files / UMP containers;
- malformed or truncated SMF data;
- files with no usable note events.

The extension is a UI filter, not proof of file identity. Content validation is
mandatory.

## Neutral semantic model

The engine-facing model must preserve source evidence separately from derived
notation. At minimum it must be capable of representing:

- source format and PPQN;
- tracks and MIDI channels as source structure;
- note pitch number;
- note onset and release ticks;
- tempo meta events;
- time-signature meta events;
- key-signature meta events when present;
- deterministic source-part identity;
- derived simultaneous-note groups;
- derived measures/rests/rhythmic values;
- diagnostics describing every lossy or canonicalizing decision.

A MIDI track/channel is **not** automatically a printed notation voice.

## Rhythm policy

The first implementation uses deterministic quantization.

Supported rhythmic vocabulary:

- whole, half, quarter, eighth, sixteenth, thirty-second, and sixty-fourth
  values;
- single-dotted forms of those values when representable;
- simple triplet subdivision when representable.

Unsupported irregular tuplets remain outside the first implementation.

Quantization rules:

- normalize timing in quarter-note units from PPQN;
- snap onset and duration to the nearest supported rhythmic boundary;
- default maximum snap error is `1/16` of a quarter note;
- ties at equal distance select the longer rhythmic value;
- if a note/rest cannot be represented inside tolerance, return
  `UNQUANTIZABLE_RHYTHM`;
- every non-zero snap emits `RHYTHM_QUANTIZED`.

Rests are derived from quantized gaps. They are not claimed to be explicit MIDI
events.

## Pitch and accidental policy

MIDI note numbers preserve chromatic pitch but not original enharmonic spelling.

When an explicit key signature is present:

- prefer a spelling consistent with that key signature;
- minimize additional accidentals;
- deterministic ties prefer the accidental family of the key signature.

When no key signature is present:

- use a neutral C-major/A-minor spelling context;
- canonical chromatic spellings prefer sharps;
- emit `KEY_SIGNATURE_ABSENT`;
- emit `PITCH_SPELLING_CANONICALIZED` whenever the emitted spelling was
  reconstructed rather than explicitly recoverable.

The engine never claims to reconstruct the composer's original enharmonic
spelling.

Pitch bend that changes the sounding pitch of an active note is unsupported in
the first implementation and returns `UNSUPPORTED_PITCH_BEND`.

## Parts, chords, and polyphony

Source-part identity is deterministic:

```text
sourcePart = (trackIndex, MIDI channel)
```

Empty/non-note tracks do not become musical parts.

Notes with the same quantized onset in the same source part form a simultaneous
group/chord.

Multiple source parts are preserved as separate output parts.

The first implementation does **not** infer engraved voice numbers. If one
source part contains overlapping, independently-starting note groups that
require multiple notation voices, return `UNSUPPORTED_POLYPHONY` rather than
inventing voice structure.

Left/right hand assignment is not inferred.

## Missing metadata

Missing source metadata must be distinguished from internal calculation
defaults.

- **Tempo absent:** do not emit a source tempo marking. Internal timing may use
  the normal MIDI interpretation required for parsing; emit
  `TEMPO_METADATA_ABSENT`.
- **Time signature absent:** use `4/4` only as the internal measure-construction
  fallback; do not claim it was encoded by the source; emit
  `TIME_SIGNATURE_ABSENT`.
- **Key signature absent:** use the neutral pitch-spelling policy above; do not
  emit a claimed source key signature; emit `KEY_SIGNATURE_ABSENT`.

## MIDI truthfulness

Phase 14 may derive:

- pitch and onset/release timing;
- quantized duration;
- rests from quantized gaps;
- simultaneous-note groups;
- source parts from track/channel structure;
- tempo, time signature, and key signature when explicit metadata exists;
- contextual octave signs required by Music Braille.

Phase 14 must not claim exact recovery of:

- original enharmonic spelling;
- dynamics from velocity alone;
- articulation from note length alone;
- slurs or phrase marks;
- fingering;
- left/right hand;
- original engraved voice numbers;
- print layout or staff geometry;
- editorial notation absent from MIDI.

## UI contract

Braille Music is a Word-only section inside the existing task pane.

Required flow:

```text
Choose MIDI File
-> file metadata/status
-> Generate Braille
-> Braille Music preview
-> Insert into Word
```

The local picker accepts `.mid` / `.midi`; actual content is validated after
reading bytes.

The default mode is **Full supported notation**.

A **Custom** mode may expose feature controls, but standard-required information
must not be disableable when disabling it would make the Music Braille output
invalid or ambiguous.

Always-on semantic features include:

- notes and rhythmic values;
- required octave signs;
- required accidentals;
- rests needed by the derived notation;
- chord/simultaneous-group structure;
- measure structure required for the selected output.

Optional source-metadata presentation may include:

- tempo when explicitly present;
- time signature when explicitly present;
- key signature when explicitly present;
- source part/track labels.

Excel and PowerPoint must not display or execute the Music Braille workflow.

## Word insertion

Only a successful generated Music Braille preview can be inserted.

Insertion is at the current Word selection/cursor through the established
WordApi 1.1 Word adapter pattern.

The Music Braille host flow does not add a music mutation path for Excel or
PowerPoint.

The local file picker must be acceptance-tested in the actual supported
Windows Word Desktop WebView2 host before Phase 14 closure.

## Engine failure codes to preserve

- `INVALID_MIDI_FILE`
- `UNSUPPORTED_MIDI_FORMAT`
- `UNSUPPORTED_MIDI_TIME_DIVISION`
- `NO_MUSICAL_NOTES`
- `UNQUANTIZABLE_RHYTHM`
- `UNSUPPORTED_POLYPHONY`
- `UNSUPPORTED_PITCH_BEND`
- `UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT`

Word file-read and insertion failures remain host/integration failures rather
than Music Braille semantic failures.

## Engine diagnostic codes to preserve

- `RHYTHM_QUANTIZED`
- `PITCH_SPELLING_CANONICALIZED`
- `TEMPO_METADATA_ABSENT`
- `TIME_SIGNATURE_ABSENT`
- `KEY_SIGNATURE_ABSENT`
- `SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL`
- `NON_NOTATIONAL_MIDI_EVENT_OMITTED`
- `LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION`

## Non-goals

- MusicXML;
- PDF/OCR;
- audio transcription;
- Sibelius/Finale/MuseScore native formats;
- Excel/PowerPoint music workflows;
- Word on the web;
- Word on Mac;
- Marketplace publication work;
- guessing notation that MIDI does not preserve.
