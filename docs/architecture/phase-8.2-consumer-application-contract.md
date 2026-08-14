# Phase 8.2 — Consumer Application Contract

## Status

**Phase 8.2: CLOSED when the machine-readable contract and validator are committed**

Phase 8.2 defines the application behavior that CLI and Web must implement.
It does not implement either consumer.

The governing architecture remains:

```text
Specification -> Core -> SDK -> Consumers
```

For Phase 8:

```text
CLI -> SDK
Web -> SDK
```

Neither application may own Persian Braille translation semantics.

## Contract artifacts

Human-readable contract:

```text
docs/architecture/phase-8.2-consumer-application-contract.md
```

Machine-readable contract:

```text
docs/architecture/phase-8.2-consumer-application-contract.json
```

Validator:

```text
tools/architecture/validate-phase8-consumer-contract.mjs
```

Root gate:

```text
pnpm run validate:phase8-consumer-contract
```

The machine-readable JSON is the fixed Phase 8 application contract. This
document explains the intent and behavior.

## Ownership boundary

The applications may own:

```text
input acquisition
CLI argument validation
stdout/stderr formatting
process exit codes
browser layout
browser state
copy interaction
accessibility UX
presentation
```

The applications may not own or duplicate:

```text
Braille mappings
normalization rules
rule precedence
context matching
mode semantics
fallback semantics
profile governance
translation failure semantics
```

All translation is delegated to:

```text
@persian-braille/sdk
```

Direct application dependencies/imports on Core or canonical specification
files remain forbidden.

## CLI contract

Package:

```text
@persian-braille/cli
```

Executable:

```text
persian-braille
```

Phase 8 defines two commands:

```text
persian-braille translate ...
persian-braille profile ...
```

### `translate`

Supported input sources:

```text
arguments
stdin
```

Exactly one input source is accepted for one invocation.

Examples of the intended user model:

```text
persian-braille translate "سلام"
"سلام" | persian-braille translate --stdin
```

The implementation may provide normal help/version flags, but those flags do
not alter translation semantics.

### Output formats

`translate` supports:

```text
unicode
cells
json
```

Default:

```text
unicode
```

Human Unicode success output is exactly the SDK `unicodeBraille` string followed
by one newline.

Human cells output is the SDK `cells` array joined by one ASCII space followed
by one newline.

The application must not recompute cells from Unicode Braille or vice versa.

### JSON mode

Machine-readable translation output uses an application envelope:

```json
{
  "schemaVersion": "1",
  "command": "translate",
  "result": "<PersianBrailleTranslationResult>"
}
```

`result` is a projection of the actual SDK public result, not a Core result.

For expected translation failures, JSON remains on stdout so automation can
parse it deterministically; the process exit code still reports failure.

### `profile`

The profile command reads only:

```text
translator.profile
```

It supports:

```text
text
json
```

and must display the bundled profile's:

```text
id
version
status
direction
```

No application-owned claim that the profile is normative is permitted.

### Exit codes

Phase 8 freezes:

```text
0 = success
1 = expected SDK translation failure
2 = CLI usage/input-contract error
3 = unexpected internal application failure
```

These codes are application semantics; they do not replace SDK failure codes.

### Stream policy

```text
human success              -> stdout
human translation failure  -> stderr
JSON translation result    -> stdout
usage error                -> stderr
internal error             -> stderr
```

Normal user-facing output must not depend on ANSI color and must not expose a
stack trace as part of the stable CLI contract.

## Web Playground contract

Package:

```text
@persian-braille/web
```

The Web Playground performs translation locally in the browser through the
public SDK.

Phase 8 does not introduce a translation server.

### Required controls

The UI must provide:

```text
print-text input
Translate
Clear
Copy Unicode Braille
```

### Required result presentation

For a successful translation, the Web Playground makes the following public SDK
information available:

```text
unicodeBraille
cells
profile.id
profile.version
profile.status
profile.direction
normalizedText
structuralTokens
```

The application must visibly disclose that the bundled `fa-ir-g1` profile is
currently `draft`.

This disclosure is lifecycle metadata, not a warning that changes translation
behavior.

### Failure presentation

Expected SDK failures are rendered as application UI while preserving the SDK
failure code.

When available, the UI may display the public SDK location/context fields:

```text
codePointIndex
utf16Index
character
codePoint
candidateRuleIds
causeCode
```

The Web application must not expose hidden Core trace/engine structures.

## Accessibility contract

The Web Playground is itself an accessibility-facing product, so accessibility
is a Phase 8 functional requirement rather than a cosmetic follow-up.

The implementation must provide:

```text
accessible names for controls
keyboard-operable actions
no keyboard trap
accessible failure announcement
selectable textual output
accessible copy feedback
```

Translation output may not exist only as a rendered graphic.

## Privacy contract

Phase 8 Web behavior is intentionally local:

```text
translation network requests: none
localStorage input persistence: none
sessionStorage input persistence: none
translation history: none
```

Entered text is sent only to the in-browser SDK translation call.

Ordinary static asset loading by the application host is outside the meaning of
"translation network request"; user translation input itself must not be sent
to a backend by Phase 8.

## CLI/Web parity contract

For the same input and the same bundled SDK/profile, CLI and Web must preserve:

```text
unicodeBraille
cells
profile metadata
expected SDK failure code
```

Both consumers pass input to the SDK without introducing their own Unicode or
Braille normalization.

Presentation may differ because terminal and browser UX are different.

The Web may have copy controls; the CLI has process exit codes. These are not
semantic differences.

## Testing contract

Phase 8 implementation must create real consumer tests.

CLI coverage must include:

```text
runtime entrypoint
argument input
stdin input
unicode output
cells output
JSON success
JSON expected failure
exit-code mapping
profile command
usage errors
determinism
```

Web coverage must include:

```text
browser build
SDK translation integration
success rendering
failure rendering
draft profile disclosure
copy interaction
clear interaction
keyboard/accessibility requirements
dependency boundary
```

Integration/regression coverage must include:

```text
CLI/Web success parity
CLI/Web failure-code parity
clean-state build/typecheck/test
```

The exact test libraries are implementation choices for Phase 8.3–8.5; the
behavioral coverage above is contractual.

## Deliberately out of scope

Phase 8 does not add:

```text
file input
server-side translation API
accounts/authentication
analytics
persistent translation history
service worker/PWA cache
Core trace exposure
normative promotion
reverse translation
Braille Music
Microsoft 365 behavior
npm publication
```

These exclusions keep Phase 8 finite.

## Framework boundary

Phase 8.2 does not require a CLI framework or browser UI framework.

The implementation phases may choose minimal tooling appropriate to the
contract, but a framework must not become the owner of translation semantics.

The Web implementation must ultimately produce a real browser-runnable build,
not merely a Node-compatible TypeScript module.

## Exit decision

With this contract frozen, implementation can proceed without inventing
consumer behavior ad hoc.

Next:

**Phase 8.3 — CLI Implementation**
