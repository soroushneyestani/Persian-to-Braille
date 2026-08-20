# German Braille Canonical Specification Namespace

This directory reserves the canonical specification namespace for the
German Braille implementation introduced in Phase 15.

## Current state

Phase 15.5A3.4 admits **topology only**.

No German profile, executable rule, mapping, generated runtime bundle,
or Swiss executable behavior is admitted by this step.

The authoritative topology contract is:

`spec/de/runtime-topology.json`

## German text modes

The German product surface contains three text modes:

- Basisschrift
- Vollschrift
- Kurzschrift

Swiss behavior is **not** a fourth mode. It is an orthogonal regional
configuration dimension.

## Reserved canonical paths

The following paths are reserved and will be materialized only when
their respective specification artifacts are admitted:

- `spec/de/schema/`
- `spec/de/profiles/`
- `spec/de/rules/records/`
- `spec/de/regional/ch/overlay/`
- `spec/de/regional/ch/rules/records/`

## Identifier policy

Public German profile identifiers are not frozen in Phase 15.5A3.

The internal namespace `DE-CH410` is a normative Swiss-rule namespace;
it is not a public locale or profile identifier.

## Swiss runtime policy

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY` remains open and must not be
silently resolved by topology admission.
