# Phase 15.5A4 — German Mode Contract Closure

## Status

**CLOSED**

Repository baseline:

`6b537ccb7755855ad185b83b2cfbaa439e9b6dba`

## GermanTextMode

The internal German text-mode identity is frozen as:

- `basisschrift`
- `vollschrift`
- `kurzschrift`

Exactly one mode must be selected explicitly for each German
translation request.

No implicit default is authorized.

## Semantic separation

`GermanTextMode` is a translation-configuration dimension.

It is not the same concept as the existing canonical rule type
`mode`, which remains structural engine-rule machinery.

`ModeRuleExecutor` remains independent from GermanTextMode selection.

## Materialization

Mode inheritance means specification materialization:

- Basisschrift → `basisschrift`
- Vollschrift → `basisschrift + vollschrift`
- Kurzschrift → `basisschrift + vollschrift + kurzschrift`

The selected mode ultimately owns one self-contained effective runtime
specification.

Runtime parent fallback and translator chaining are forbidden.

Last-write-wins, implicit child override, and duplicate canonical rule
IDs across layers are forbidden.

## Swiss regional separation

Swiss remains an orthogonal regional configuration dimension.

It is not a fourth German text mode and does not participate in the
German mode inheritance chain.

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY` remains **OPEN** and is owned by
Phase 15.5A6.

## Public API boundary

The Phase 15.5 internal Core module does not leak through the Core root
package API.

No German SDK API is frozen by A4.

Public German and Swiss profile identifiers remain `NOT_FROZEN`.

## Runtime admission

German profiles: **0**

German rules: **0**

German mappings: **0**

German generated runtime bundles: **0**

The runtime bundle manifest remains Persian-only.

## Regression

- A4.2 identity validator: PASS
- A4.3 materialization validator: PASS
- GermanTextMode focused test: PASS
- Core regression: PASS
- SDK regression: PASS
- Persian generated runtime unchanged: PASS

Persian runtime SHA-256:

`09D350BD40C4E801377A59CEC6D0BEDA56D0CD2B0C80708C38E4753BDBEC4094`

## Closure

All Phase 15.5A4 contract gates are satisfied.

**PHASE_15_5A4_STATUS=CLOSED**

Next:

**15.5A5 — Regional Configuration Contract**
