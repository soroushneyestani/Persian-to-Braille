# Browser / Bundler Basic

This bundler-oriented example shows the source pattern for a browser application
that is bundled by the application's normal JavaScript build tool.

It imports only the public package entrypoint:

```js
import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";
```

The example exports a small UI-independent function so it can be integrated into
React, Vue, Angular, vanilla DOM code, or another browser application.

This phase does **not** claim direct CDN/browser package imports. Use a bundler
that resolves the package dependency graph.

The first-party `apps/web` consumer remains the browser integration evidence for
the current project.
