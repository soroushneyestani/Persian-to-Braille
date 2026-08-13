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
