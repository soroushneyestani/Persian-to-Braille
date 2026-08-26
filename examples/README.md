# Braille Hub SDK Examples

These examples demonstrate the public `@persian-braille/sdk` entrypoint.

```text
Consumer
   |
   v
@persian-braille/sdk
   |
   v
@persian-braille/core
```

The examples intentionally do **not** import `@persian-braille/core` directly
and do not use SDK deep-import paths.

## Examples

- [`node-basic`](./node-basic/) — minimal Node.js ESM translation.
- [`browser-basic`](./browser-basic/) — bundler-oriented browser application pattern.
- [`error-handling`](./error-handling/) — structured translation failure handling.
- [`integration-adapter`](./integration-adapter/) — starter adapter for third-party integrations.

## Current runtime claims

Node.js ESM is covered by the package engine contract.

The browser example is intentionally **bundler-oriented**. It does not claim
direct `<script type="module">` CDN/browser package resolution. Direct browser
CDN imports remain outside the current validated runtime matrix.

## Run the examples regression

From the repository root:

```bash
pnpm --filter @persian-braille/examples test
```
