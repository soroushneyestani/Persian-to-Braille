# Phase 16.5B - MusicXML H4D Terminal Part-Measure In-Accord

## Frozen scope

Phase 16.5B reuses the existing stateful H4D event:

`StatefulPartMeasureInAccordEvent`

No new Braille sign or second engine is introduced.

The implementation follows the frozen H4D initial scope:

- terminal incomplete measure only;
- single isolated section only;
- section start is the MusicXML measure start;
- section end is the maximum retained source-derived note/chord end;
- section end must be strictly before the full meter boundary;
- at least two explicit independent voice actions are required;
- complete polyphonic measures continue to use H4C;
- single-section H4D emits no measure-division sign;
- each action is padded only to the incomplete section end using the existing
  transcriber-added rest surface;
- first-note octave and accidental resets remain owned by the existing
  stateful H4D encoder.

## MusicXML constraints retained from Phase 16.5A

- explicit voice identity;
- one staff;
- active G/F clef;
- deterministic treble/bass ordering;
- crossed/register-overlapping voices fail closed;
- multi-staff polyphony fails closed.

## Still deferred

- nonterminal incomplete polyphony;
- multiple H4D sections inside one measure;
- measure-division serialization between multiple sections;
- nested in-accord;
- multi-staff H4D;
- repeat barline;
- key-transition/cancellation rules;
- generic irregular tuplets;
- slur, grace, articulation, ending, dynamics, direction words.
