# Phase 15.5A5.1 — Existing Regional Machinery Audit

## Status

**CLOSED**

Baseline:

`3f51ce949b37b7896eb55feb00a3973569749ab4`

## Existing Core state

There is currently no generic Core regional selector and no German
regional-selection runtime boundary.

The existing Persian profile contains a `region` field (`IR`), but that
field is profile metadata. It is not a request-time German regional
configuration selector and must not be reused as one.

The Phase 15.5A4 `GermanTextMode` boundary owns text-mode selection only.
It does not own regional selection.

## Frozen Swiss architecture

Swiss remains an orthogonal regional configuration dimension.

It is not:

- a fourth German text mode,
- part of the GermanTextMode inheritance chain,
- a replacement for Basisschrift, Vollschrift, or Kurzschrift.

A separate regional configuration contract is required.

## DE-CH410 namespace

`DE-CH410` is the internal normative-rule namespace for BSKDL Swiss
§4.10.

It is not a public locale identifier and is not a public profile
identifier.

Phase 15.5A5 must not silently repurpose it as a regional configuration
key.

## Identity questions intentionally left open

A5.1 does not freeze:

- the internal regional configuration type name,
- the canonical non-Swiss/base configuration value,
- the canonical Swiss configuration value,
- the public Swiss identifier,
- the public SDK regional configuration shape.

Those belong to later A5 steps or Phase 15.6.

## Swiss Eszett dependency

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY` remains **OPEN**.

A5 must not invent or resolve its runtime semantics.

The decision owner is:

**Phase 15.5A6**

## Runtime admission

German profiles: **0**

German rules: **0**

German regional rules: **0**

German mappings: **0**

German generated runtime bundles: **0**

Swiss executable runtime behavior: **0**

## Audit conclusion

The existing Core provides no reusable German regional selector.

A separate internal regional configuration contract is required before
regional runtime behavior can be admitted.

**PHASE_15_5A5_1_STATUS=CLOSED**

Next:

**15.5A5.2 — Regional Configuration Identity Contract**
