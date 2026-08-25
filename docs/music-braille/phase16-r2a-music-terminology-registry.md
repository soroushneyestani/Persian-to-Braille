# Phase 16.R2A — Music Terminology Registry

R2A introduces a specification-owned semantic terminology registry before
Braille emission.

Initial registry: **248 canonical entries** plus aliases.

Examples:

- `Allegro` → tempo / fast.
- `Adagio sostenuto` → composite tempo-expression.
- `con brio` → expression / spirited.
- `senza sordini` → technique / mute-off.
- `cresc.` → canonical alias of crescendo.
- `D.C. al Fine` → navigation / structural-fail-closed.
- `8va` / `loco` → register instruction / structural-fail-closed.
- unknown literary instruction → BANA word-expression fallback candidate.
- private-use glyph → explicit fail-closed.
- standalone `-` → continuation fragment.

The JSON spec owns the entries. `build-terminology-runtime.mjs` generates the
runtime TypeScript table deterministically before build.

R2A does not modify MusicXML-to-Braille emission. R2B will consume this
semantic resolver.
