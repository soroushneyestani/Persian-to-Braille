# Phase 15.5A1 — German Core Runtime Architecture

Status: **CLOSED**

## Decision

`EXISTING_RUNTIME_SCHEMA_REQUIRES_EXTENSION`

The existing runtime bundle container is reusable, but the current Persian
execution semantics and runtime-bundle generator are not reusable for German
Braille without extension.

## Package boundary

German Braille remains inside `@persian-braille/core`.

No standalone German Core package is introduced in Phase 15.5.
Existing package names are not renamed.
The current Persian public API remains backward-compatible.

## Shared boundary

The following may be shared between Persian and German execution:

- `RuntimeSpecificationBundle`
- common translation result and trace contracts
- common Unicode and Braille primitives

Language-specific execution semantics remain isolated where required.

## Persian execution

The current Persian pipeline remains the compatibility baseline:

- `fa-ir-g1`
- existing rule selector
- existing mode-rule executor
- existing forward translator

German implementation must not change Persian translation semantics as a
side effect of architectural refactoring.

## German execution

German Core will own its execution semantics for:

- Basisschrift
- Vollschrift
- Kurzschrift
- Swiss regional overlay

German execution is not required to reuse the current Persian mode-rule
executor.

## Evidence

The current Core has four relevant implementation constraints:

1. `getBundledSpecification()` is hard-wired to the generated `fa-ir-g1`
   runtime bundle.
2. The current semantic context classifier recognizes only `digit`.
3. The current mode-rule executor requires exactly five mode rules.
4. The runtime bundle generator is hard-wired to the `fa-ir` specification
   paths and generated `fa-ir-g1.runtime.ts` output.

Therefore the current execution schema cannot represent the audited German
rule system as-is.

## Frozen constraints

- German is not a fourth text mode.
- Basisschrift, Vollschrift and Kurzschrift are German text modes.
- Swiss behavior is an orthogonal regional dimension.
- The final public German profile identifier remains `NOT_FROZEN`.
- `SWISS_EXPLICIT_ESZETT_INPUT_POLICY` remains open for Phase 15.5.
- General multi-language framework abstraction remains owned by Phase 17.
- German reverse translation is outside the current Phase 15.5 scope.

## Next

**Phase 15.5A2 — German Core Execution Boundary**
