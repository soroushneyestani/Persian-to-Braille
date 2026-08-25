# Phase 16.R — MusicXML Import Compatibility Reset v15

The SpaceShaman/MuseTrainer corpus is treated as a real MusicXML compatibility corpus rather than as a sequence of opaque errors.

The importer now freezes the mature cursor-oriented MusicXML model:

- voice/staff identity is structural and includes rests;
- backup/forward are cursor operations;
- rests are timed events and may host exact-onset directions;
- sounding pitch is not required for a voice to exist;
- pitch is consulted only when register ordering actually requires it;
- a sole rest-only voice in one hand is retained without a synthetic pitch;
- multiple same-hand voices remain fail-closed if one lacks register information;
- Braille rules remain owned by BANA/spec, not by the reference parser.
