# @persian-braille/music

Platform-agnostic MIDI and Braille Music engine used by Persian-to-Braille v2.

## Scope

This package contains the Braille Music runtime used by the public
`@persian-braille/sdk` package. It provides the implementation foundation for:

- Standard MIDI File parsing
- Track + Channel source-line discovery
- notation and rhythm normalization
- Music Braille encoding
- Unicode Music Braille output
- BRF/Braille ASCII projection

The package is host-independent. Microsoft Word integration lives separately
under `integrations/microsoft365`.

## Consumer boundary

Application developers should normally consume Braille Music through:

```text
@persian-braille/sdk
```

rather than depending on engine internals directly.

## Current production-integrated workflow

```text
MIDI (.mid/.midi)
  -> source-line discovery
  -> select exactly one Track + Channel line
  -> Music Braille translation
  -> Unicode / BRF preview
  -> Microsoft Word insertion
```

Unsupported or ambiguous source material is handled fail-closed rather than
being silently rewritten.

## License

MIT
