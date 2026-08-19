# Phase 15.3E — BSKDL Kurzschrift Einformige Wort- und Wortstammkürzungen Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Chapter: `4 Die Kurzschrift`
- Section: `4.3`
- Section SHA-256: `b3c778d76e6caf289aa11c8c340262a355eff08a93c0c3253ba81e6206977c15`

## Coverage

- Subsections: `5 / 5`
- §4.3.1 mappings: `19`
- §4.3.2 mappings: `22`
- §4.3.3 mappings: `3`
- §4.3.4 mappings: `3`
- §4.3.5 mappings: `6`
- Mapping definitions: `53`
- Formal rules: `27`
- Validation cases: `103`
- Six-dot validation: `PASS`

## Standalone six-dot sign-space accounting

- Standalone mappings from §§4.3.1–4.3.4: `47`
- Standalone Lautgruppe words: `6`
- Total standalone word signs: `53`
- Excluded standalone signs: `10`
- Nonblank six-dot cells: `63 / 63`
- Sign-space partition: `PASS`

## Important structural distinction

The source's `53` standalone word signs must not be confused with the `53` mapping definitions across §§4.3.1–4.3.5.

The standalone `53` are `47` mappings from §§4.3.1–4.3.4 plus `6` standalone Lautgruppenkürzungen.

§4.3.5 contributes six additional extension-only word-stem definitions.

## §4.3.5 cell reuse

- Extension-only cells reusing existing standalone word-sign cells: `5 / 6`
- Extension-only cells originating from the standalone-excluded set: `1 / 6`

## Formal rules

| ID | Section | Kind |
|---|---|---|
| DE-KURZ-EIN-001 | 4.3 | STANDALONE_WORD_SIGN_COUNT |
| DE-KURZ-EIN-002 | 4.3 | STANDALONE_EXCLUDED_CELL_SET |
| DE-KURZ-EIN-003 | 4.3 | LAUTGRUPPE_AS_WORD |
| DE-KURZ-EIN-004 | 4.3 | ICH_PUNCTUATION_RESTRICTION |
| DE-KURZ-EIN-005 | 4.3 | VOLLSCHRIFT_LAUTGRUPPE_WORD_DISAMBIGUATION |
| DE-KURZ-EIN-006 | 4.3 | TWO_FORM_LAUTGRUPPE_NOT_STANDALONE |
| DE-KURZ-EIN-007 | 4.3.1 | STANDALONE_ONLY_INVENTORY |
| DE-KURZ-EIN-008 | 4.3.1 | STANDALONE_ONLY_SCOPE |
| DE-KURZ-EIN-009 | 4.3.1 | NONSTANDALONE_FALLBACK |
| DE-KURZ-EIN-010 | 4.3.1 | APOSTROPHIZED_ATTACHMENT_EXCEPTION |
| DE-KURZ-EIN-011 | 4.3.1 | IM_HYPHEN_DISAMBIGUATION |
| DE-KURZ-EIN-012 | 4.3.2 | MARKABLE_WORD_CONTRACTION_INVENTORY |
| DE-KURZ-EIN-013 | 4.3.2 | POINT2_EXTENSION_OR_COMPOSITION_MARKER |
| DE-KURZ-EIN-014 | 4.3.2 | PREPOSITION_COMBINATION_POINT2 |
| DE-KURZ-EIN-015 | 4.3.2 | APOSTROPHE_SUPPRESSES_POINT2 |
| DE-KURZ-EIN-016 | 4.3.2 | RELATED_TWO_FORM_FORMS |
| DE-KURZ-EIN-017 | 4.3.3 | RESTRICTED_WORD_INITIAL_INVENTORY |
| DE-KURZ-EIN-018 | 4.3.3 | STANDALONE_OR_RESTRICTED_INITIAL_NO_POINT2 |
| DE-KURZ-EIN-019 | 4.3.3 | IHR_SEIN_INITIAL_CONTINUATION |
| DE-KURZ-EIN-020 | 4.3.3 | WAR_INITIAL_CONTINUATION |
| DE-KURZ-EIN-021 | 4.3.4 | UNANNOUNCED_FLEXIBLE_INVENTORY |
| DE-KURZ-EIN-022 | 4.3.4 | UNANNOUNCED_STANDALONE_ENDING_COMPOSITION |
| DE-KURZ-EIN-023 | 4.3.5 | EXTENSION_ONLY_STEM_INVENTORY |
| DE-KURZ-EIN-024 | 4.3.5 | EXTENSION_REQUIRED |
| DE-KURZ-EIN-025 | 4.3.5 | STANDALONE_OR_APOSTROPHE_SPELLOUT |
| DE-KURZ-EIN-026 | 4.3.5 | ERGÄNZUNGSSTRICH_PLACEHOLDER |
| DE-KURZ-EIN-027 | 4.3.5 | WUERD_UEBRIG_COLLISION |

## Open executable dependencies

- `MORPHOLOGICAL_EXTENSION_AND_COMPOSITION_PROVIDER`
- `PUNCTUATION_SEMANTIC_CLASSIFIER`
- `APOSTROPHE_TOKENIZATION_POLICY`
- `HYPHEN_BOUNDARY_INPUT_POLICY`
- `SECTION_4_4_TWO_FORM_CONTRACTION_INVENTORY`

## Promotion state

- Formal §4.3 audit: `COMPLETE`
- Executable specification: `NOT READY`
- Runtime generalization: `NOT READY`
- Core implementation: `NOT STARTED`
- SDK implementation: `NOT STARTED`
- Office integration: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3F — Kurzschrift Zweiformige Kürzungen Audit** for §4.4.
