# Persian Braille Whitespace and Layout Audit

Audit stage: **1.6**

This stage separates whitespace translation evidence from document-layout and host-integration concerns.

It does **not** define Word, Excel, or PowerPoint adapter behavior. Office-host rules belong to a later integration specification.

## Summary

- `auditedCases`: 27
- `sharedSpacesUtilityCases`: 26
- `spacesUtilityStableDraftDifferences`: 0
- `persianLocalOverrideCasesStable`: 2
- `persianLocalOverrideCasesDraft`: 2
- `persianStableDraftOverrideDifferences`: 1
- `normativeDecisionsPending`: 27
- `hostIntegrationDecisionsPending`: 27

## Shared Liblouis space utility

The pinned stable and draft revisions contain byte-identical `spaces.uti` files. The utility maps ordinary spaces, tabs, CR/LF, Unicode space characters, line/paragraph separators, and U+2800 to empty Braille cell value `0`. It additionally removes or corrects selected zero-width formatting characters.

## Persian-specific overrides

- U+00A0 NBSP: the shared utility has `0`, while both Persian tables define local virtual-dot value `a`; the external Persian audit states that this preserves the no-break distinction for integrations.
- U+200C ZWNJ: stable defines dot `8`; draft suppresses it with a context rule. This difference was already identified in Stage 1.3 and is retained here because it directly affects spacing/layout semantics.

## Matrix

| ID | Code point | Label | Class | spaces.uti | Stable local | Draft local | Normative | Host |
|---|---|---|---|---|---|---|---|---|
| FA-WS-001 | `U+0020` | SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-002 | `U+0009` | CHARACTER TABULATION | `layout-control` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-003 | `U+000A` | LINE FEED | `line-boundary-candidate` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-004 | `U+000B` | LINE TABULATION | `layout-control` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-005 | `U+000C` | FORM FEED | `layout-control` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-006 | `U+000D` | CARRIAGE RETURN | `line-boundary-candidate` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-007 | `U+00A0` | NO-BREAK SPACE | `nonbreaking-inline-spacing` | `0` | `local-space-rule:a` | `local-space-rule:a` | `pending` | `pending` |
| FA-WS-008 | `U+2000` | EN QUAD | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-009 | `U+2001` | EM QUAD | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-010 | `U+2002` | EN SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-011 | `U+2003` | EM SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-012 | `U+2004` | THREE-PER-EM SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-013 | `U+2005` | FOUR-PER-EM SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-014 | `U+2006` | SIX-PER-EM SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-015 | `U+2007` | FIGURE SPACE | `nonbreaking-inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-016 | `U+2008` | PUNCTUATION SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-017 | `U+2009` | THIN SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-018 | `U+200A` | HAIR SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-019 | `U+200B` | ZERO WIDTH SPACE | `format-layout-control` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-020 | `U+2028` | LINE SEPARATOR | `line-boundary-candidate` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-021 | `U+2029` | PARAGRAPH SEPARATOR | `paragraph-boundary-candidate` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-022 | `U+202F` | NARROW NO-BREAK SPACE | `nonbreaking-inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-023 | `U+205F` | MEDIUM MATHEMATICAL SPACE | `inline-spacing` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-024 | `U+2060` | WORD JOINER | `format-layout-control` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-025 | `U+2800` | BRAILLE PATTERN BLANK | `braille-space` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-026 | `U+FEFF` | ZERO WIDTH NO-BREAK SPACE / BOM | `format-layout-control` | `0` | `—` | `—` | `pending` | `pending` |
| FA-WS-027 | `U+200C` | ZERO WIDTH NON-JOINER | `shaping-control` | `—` | `local-space-rule:8` | `ignored-by-context-rule` | `pending` | `pending` |

## Architectural consequence candidate

A platform-neutral core should distinguish textual translation units from layout structure. A future adapter should not be forced to convert every tab, line break, paragraph break, or no-break distinction into an ordinary Braille cell before translation.

This is an architectural candidate derived from the evidence, not yet a normative Persian Braille rule.

## Deferred

- exact Word paragraph/run extraction behavior
- Excel cell boundaries, formulas, and line breaks
- PowerPoint text frames and paragraph boundaries
- HTML/CSS white-space handling in the web playground
- embossing line-width and pagination policy
- line wrapping and hard-vs-soft break semantics
