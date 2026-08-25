# Phase 16.6 — MXL Container Security and Conformance Closure

## Purpose

Phase 16.6 closes the `.mxl` container layer that was introduced in Phase 16
Pack A. The MusicXML parser, neutral-model adapter, Braille Music engine, SDK
bridge, and Phase 16.5 semantics are not duplicated or replaced.

The MXL path remains:

```text
.mxl
  -> ZIP central directory
  -> META-INF/container.xml
  -> declared MusicXML rootfile
  -> existing MusicXML parser
  -> existing neutral model
  -> existing Braille Music engine
```

## Frozen limits

- maximum ZIP members: 256
- maximum declared uncompressed bytes per member: 32 MiB
- maximum total declared uncompressed bytes: 64 MiB
- maximum declared compression ratio: 200
- supported compression: stored (0), deflate (8)

## Phase 16.6 hardening

The closure additionally requires:

- single-disk ZIP only;
- ZIP64 fails closed;
- encrypted entries fail closed;
- unsafe absolute/traversal paths fail closed;
- duplicate normalized member names fail closed;
- local and central ZIP header method/name agreement;
- local/central size agreement when data-descriptor mode is not active;
- deflate output is read as a bounded stream;
- actual inflated byte count may never exceed the declared count or 32 MiB;
- actual inflated byte count must exactly equal the declared count.

The last two rules prevent a crafted ZIP from bypassing the central-directory
size/ratio checks by declaring a small uncompressed size but expanding to a much
larger stream.

## Corpus

The existing Beethoven MXL remains an external, untracked corpus artifact and is
executed by the Phase 16.6 closure tests.

## Non-goals

Phase 16.6 does not add another MusicXML parser and does not create another
Braille Music engine. It does not implement ZIP64, encryption, multi-disk ZIP,
or arbitrary archive extraction.
