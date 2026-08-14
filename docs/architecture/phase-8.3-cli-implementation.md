# Phase 8.3 — CLI Implementation

## Status

**Phase 8.3: IMPLEMENTED**

This deliverable implements the official CLI consumer defined by the frozen
Phase 8.2 consumer application contract.

It does not modify Core, SDK, canonical specification data, profile governance,
or Web behavior.

## Runtime boundary

Package:

```text
@persian-braille/cli
```

Executable:

```text
persian-braille
```

Runtime flow:

```text
CLI -> @persian-braille/sdk -> Core -> Specification
```

There is no direct CLI dependency or import from Core.

## Implementation structure

```text
apps/cli/src/app.ts
apps/cli/src/cli.ts
apps/cli/src/index.ts
```

`app.ts` owns application-level command parsing, formatting, exit-code mapping,
and the injected IO boundary.

`cli.ts` is the executable Node adapter. It reads `process.argv`, provides
stdin/stdout/stderr adapters, and delegates to `runCli()`.

`index.ts` exposes the application runner and exit-code constants for consumer
tests without executing the CLI as an import side effect.

## Dependency policy

The CLI introduces no command framework dependency.

Argument parsing is intentionally small because Phase 8 freezes only two
commands and three translation formats.

This avoids adding a framework as an unnecessary semantic layer between the
application and the public SDK.

## Commands

Implemented:

```text
persian-braille translate
persian-braille profile
```

Help is also available through:

```text
persian-braille --help
persian-braille help
persian-braille translate --help
persian-braille profile --help
```

## Translation input

`translate` accepts exactly one source:

```text
one positional argument
or
--stdin
```

The application does not trim or normalize stdin. Stdin content is passed
verbatim to the SDK.

Simultaneous positional and stdin input is a usage error.

## Translation formats

Implemented:

```text
unicode
cells
json
```

Default:

```text
unicode
```

Unicode output uses the SDK's `unicodeBraille` directly.

Cells output joins the SDK's public `cells` array with one ASCII space.

The CLI does not derive either representation from the other.

## JSON envelope

Successful and expected-failure translations share the same deterministic
machine-readable envelope:

```json
{
  "schemaVersion": "1",
  "command": "translate",
  "result": {}
}
```

`result` is the actual public SDK result projection.

Expected SDK translation failures remain on stdout in JSON mode, while the
process exits with code `1`.

## Profile command

The profile command reads only:

```text
translator.profile
```

It supports:

```text
text
json
```

No CLI-owned normative-status claim is introduced.

## Exit codes

Implemented exactly as frozen:

```text
0 success
1 expected SDK translation failure
2 usage/input error
3 unexpected internal failure
```

Unexpected failures are rendered as a stable generic application error.

Stack traces and internal exception messages are not part of normal user-facing
output.

## Node adapter without new type dependency

The executable adapter uses a narrow structural type for the Node process IO
surface.

This keeps the CLI implementation dependency-free beyond the public SDK and
does not require a new `@types/node` package merely for the small process
adapter.

## Build/distribution shape

`package.json` adds:

```json
"bin": {
  "persian-braille": "./dist/cli.js"
}
```

The TypeScript shebang is preserved into the compiled executable.

The CLI remains private during Phase 8; npm publication is still out of scope.

The build-info cache is moved outside `dist` to:

```text
apps/cli/.tsbuildinfo
```

and the package clean script removes it.

## Clean-state package build

The CLI resolves SDK types through the SDK package `dist` export boundary.

Therefore an isolated CLI build immediately after `pnpm run clean` must
materialize its workspace dependency closure first. The dependency-aware pnpm
selector is:

```text
pnpm --filter @persian-braille/cli... run build
```

The trailing `...` includes the CLI's workspace dependencies, so Core and SDK
are built before the CLI.

A plain command such as:

```text
pnpm --filter @persian-braille/cli run build
```

is not a clean-state orchestration gate because it intentionally selects only
the CLI package. The package-local `build` script remains a normal TypeScript
build and does not recursively own dependency builds.

This matches the existing repository model in which root/workspace
orchestration materializes dependency outputs while individual package builds
remain package-local.

## Tests

Consumer tests:

```text
apps/cli/test/cli.test.mjs
```

The suite covers:

```text
compiled runtime entrypoint
help
argument translation
stdin translation
Unicode output
cells output
JSON success
JSON expected failure
human failure rendering
profile text
profile JSON
usage errors
input-source exclusivity
determinism
internal-error mapping
```

Tests execute the built CLI through `process.execPath` with `shell: false`.

Expected translation values are obtained from the public SDK, preserving the
consumer boundary.

## Explicitly unchanged

Phase 8.3 does not change:

```text
Braille mappings
normalization
rule precedence
Core engine behavior
SDK public API
profile lifecycle
Web application
Microsoft 365 integration
npm publication
```

## Next

After the CLI build/typecheck/tests and repository regression gates are green,
the next finite deliverable is:

**Phase 8.4 — Web Playground Implementation**
