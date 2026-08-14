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

### License

MIT
