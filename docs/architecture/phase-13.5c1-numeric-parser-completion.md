# Phase 13.5c-1 — Numeric Parser Completion

## Status

**MATERIALIZED / VALIDATION REQUIRED**

Phase 13.5c audit found two remaining parser-required numeric rules:

```text
FA-G1-NUM-FRACTION-SLASH-001
FA-G1-NUMRULE-002
```

This subphase adds only the missing stateful numeric behavior for those two
rules. It does not change the public Core boundary.

### Numeric begin

`FA-G1-NUMRULE-002` maps print `#` to Braille `3456 4` when followed by a
digit. Reverse parsing recognizes that full sequence before the generic numeric
indicator, emits `#`, enters numeric mode, and requires an admitted digit next.

### Numeric fraction separator

`FA-G1-NUM-FRACTION-SLASH-001` maps `/` to cell `34` between digits. Reverse
parsing accepts it only after a numeric digit and only when another admitted
digit follows, while keeping numeric mode active.

Two reverse vectors are added:

```text
FA-REV-CONF-STATE-NUMERIC-BEGIN-001
FA-REV-CONF-STATE-NUMERIC-FRACTION-001
```

Expected state after validation:

```text
PARSER_RULE_REQUIRED coverage = 8 / 8
reverse vectors               = 37
translation vectors           = 35
capability vectors            = 2
```

Core root reverse export and SDK reverse API remain deferred.

Next:

```text
Phase 13.5c-2 — Numeric Collision Coverage
```
