# Phase 15.5B4.2b — German Basisschrift Direct / Structural Lowering Model

## Status

`DIRECT_STRUCTURAL_LOWERING_MODEL_FROZEN`

## Exact B4.2 scope

- B2 direct mapping: **1**
- B2 structural: **5**
- B3 structural: **19**
- B4.2 total: **25**

The twenty B3 indicator contracts observed during B4.2a discovery are not part
of B4.2. They remain assigned to B4.3.

## Remaining lowering-candidate partition

- B4.2 Direct + Structural: **25**
- B4.3 Indicator + State + Policy: **62**
- B4.4 Contextual + Behavioral: **36**
- Total: **123 / 123**

## Execution architecture

The existing `RuntimeSpecificationBundle` envelope remains reusable, but the
current Persian-oriented execution mechanics are not sufficient unchanged for
German structural semantics.

German B4 lowering therefore targets a derived `GERMAN_EXECUTION_IR`.

Canonical German rules must not be registered directly as runtime rules.

## B4.2 lowering primitives

- `DIRECT_SYMBOL_MAPPING`
- `STRUCTURAL_MARKER`
- `STRUCTURAL_CONSTRAINT`
- `DEPENDENCY_EDGE`

A rule may materialize more than one primitive.

## Direct mapping boundary

`DE-NUM-003` owns deterministic numeric symbol mappings, but its semantic
selection is not resolved in B4.2. Selection remains dependent on numeric
context classification.

## Runtime boundary

- Core modified: **false**
- Translator modified: **false**
- German runtime generated: **false**
- German runtime registered: **false**
- Persian runtime unchanged: **true**

## Deterministic identity

`BE6896C6DB8E5C955F78EA143B884E779E4B19515EC6C3A166A7B444B1E56A26`

## Next

`15.5B4.2c_DIRECT_STRUCTURAL_LOWERING_MATERIALIZATION`
