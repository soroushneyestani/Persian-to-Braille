# Phase 15.5A4.1 — Existing Mode Machinery Audit

## Status

**CLOSED**

Baseline:

`b7e7e28cea6cabd0ee39e3a8c7d08cf7af1a18e0`

## Principal finding

The existing Core concept named `mode` is **not** the German text-mode
selection concept.

The existing `ModeRuleExecutor` performs structural rule execution over
`EngineTokenClass` values. It is part of the Persian forward execution
pipeline.

German text-mode selection is a separate translation-configuration
dimension.

Therefore:

`STRUCTURAL_RULE_MODE != GERMAN_TEXT_MODE`

## Existing Persian structural mode machinery

Current structural mode-rule inventory:

`5`

The current executor requires exactly five structural mode rules.

Current rules:

- `FA-G1-LATIN-MODE-001` → `latin-character-class`
- `FA-G1-LATIN-MODE-002` → `latin-span-begin`
- `FA-G1-LATIN-MODE-003` → `latin-span-end`
- `FA-G1-LATIN-MODE-004` → `latin-capital-indicator`
- `FA-G1-NUMRULE-001` → `numeric-indicator`

These rules remain untouched by A4.1 and A4.2.

## German text-mode identity

The frozen German text-mode inventory remains:

- `basisschrift`
- `vollschrift`
- `kurzschrift`

Exactly one German text mode is selected for a translation request.

The preferred internal term is:

`GermanTextMode`

This naming deliberately avoids collision with the existing structural
rule type named `mode`.

## Swiss separation

Swiss configuration is not a German text mode.

It remains an orthogonal regional configuration dimension and must not
be represented as a fourth value of `GermanTextMode`.

## Forward boundary finding

The existing forward translator accepts:

`translate(inputText: string)`

There is currently no German text-mode selection argument.

The Core selection boundary is therefore a later A4 concern and is owned
by Phase 15.5A4.4.

## Schema finding

The current Persian profile and rule schemas are not reusable as German
schemas without specialization.

The profile schema is Persian-specific, including:

- language fixed to `fa`,
- region fixed to `IR`,
- Persian/FA-namespaced rule references.

The rule schema is also Persian-specific and its rule type `mode`
represents a structural execution-rule category, not Basisschrift,
Vollschrift, or Kurzschrift selection.

A4 must not mutate the Persian schemas merely to admit German text modes.

## Scope lock

A4.1 does not:

- modify Persian execution,
- add German mappings,
- add German executable rules,
- add German generated bundles,
- resolve Swiss explicit ß behavior,
- freeze public German or Swiss identifiers,
- define the public SDK,
- add German reverse translation.

## Next

**Phase 15.5A4.2 — German Mode Identity Contract**
