# Phase 14.9c H4C — Full-Measure In-Accord Reconstruction

Status: **IMPLEMENTED**

H4C materializes the first executable polyphony construct from the frozen H4
BANA rule audit and H4B generic-MIDI profile.

The default notation-builder API remains fail-closed for independent overlap.
The MIDI-to-Braille bridge explicitly opts into
`GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1`.

Within each source track/channel and derived measure, same-onset notes remain a
chord. Independent onset-groups are partitioned deterministically into the
minimum available set of derived actions according to H4B. This is disclosed
with `INFERRED_MIDI_VOICE_PARTITION`; no original voice numbering or hand/staff
assignment is claimed.

When two or more actions are required in a complete measure, the notation
model emits one `full-measure-in-accord` construct inside the original source
part. Actions are ordered by the frozen generic-MIDI high-to-low rule and
joined with BANA full-measure in-accord BRF `<>`, without spaces.

Each action is completed to one full measure. Derived gap rests are explicitly
marked as transcriber-added and receive the BANA dot-5 prefix. The first
sounding note in an isolated derived action is octave-marked conservatively;
the first note in the measure following an in-accord is forced to carry an
octave mark.

H4C does not trim overlap, create fake newline source parts, infer original
voice numbers, or infer original hands. Polyphony in an incomplete final
measure remains fail-closed until part-measure in-accord support is added.

Real-world files are used only for local smoke validation by SHA-256. Their MIDI
bytes are never copied into the repository.

MusicXML remains outside Phase 14 and reserved for Phase 19.
