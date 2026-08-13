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
