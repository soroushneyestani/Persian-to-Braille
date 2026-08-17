# Structured Error Handling

`translator.translate(text)` returns a structured translation result.

Consumers should branch on `result.ok` rather than inventing their own mapping
semantics.

```js
const result = translator.translate(input);

if (!result.ok) {
  console.error(
    result.code,
    result.message,
  );
}
```

The example deliberately uses an unsupported emoji to demonstrate the current
translation failure path through the public SDK.
