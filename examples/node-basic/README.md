# Node.js Basic

Minimal Node.js ESM usage of the public SDK.

```js
import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

const translator = createPersianBrailleTranslator();
const result = translator.translate("سلام");

if (!result.ok) {
  console.error(result.code, result.message);
  process.exitCode = 1;
} else {
  console.log(result.unicodeBraille);
}
```

Run from the repository root after workspace installation:

```bash
node examples/node-basic/index.mjs
```
