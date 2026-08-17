# Phase 13.5b — Unique Reverse Coverage Expansion

## Status

**MATERIALIZED / VALIDATION REQUIRED**

Phase 13.5a established that the reverse parser foundation is functional but
not ready for public Core root export because conformance coverage is sparse.

Initial audit:

```text
direct reversal candidates      16 total / 1 covered / 15 uncovered
parser-required rules            8 total / 2 covered / 6 uncovered
collision signatures            34 total / 7 covered / 27 uncovered
public Core export              NOT READY
```

Phase 13.5b closes deterministic non-collision coverage without changing
reverse parser semantics.

It adds independent reverse vectors for all 15 previously uncovered direct
candidates plus four parser-required rules already supported by longest-match:

```text
FA-G1-ORTHO-EZAFE-SEQUENCE-001
FA-G1-PUNC-ASTERISK-RUN-001
FA-G1-PUNC-ASTERISK-SINGLE-001
FA-G1-PUNC-SCALAR-011
```

The two remaining parser-required rules are deferred because they require
numeric-state behavior:

```text
FA-G1-NUM-FRACTION-SLASH-001
FA-G1-NUMRULE-002
```

The original 16 Phase 13.3 records remain the immutable foundation seed. The
manifest distinguishes `foundationSeedVectorIds` from the expanded `vectorIds`
inventory.

Expected coverage after this phase:

```text
direct reversal candidates      16 / 16
parser-required rules            6 / 8
collision signatures             7 / 34
```

Core root reverse export and the frozen SDK reverse API remain deferred.

Next:

```text
Phase 13.5c — Stateful Numeric and Collision Coverage
```
