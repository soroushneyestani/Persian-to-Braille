# Phase 15.5B4.4b — Contextual / Behavioral Lowering Model

Status: `PRIMARY_LOWERING_MODEL_FROZEN`

This artifact freezes the primary execution-IR classification for the final 36 German Basisschrift lowering candidates.

## Scope

- B2 `CONTEXTUAL`: 22
- B3 `BEHAVIORAL_CONSTRAINT`: 14
- B4.4 total: 36
- Prior B4.2: 25
- Prior B4.3: 62
- Exact partition: `25 + 62 + 36 = 123`

## Primary primitive counts

- `BEHAVIORAL_POLICY`: 11
- `CONTEXTUAL_FORM_SELECTION`: 8
- `CONTEXTUAL_APPLICATION`: 5
- `SPACING_BEHAVIOR`: 5
- `BOUNDARY_BEHAVIOR`: 4
- `AMBIGUITY_RESOLUTION`: 3

## Boundary

- Primary primitives adjudicated: yes
- Auxiliary primitives adjudicated: no
- Lowering materialized: no
- Executable specification generated: no
- German runtime generated: no
- German runtime registered: no
- Core modified: no
- Translator modified: no
- Persian runtime unchanged: yes

## Determinism

- Lowering-model canonical SHA-256: `0D429DD6C5A524A44A598C48954D05EFD70F49D1CE12394CE75D35A01CD7A68A`
- B4.4a discovery script SHA-256: `FCFF80DC0CD577FFCCFC8CF92659D386F1B7827665A5C186FDE233FF1ED1F0B9`
- B4.4a discovery output SHA-256: `0F9A12C414D2CB56269A835DD4EABBA949AFCFB8B0DD80CA0B47F46ECA8098F1`

## Next

`15.5B4.4c0_EXACT_AUXILIARY_SEMANTIC_ADJUDICATION_DISCOVERY`
