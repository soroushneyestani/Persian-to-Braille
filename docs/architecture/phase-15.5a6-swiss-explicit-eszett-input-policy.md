# Phase 15.5A6 — Swiss Explicit Eszett Input Runtime Policy

## Decision

**REJECT**

When the Swiss regional overlay is active, explicit `ß` input is
inadmissible.

Internal semantic cause:

`SWISS_EXPLICIT_ESZETT_FORBIDDEN`

The failure is deterministic and fail-closed.

## Source boundary

BSKDL §4.10 states that Eszett is not used in Switzerland.

The source does not authorize automatic `ß -> ss` normalization.

Therefore A6 does not introduce print normalization.

## Base German behavior

The canonical German mapping remains preserved:

`ß -> ⠮` — dots 2346.

This mapping remains available when the Swiss overlay is not active.

The Swiss runtime policy does not delete or mutate that base mapping.

## Swiss behavior

With:

`overlay: "swiss"`

and explicit `ß` in the input:

- translation does not succeed,
- input is not rewritten,
- `ß` is not automatically converted to `ss`,
- partial translation is not authorized,
- runtime returns the internal semantic failure
  `SWISS_EXPLICIT_ESZETT_FORBIDDEN`.

## Rejected alternatives

### PRESERVE

Rejected for the Swiss overlay because it would accept the print form that
the normative Swiss orthographic constraint says is not used.

### NORMALIZE_TO_SS

Rejected because §4.10 does not define automatic print normalization and
silent rewriting would mutate user input.

## Rule impact

`DE-CH410-001` now has a complete runtime policy.

`DE-CH410-002` is unchanged.

The existing Swiss Doppel-s targets `gross` and `schliess` remain governed
by Rule 002 and the existing Kurzschrift restriction system.

## Mode impact

The rejection policy applies under the Swiss overlay in all three German
text modes:

- Basisschrift
- Vollschrift
- Kurzschrift

Swiss remains an orthogonal regional configuration, not a fourth mode.

## Public API

A6 freezes only the internal semantic policy and internal cause identity.

Public SDK error/API shape remains deferred to Phase 15.6.

## Implementation

No Swiss runtime implementation is added by this decision artifact.

Runtime implementation remains owned by Phase 15.5F.
