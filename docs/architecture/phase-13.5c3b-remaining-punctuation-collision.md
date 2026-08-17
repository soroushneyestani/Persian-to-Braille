# Phase 13.5c-3b — Remaining Punctuation Collision

## Status

**MATERIALIZED / VALIDATION REQUIRED**

Phase 13.5c-3b closes the final uncovered canonical Braille collision
signature.

The read-only behavior audit established the exact baseline:

```text
reverse vectors                139
canonical collision signatures 34
remaining collision signatures 23
```

The final collision is:

```text
Braille cell 23

FA-G1-PUNC-SCALAR-007  ;
FA-G1-PUNC-SCALAR-008  ؛
```

## Runtime decision

No parser semantic change is required.

The existing punctuation policy already resolves the collision correctly:

```text
default punctuationStyle   -> ؛
punctuationStyle=ascii     -> ;
ambiguityPolicy=error      -> AMBIGUOUS_REVERSE_MATCH
```

Successful canonicalization emits:

```text
CANONICALIZED_PUNCTUATION
```

The runtime behavior therefore remains unchanged and this subphase only
materializes independent reverse conformance plus validation evidence.

## Conformance expansion

Three translation vectors are added:

```text
FA-REV-CONF-COLLISION-PUNCTUATION-SEMICOLON-PERSIAN
FA-REV-CONF-COLLISION-PUNCTUATION-SEMICOLON-ASCII
FA-REV-CONF-COLLISION-PUNCTUATION-SEMICOLON-STRICT
```

Expected manifest:

```text
reverse vectors       142
translation vectors   140
capability vectors      2
```

After this subphase:

```text
canonical collision coverage 34 / 34
remaining collisions          0
```

## Public boundary

Core root reverse export remains deferred for this subphase.

The SDK reverse runtime remains deferred.

## Next

```text
Phase 13.5c-3c — Final Collision Coverage and Public Core Boundary Reassessment
```
