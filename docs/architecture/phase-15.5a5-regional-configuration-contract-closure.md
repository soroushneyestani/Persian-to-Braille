# Phase 15.5A5 — Regional Configuration Contract Closure

## Status

**CLOSED**

Baseline:

`d1b396d1aedc15e492accb1345a82a7d2add24e4`

## Closed substeps

15.5A5.1 — Existing Regional Machinery Audit: **CLOSED**

15.5A5.2 — Regional Configuration Identity Contract: **CLOSED**

15.5A5.3 — Regional Overlay Application Contract: **CLOSED**

15.5A5.4 — Internal Core Regional-Selection Boundary: **CLOSED**

## Frozen regional identity

The internal Core contract is:

`GermanRegionalConfiguration`

with regional overlay type:

`GermanRegionalOverlay`

Current configurations are:

`{ overlay: null }`

meaning no regional overlay, and:

`{ overlay: "swiss" }`

meaning the Swiss regional overlay.

Regional configuration is explicit. There is no implicit regional default
and multiple simultaneous regional overlays are not admitted.

## Orthogonality

Regional configuration remains independent from `GermanTextMode`.

Swiss is not a fourth German text mode and does not participate in
Basisschrift/Vollschrift/Kurzschrift inheritance.

`DE-CH410` remains an internal normative-rule namespace and is not the
runtime regional configuration key.

Persian `profile.region` metadata is not reused as the German regional
selector.

## Overlay application

Text-mode materialization occurs first.

Regional configuration is then applied at the contractually distinct
stage:

`AFTER_TEXT_MODE_MATERIALIZATION_BEFORE_FINAL_EXECUTABLE_SPECIFICATION`

The result remains one effective executable specification.

The regional model does not authorize:

- translator chaining,
- a second regional runtime bundle,
- base-rule mutation,
- implicit rule replacement,
- last-write-wins behavior,
- cross-mode promotion of regional rules.

## Core boundary

The internal regional-selection boundary exists in Core.

It remains outside the Core package-root API and outside the public SDK.

It is not wired into `ForwardTranslator` or `ModeRuleExecutor`.

No Swiss rule execution has been implemented by A5.

## Swiss Eszett dependency

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY` remains **OPEN**.

A5 does not decide whether explicit Swiss-profile `ß` input is preserved,
rejected, normalized, or otherwise handled.

That decision belongs exclusively to:

**15.5A6**

## Historical A5.2 validator

The frozen A5.2 validator artifact is preserved unchanged.

It is intentionally not re-executed after A5.4 because it contains a
phase-local assertion that the Core regional boundary had not yet been
implemented.

A5.5 instead validates the frozen A5.2 contract directly, while A5.4
behavior is covered by focused and full Core regression tests.

## Runtime admission

German profiles: **0**

German rules: **0**

German regional rules: **0**

German mappings: **0**

German generated runtime bundles: **0**

Swiss executable runtime behavior: **0**

## Compatibility

Persian runtime SHA-256 remains:

`09D350BD40C4E801377A59CEC6D0BEDA56D0CD2B0C80708C38E4753BDBEC4094`

Core root regional API leakage: **NONE**

SDK regional API leakage: **NONE**

Existing execution-path regional coupling: **NONE**

## Closure

`PHASE_15_5A5_STATUS=CLOSED`

Next:

**15.5A6 — SWISS_EXPLICIT_ESZETT_INPUT_POLICY**
