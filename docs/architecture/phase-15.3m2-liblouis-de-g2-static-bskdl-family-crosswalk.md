# Phase 15.3M2 — Liblouis de-g2 Static BSKDL Family Crosswalk

Status: **PASS**

Role: **NON-NORMATIVE COMPARATOR**

## Decision

```text
Directive families:                     14
EXACT_STATIC_CORRESPONDENCE:             0
IMPLEMENTATION_MECHANISM_ONLY:           8
NO_SAFE_BSKDL_EQUIVALENCE:               6
Opcode → BSKDL one-to-one mapping:       NO
Liblouis rule promotion:                 NO
```

## Why there are no opcode-level exact matches

Liblouis opcodes describe translator-engine eligibility and processing mechanisms.

BSKDL rules describe normative German Braille behavior.

A single Liblouis opcode can implement multiple unrelated BSKDL rule families, and one BSKDL rule may require several Liblouis mechanisms.

## Key conservative classifications

- `nocross` → `NO_SAFE_BSKDL_EQUIVALENCE`
- `word` → `NO_SAFE_BSKDL_EQUIVALENCE`
- `noback` → `IMPLEMENTATION_MECHANISM_ONLY`
- `always` → `IMPLEMENTATION_MECHANISM_ONLY`
- `begword/endword/prfword/sufword` → `IMPLEMENTATION_MECHANISM_ONLY`
- `letsign/noletsign/...` → `NO_SAFE_BSKDL_EQUIVALENCE`

## Static lexical candidates

Four lexical witnesses are promoted only to the next comparator-audit stage:

- `LÄSS` → Phase `15.3H`
- `ÜBRIG` → Phase `15.3F`
- `WÄRTS` → Phase `15.3D`
- `SCHAFT` → Phase `15.3D`

None is declared an exact Liblouis/BSKDL correspondence in M2.

## Important policy

```text
Liblouis finding ≠ BSKDL normative rule
```

The comparator may confirm, diverge from, or implement BSKDL behavior through a different internal mechanism.

## Next

Proceed to **Phase 15.3M3 — Liblouis de-g2 Static Lexical Correspondence Audit**.
