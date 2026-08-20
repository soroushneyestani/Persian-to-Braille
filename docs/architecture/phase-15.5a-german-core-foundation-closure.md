# Phase 15.5A — German Core Architecture and Runtime Foundation Closure

## Status

**CLOSED**

Pre-closure repository HEAD:

`2e2f30c3a26195c108fb21fa69c7d87e2c3b33c8`

## Closed substeps

- 15.5A0 — Deutsch Tab Shell: **CLOSED**
- 15.5A1 — German Core Architecture: **CLOSED**
- 15.5A2 — Specification Injection Boundary: **CLOSED**
- 15.5A3 — German Runtime Specification Topology: **CLOSED**
- 15.5A4 — German Mode Contract: **CLOSED**
- 15.5A5 — Regional Configuration Contract: **CLOSED**
- 15.5A6 — Swiss Explicit Eszett Input Policy: **CLOSED**

## German text-mode foundation

The internal German text modes are:

- `basisschrift`
- `vollschrift`
- `kurzschrift`

Exactly one text mode is explicitly selected per German translation
request.

Mode inheritance is resolved by specification materialization rather than
runtime translator chaining.

## Runtime topology

The frozen internal runtime model remains:

`THREE_INTERNAL_EXECUTABLE_BUNDLES`

The three future effective bundles correspond to Basisschrift,
Vollschrift, and Kurzschrift.

No German executable bundle has been admitted yet.

## Regional configuration

Regional configuration is orthogonal to German text mode.

The internal Swiss overlay key is:

`swiss`

Swiss is not a fourth German text mode.

## Swiss Eszett policy

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY` is resolved.

Policy:

`REJECT`

Internal semantic cause:

`SWISS_EXPLICIT_ESZETT_FORBIDDEN`

When the Swiss overlay is active, explicit `ß` input fails
deterministically and fail-closed.

No automatic `ß -> ss` normalization is authorized.

The canonical non-Swiss German mapping remains preserved:

`ß -> ⠮` — dots 2346.

## Public API boundary

Public German profile identifiers remain unfrozen.

Public Swiss identifiers remain unfrozen.

Public German and regional SDK API shape remains owned by Phase 15.6.

## Implementation boundary

At Foundation closure:

German profiles: **0**

German rules: **0**

German regional rules: **0**

German mappings: **0**

German generated runtime bundles: **0**

No Basisschrift, Vollschrift, Kurzschrift, or Swiss executable runtime has
yet been implemented.

## Persian compatibility

Persian runtime SHA-256 remains:

`09D350BD40C4E801377A59CEC6D0BEDA56D0CD2B0C80708C38E4753BDBEC4094`

Existing Persian behavior remains the compatibility baseline.

## Closure

`PHASE_15_5A_STATUS=CLOSED`

Next:

**15.5B1 — Basisschrift canonical specification materialization**
