# Persian Braille CLI

Official command-line consumer of the public SDK.

Responsibilities:
- provide terminal translation and profile-inspection workflows;
- consume public SDK APIs rather than internal Core implementation details;
- keep command parsing, stream formatting, and process exit codes outside the translation engine.

Dependency rule:
- may depend on `packages/sdk`;
- must not depend on Core or canonical specification files;
- must not become a source of Braille rules.

## Commands

```text
persian-braille translate <text>
persian-braille translate --stdin
persian-braille profile
```

### Translation formats

```text
unicode   default
cells
json
```

Examples:

```powershell
persian-braille translate "سلام"
persian-braille translate "سلام" --format cells
persian-braille translate "سلام" --format json
```

For stdin input:

```text
persian-braille translate --stdin
```

Stdin is passed to the SDK verbatim. The CLI does not trim, normalize, or otherwise rewrite user translation input.

### Profile

```text
persian-braille profile
persian-braille profile --format json
```

Profile information comes directly from `translator.profile`.

## Exit codes

```text
0 success
1 expected SDK translation failure
2 CLI usage/input-contract error
3 unexpected internal CLI failure
```

## JSON contract

Translation JSON uses:

```json
{
  "schemaVersion": "1",
  "command": "translate",
  "result": {}
}
```

The `result` object is the public SDK translation result.

Expected SDK translation failures remain on stdout in JSON mode so automated consumers can parse them; the process exit code is still `1`.

## Architecture

```text
Specification -> Core -> SDK -> CLI
```

The CLI does not reproduce mappings, normalization, precedence, or translation failure semantics.
