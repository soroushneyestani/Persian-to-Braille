# Persian Braille Web Playground

Official browser-based consumer of the public SDK.

## Architecture

```text
Specification -> Core -> SDK -> Web Playground
```

The Web application consumes `@persian-braille/sdk` and does not own Braille
mappings, normalization, precedence, or translation failure semantics.

## Runtime

Phase 8 uses a dependency-free browser application:

- TypeScript compiles the application modules.
- The static build vendors the already-compiled SDK/Core runtime artifacts.
- A browser import map preserves package boundaries.
- Translation runs locally in the browser.
- No translation API/backend is introduced.
- Translation input is not persisted in `localStorage` or `sessionStorage`.

## Build

From a clean repository, build the Web dependency closure:

```text
pnpm --filter @persian-braille/web... run build
```

## Test

```text
pnpm --filter @persian-braille/web run test
```

## Preview

After build:

```text
pnpm --filter @persian-braille/web run preview
```

Default local address:

```text
http://127.0.0.1:4173
```

The preview server uses only Node built-ins and serves the generated `dist`
directory.

## Playground behavior

The UI provides:

- Persian print-text input;
- Translate;
- Clear;
- Copy Unicode Braille;
- Unicode Braille output;
- cell output;
- normalized text;
- structural tokens;
- public SDK error details;
- bundled profile metadata and draft-status disclosure.

`Ctrl+Enter` / `Command+Enter` translates from the text area.

## Accessibility

Phase 8 treats accessibility as functional behavior:

- native form controls and buttons;
- explicit textarea label;
- keyboard-operable actions;
- visible keyboard focus;
- assertive translation-error announcement;
- polite clipboard status announcement;
- selectable textual Braille output.

## Privacy

The Phase 8 playground does not send translation text to a server and does not
store entered text as application history.
