# Phase 8.4 — Web Playground Implementation

## Status

**Phase 8.4: IMPLEMENTED**

This deliverable implements the browser-local Web Playground frozen by the
Phase 8.2 consumer application contract.

## Application boundary

```text
Specification -> Core -> SDK -> Web Playground
```

The browser application imports only the public SDK package from the internal
workspace graph.

The existing repository architecture validator continues to forbid direct Web
dependencies on Core.

## Tooling decision

Phase 8.4 deliberately adds no browser framework and no bundler dependency.

The current application is small enough to use:

```text
TypeScript
native ES modules
browser import maps
Node built-ins for static assembly/preview
```

This keeps Phase 8 finite and avoids introducing framework ownership or
dependency churn into translation behavior.

The static build copies the already-compiled SDK and Core distributions into
the Web `dist/vendor` directory and uses a browser import map:

```text
@persian-braille/sdk  -> ./vendor/sdk/index.js
@persian-braille/core -> ./vendor/core/index.js
```

This preserves the public package boundary at runtime while producing a real
browser-runnable static application.

The Web source itself does not import Core.

## Source structure

```text
apps/web/src/controller.ts
apps/web/src/dom-view.ts
apps/web/src/main.ts
apps/web/src/index.ts
apps/web/public/index.html
apps/web/public/styles.css
apps/web/build-static.mjs
apps/web/preview.mjs
apps/web/test/web-playground.test.mjs
```

`controller.ts` is DOM-independent application orchestration.

`dom-view.ts` owns DOM presentation and native event wiring.

`main.ts` is the browser composition root and creates the SDK translator.

This split keeps SDK translation behavior separate from presentation.

## Translation behavior

The controller sends text read from the UI directly to:

```text
translator.translate(input)
```

There is no Web-owned trimming, normalization, mapping, rule precedence, or
fallback behavior.

Success presentation uses public SDK fields:

```text
unicodeBraille
cells
normalizedText
structuralTokens
```

Failure presentation preserves the public SDK failure code/message and optional
public error detail fields.

## Profile lifecycle

The UI renders:

```text
profile.id
profile.version
profile.status
profile.direction
```

If profile status is `draft`, the page visibly discloses that lifecycle status.

The Web application does not infer or promote normative status.

## Copy behavior

The application copies only the last successful SDK `unicodeBraille` result.

A later failed translation clears the copy candidate so stale successful output
cannot be copied accidentally.

Clipboard success/failure feedback is exposed through a live status region.

## Clear behavior

Clear:

```text
removes input
removes current result
removes copy feedback
clears the copy candidate
returns focus to the print-text input
```

## Keyboard behavior

All actions use native buttons.

The textarea additionally supports:

```text
Ctrl+Enter
Command+Enter
```

to invoke translation.

No keyboard-trap logic exists.

## Accessibility

The generated page contains:

```text
explicit textarea label
native buttons
visible focus treatment
role=status + aria-live=polite for copy feedback
role=alert + aria-live=assertive for translation failure
selectable textual Unicode Braille output
responsive layout
```

No translation result is presented only as a graphic.

## Privacy

The Phase 8 Web application is browser-local.

Frozen build metadata records:

```text
runtime: browser-local
translationNetworkRequests: false
inputPersistence: none
```

The application uses no translation backend and no local/session storage for
entered translation text.

## Build

From a clean workspace, dependency-aware build:

```text
pnpm --filter @persian-braille/web... run build
```

This materializes:

```text
Core -> SDK -> Web
```

before static assembly.

The Web package-local build remains responsible only for its own TypeScript and
static assembly.

## Preview

A small Node built-in HTTP preview server serves `dist` at:

```text
http://127.0.0.1:4173
```

by default.

It introduces no production translation service.

## Tests

The Web consumer suite covers:

```text
SDK success projection
SDK failure projection
profile metadata and draft status
translation integration
failure rendering model
copy success
stale-copy prevention
copy failure feedback
clear behavior/focus return
required accessible controls
browser import-map package boundaries
vendored compiled runtime
local-translation/privacy declaration
```

The tests consume the public SDK for expected translation values.

## Explicitly unchanged

Phase 8.4 does not modify:

```text
Core
SDK public API
canonical specification
profile governance
CLI behavior
Microsoft 365 integration
npm publication
```

## Next

After Phase 8.4 passes its clean-state build, tests, browser smoke, and repository
regressions, the next finite deliverable is:

**Phase 8.5 — Consumer Integration & Regression**
