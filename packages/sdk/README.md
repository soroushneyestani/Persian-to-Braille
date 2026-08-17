# @persian-braille/sdk

Public developer-facing API over the core engine.

Responsibilities:
- expose stable programmatic translation APIs;
- adapt core primitives into ergonomic public interfaces;
- preserve specification lifecycle metadata where relevant;
- provide the integration boundary for official and third-party consumers.

Dependency rule:
- may depend on `packages/core`;
- must not depend on `apps/*` or `integrations/*`.

## Public SDK

The public package surface is `@persian-braille/sdk`, backed by
`@persian-braille/core`.

### Install

For the eventual stable release:

```bash
pnpm add @persian-braille/sdk
```

Development prereleases use the `next` distribution tag once published.

### Translate

```ts
import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

const translator =
  createPersianBrailleTranslator();

const result =
  translator.translate("سلام");

if (result.ok) {
  console.log(result.unicodeBraille);
} else {
  console.error(
    result.code,
    result.message,
  );
}
```

The public result exposes the final cells, Unicode Braille, normalized text,
structural tokens, and bundled profile metadata without exposing Core engine
internals.

### Throwing API

```ts
import {
  PersianBrailleTranslationError,
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

const translator =
  createPersianBrailleTranslator();

try {
  const result =
    translator.translateOrThrow("سلام");

  console.log(result.unicodeBraille);
} catch (error) {
  if (
    error instanceof
    PersianBrailleTranslationError
  ) {
    console.error(
      error.code,
      error.result,
    );
  }
}
```

Expected translation failures include stable codes such as
`UNKNOWN_CHARACTER`.

### Architecture

The SDK delegates translation semantics to `@persian-braille/core`.

```text
Specification -> Core -> SDK -> Consumers
```

The SDK does not re-export the Core rule selector, engine token producer, mode
executor, runtime specification records, or full execution trace.

### Supported environments

Phase 12 documents only environments that are currently supported or validated
by repository evidence:

| Environment | Phase 12 status |
| --- | --- |
| Node.js ESM `>=24.19.0 <25` | Supported by the package engine contract |
| Browser application through a bundler | Validated first-party consumer via `apps/web` |
| Microsoft 365 task-pane bundle | Validated first-party consumer |
| CommonJS | Not claimed |
| Deno | Not claimed |
| Bun | Not claimed |
| Direct browser/CDN package import | Not claimed |

The browser example is bundler-oriented. It is not a claim that a browser can
resolve the npm package directly from a CDN without an application build step.

### Public entrypoint and package boundary

Application and integration code should import the documented package root:

```ts
import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";
```

Do not depend on package-internal or emitted-file paths such as:

```text
@persian-braille/sdk/dist/index.js
```

Deep imports are not part of the public SDK contract. The package export map
exposes only the root entrypoint, and the Phase 12 packed-consumer validation
requires private subpaths to be rejected with
`ERR_PACKAGE_PATH_NOT_EXPORTED`.

The intended dependency direction is:

```text
Application / Integration
          |
          v
@persian-braille/sdk
          |
          v
@persian-braille/core
```

Consumers should not bypass the SDK to depend on Core internals when building
application-level integrations.

### Examples and quickstarts

Runnable examples are maintained under [`../../examples`](../../examples/):

- [Node.js basic](../../examples/node-basic/) — minimal ESM translation.
- [Browser / bundler basic](../../examples/browser-basic/) — browser-source
  integration through an application bundler.
- [Structured error handling](../../examples/error-handling/) — non-throwing
  result handling with top-level `code` and `message`.
- [Third-party integration adapter](../../examples/integration-adapter/) —
  wrapping the SDK without coupling the integration to Microsoft Office or Core
  internals.

Run the example regression from the repository root with:

```bash
pnpm --filter @persian-braille/examples test
```

### Versioning and compatibility

During Phase 12, the documented SDK package root and the current public runtime
and TypeScript export surface are compatibility-protected.

The following runtime exports are part of that protected surface:

- `PersianBrailleTranslationError`
- `createPersianBrailleTranslator`

The current public TypeScript contract includes:

- `CreatePersianBrailleTranslator`
- `PersianBrailleProfileInfo`
- `PersianBrailleTranslationErrorData`
- `PersianBrailleTranslationFailure`
- `PersianBrailleTranslationFailureCode`
- `PersianBrailleTranslationResult`
- `PersianBrailleTranslationSuccess`
- `PersianBrailleTranslator`
- `PersianBrailleUnicodeLocation`

Removing or renaming those exports is a breaking change and is not permitted
while closing Phase 12. Compatible additive APIs require validation before they
become part of the documented public contract.

Reverse translation is deliberately outside this phase and remains deferred to
Phase 13; Phase 12 does not expose or promise a `translateFromBraille` API.

### License

MIT
