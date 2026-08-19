# Phase 14 — Public Install Distribution Update

## Purpose

Phase 14 is not considered publicly deliverable until the existing manual
preview installation channel produces the same Braille Music build that passed
Windows Word live acceptance.

The public installation page remains:

```text
https://soroushneyestani.github.io/Persian-to-Braille/install.html
```

The stable hosted production manifest remains:

```text
https://soroushneyestani.github.io/Persian-to-Braille/install/manifest.xml
```

## Phase 14 public capability

The public text surface is labeled **Persian / English**. The current
`fa-ir-g1` profile already carries the Latin-span machinery for ordinary
uncontracted six-dot English/Latin text. This is intentionally documented as
text support inside the current profile, not as a separate contracted UEB /
English Grade-2 implementation.

The install page also documents the live-verified Word Desktop / Windows
Braille Music workflow:

```text
Choose MIDI (.mid/.midi)
  -> choose exactly one source line
  -> source line = Track + Channel
  -> Preview Music Braille
  -> Unicode Music Braille + BRF
  -> Insert Music Braille at the current Word caret
```

No notes inside the selected source line are automatically filtered by
instrument, percussion, program, or channel identity.

The public page also states the fail-closed behavior for source lines that are
not yet representable, and that whole-song multi-line / All Lines conversion
is not exposed in the current preview.

## Deployment wiring

The GitHub Pages workflow includes:

- `phase14-braille-music` as a push trigger branch;
- `packages/music/**` as a path trigger.

Therefore the Phase 14 commit can build and deploy the current Microsoft 365
site payload instead of leaving the public install channel on the older
pre-Music build.

## Distribution classification

This remains **manual sideload preview distribution**. It does not claim
Microsoft Marketplace publication.

Marketplace publication remains a later release/publisher workflow.

## Gate

After local production build + distribution tests + validator:

`READY_TO_COMMIT_AND_DEPLOY_PHASE14_BRAILLE_MUSIC`

## Final presentation screenshot

The install page publishes the final Windows Word presentation screenshot:

```text
install/screenshots/phase14-braille-music-word-mozart.png
```

The image is intentionally a real product screen rather than a mockup. It
shows the final task-pane navigation, a real Mozart MIDI file, Track + Channel
source-line selection, Unicode Music Braille preview, and multiple independent
Braille lines inserted into Microsoft Word.

The generated GitHub Pages payload must contain a byte-identical copy of the
reviewed PNG.
