# Phase 15.3D — BSKDL Kurzschrift Prefix/Suffix Contractions Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Chapter: `4 Die Kurzschrift`
- Section: `4.2`
- Section SHA-256: `4dcd68e8ebd4b2b2b3a4de76641aacc649feb3fd37556e69a8810c23e2527310`

## Coverage

- Subsections: `2 / 2`
- Mappings: `11`
- Prefix mappings: `2`
- Post-stem mappings: `9`
- Formal rules: `16`
- Validation cases: `69`
- Six-dot validation: `PASS`

## Mapping inventory

| Print | Braille | Dots | Role |
|---|---|---|---|
| ENT- | ⠮⠤ | 2346+36 | PREFIX_BEFORE_STEM |
| VER- | ⠤⠤ | 36+36 | PREFIX_BEFORE_STEM |
| -FALLS | ⠠⠤⠋ | 6+36+124 | AFTER_STEM |
| -HEIT | ⠠⠤⠓ | 6+36+125 | AFTER_STEM |
| -KEIT | ⠠⠤⠅ | 6+36+13 | AFTER_STEM |
| -MAL | ⠠⠤⠍ | 6+36+134 | AFTER_STEM |
| -NIS | ⠠⠤⠭ | 6+36+1346 | AFTER_STEM |
| -SAM | ⠠⠤⠮ | 6+36+2346 | AFTER_STEM |
| -SCHAFT | ⠠⠤⠱ | 6+36+156 | AFTER_STEM |
| -UNG | ⠠⠤⠥ | 6+36+136 | AFTER_STEM |
| -WÄRTS | ⠠⠤⠺ | 6+36+2456 | AFTER_STEM |

## Formal rules

| ID | Section | Kind |
|---|---|---|
| DE-KURZ-STEM-001 | 4.2.1 | PREFIX_CONTRACTION_INVENTORY |
| DE-KURZ-STEM-002 | 4.2.1 | PREFIX_WORD_INITIAL_ONLY |
| DE-KURZ-STEM-003 | 4.2.1 | PREFIX_SEMANTIC_REQUIREMENT |
| DE-KURZ-STEM-004 | 4.2.1 | PREFIX_WORD_INTERIOR_PROHIBITION |
| DE-KURZ-STEM-005 | 4.2.1 | VER_AFTER_HYPHEN_PROHIBITION |
| DE-KURZ-STEM-006 | 4.2.2 | POST_STEM_CONTRACTION_INVENTORY |
| DE-KURZ-STEM-007 | 4.2.2 | POST_STEM_PLACEMENT |
| DE-KURZ-STEM-008 | 4.2.2 | SUFFIX_REQUIREMENT_EXCEPT_MAL |
| DE-KURZ-STEM-009 | 4.2.2 | SUFFIX_STACKING |
| DE-KURZ-STEM-010 | 4.2.2 | SUFFIX_ENDING_EXTENSION |
| DE-KURZ-STEM-011 | 4.2.2 | COMPOUND_WORD_INTERIOR_POLICY |
| DE-KURZ-STEM-012 | 4.2.2 | HEIT_LEXICAL_EXCEPTIONS |
| DE-KURZ-STEM-013 | 4.2.2 | SCHAFT_LEXICAL_EXCEPTIONS |
| DE-KURZ-STEM-014 | 4.2.2 | MAL_LEXICAL_EXCEPTION_SET |
| DE-KURZ-STEM-015 | 4.2.2 | FALLS_VS_FALL_COMPOUND_DISTINCTION |
| DE-KURZ-STEM-016 | 4.2.2 | WORD_SEAM_RESTRICTION |

## Important policies

`ENT-` and `VER-` are word-initial prefix contractions before stems.

The nine §4.2.2 forms operate after stems; all except `MAL` require suffix status.

Applicable suffix forms may stack and take endings.

`MAL` and `WÄRTS` are excluded from the general compound-interior permission.

## Executability

Morphological interpretation remains an explicit runtime dependency.

- `MORPHOLOGICAL_SEGMENTATION_PROVIDER`
- `PREFIX_SUFFIX_BOUNDARY_RESOLUTION_POLICY`
- `COMPOUND_WORD_BOUNDARY_PROVIDER`

## Promotion state

- Formal §4.2 audit: `COMPLETE`
- Executable specification: `NOT READY`
- Runtime generalization: `NOT READY`
- Core implementation: `NOT STARTED`
- SDK implementation: `NOT STARTED`
- Office integration: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3E — Einformige Wort- und Wortstammkürzungen Audit** for §§4.3–4.3.5.
