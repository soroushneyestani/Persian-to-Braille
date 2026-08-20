# Phase 15.5B1.3 — Basisschrift Canonical Profile

## Status

**PROFILE_MATERIALIZED_RULE_RECORDS_PENDING**

## Internal profile

`de-basisschrift`

This identifier belongs to the internal canonical specification.

It does **not** freeze a public SDK, locale, Marketplace, or product
profile identifier.

## Profile

- language: `de`
- text mode: `basisschrift`
- cell size: `6`
- direction: `print-to-braille`
- status: `candidate`
- version: `0.1.0`

## Rule inventory

The profile references exactly **150** audited Chapter 2
Basisschrift Rule IDs.

Rule IDs are stored in lexical identifier order.

That ordering is explicitly **non-semantic** and must not be interpreted
as execution precedence.

Canonical rule-record materialization belongs to B1.4.

At B1.3:

- profile records: 1
- referenced Rule IDs: 150
- canonical rule-record files: 0
- runtime German rules: 0
- German runtime bundles: 0

## Normalization and fallback

B1.3 uses a conservative internal fail-closed policy:

- Unicode normalization: `none`
- unknown format controls: `error`
- unknown character: `error`
- unknown sequence: `error`

These settings are architecture/runtime-safety decisions.

They are **not** represented as normative claims made by the BSKDL
source.

## Regional boundary

Swiss regional behavior is not encoded in this profile.

Swiss remains an orthogonal regional overlay and is implemented in
Phase 15.5F.

## Deferred dependencies

The Phase 15.1 deferred dependencies remain preserved.

B1.3 does not infer resolutions for them.

## Runtime boundary

No German executable rule is admitted.

No German runtime bundle is generated.

No runtime manifest or runtime builder is changed.

## Next

**15.5B1.4 — Canonical Basisschrift rule materialization**
