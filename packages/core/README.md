# @persian-braille/core

Pure translation-engine package.

Responsibilities:
- consume validated specification artifacts;
- execute normalization, matching, context, mode, layout, and translation rules;
- expose deterministic engine primitives;
- remain independent from CLI, web UI, Microsoft 365, and other integrations.

Dependency rule:
- may depend on specification-facing infrastructure defined by the repository;
- must not depend on `packages/sdk`, `apps/*`, or `integrations/*`.

## Public Core Package

`@persian-braille/core` is the specification-driven forward translation engine
used by `@persian-braille/sdk`.

The package owns execution of the bundled Persian Braille specification and is
kept separate from the consumer-facing SDK facade:

```text
Specification -> Core -> SDK
```

Application code should normally consume `@persian-braille/sdk`. Direct Core
use is intended for lower-level integrations that explicitly need the engine
contract.

### License

MIT
