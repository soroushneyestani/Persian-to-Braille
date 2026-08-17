# Persian Braille Reverse Specification

This directory is the Phase 13 specification boundary for Braille-to-print
translation.

It is intentionally separate from the frozen forward rule records under
`spec/fa-ir/rules/records/`.

## Ownership

```text
forward Persian Braille records
            ↓ evidence
reverse policy + reverse profile
            ↓
independent reverse conformance
            ↓
Core reverse parser
            ↓
public SDK
```

The reverse engine must not infer semantics by blindly swapping the 176 forward
conformance vectors.

## Foundation

- `schemas/` defines reverse policy, profile, and conformance contracts.
- `policy/` freezes parser and canonical rendering policy.
- `profiles/` defines the `fa-ir-g1-reverse` profile.
- `conformance/records/` contains independent reverse seed vectors.
- `conformance/manifest.json` inventories those vectors and planned suites.

## Defaults

```text
digit family       persian
punctuation style  persian
ellipsis style     unicode
ambiguity policy   canonicalize
```

Canonicalization is observable through diagnostics.

## Lossiness

Plain Unicode Braille cannot recover every source distinction discarded by the
forward mapping. In particular, exact source layout and exact ZWNJ provenance
are not claimed.

## Scope

This directory belongs to Phase 13 only. It does not introduce Braille Music,
the general multi-language framework, Office Web, Office Mac, or Marketplace
work.
