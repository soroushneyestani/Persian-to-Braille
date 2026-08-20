# Phase 15.5B3.1 — Contract Scope Partition

## Status

**CONTRACT_SCOPE_PARTITION_FROZEN**

## Scope

The German Basisschrift canonical layer contains **150** rules.

The closed B2 behavioral scope contains **43** rules.

The remaining **107** canonical rules form the complete input scope for
B3 contract analysis.

This is a scope decision only.

Admission into B3 input does **not** mean that a rule is executable and
does **not** yet assign its final materialization role.

## Family partition

- `ACCENT`: **8**
- `CASE`: **21**
- `CB`: **17**
- `EMPH`: **15**
- `FLANG`: **14**
- `MATH`: **20**
- `SPECIAL`: **4**
- `TABLE`: **8**

Total:

**107**

## Contract domains

`ACCENT`

Accent and diacritic contracts.

`CASE`

Case and script-state contracts.

`CB`

Computer-Braille transport and insert contracts.

`EMPH`

Emphasis-span contracts.

`FLANG`

Foreign-language span and delegation contracts.

`MATH`

Math announcement, scope, and structural contracts.

`SPECIAL`

Special-form and currency-interaction contracts.

`TABLE`

Table-structure contracts.

## Coverage

B2 scope:

**43**

B3 input scope:

**107**

Overlap:

**0**

Combined canonical coverage:

**150 / 150**

## Important boundaries

### Six-dot runtime

The German runtime remains six-dot-only.

`DE-CB-002` records the source's primary eight-dot system and must be
preserved during B3 analysis, but B3.1 does not declare it executable.

`DE-CB-003` records the six-dot fallback trigger.

Their final materialization dispositions are intentionally left for the
B3 contract taxonomy.

### Cross-mode case interaction

`DE-CASE-019` and `DE-CASE-020` explicitly carry profile applicability.

They remain inside the B3 analysis input so the cross-mode boundary is
preserved rather than silently discarded.

Their final ownership is not frozen in B3.1.

## Deterministic scope identity

B3 scope canonical SHA-256:

`30C38D2910165AFC7068633493DD4660E5647EBFF6299E902F24294A318D5E83`

## Execution boundary

No contract materialization has started.

No indicator materialization has started.

No state/scope materialization has started.

No structural materialization has started.

No behavioral lowering has started.

No German translator has started.

No German runtime bundle has been generated or registered.

## Next

**15.5B3.2 — Contract Role Taxonomy**
