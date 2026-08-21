# Phase 15.5B4.3b — Indicator / State / Policy Lowering Model

Status: `INDICATOR_STATE_POLICY_LOWERING_MODEL_FROZEN`

## Scope

- B4 lowering candidates: **123**
- B4.3 rules: **62**
- B2 STATEFUL: **8**
- B3 INDICATOR: **20**
- B3 STATE_SCOPE: **12**
- B3 POLICY_SELECTION: **22**

## Primary lowering primitives

| Source classification | Primary primitive | Count |
|---|---|---:|
| B2 STATEFUL | `STATE_MACHINE_TRANSITION` | 8 |
| B3 INDICATOR | `INDICATOR_EMISSION` | 20 |
| B3 STATE_SCOPE | `STATE_SCOPE_CONTROL` | 12 |
| B3 POLICY_SELECTION | `POLICY_SELECTION` | 22 |

Primary classification does not prohibit auxiliary primitives.

Auxiliary primitives are not frozen from heuristic text matching.
They require exact canonical semantic adjudication in the next step.

## Execution boundary

- Lowering materialized: **false**
- State machine implemented: **false**
- Indicator emission implemented: **false**
- Scope runtime implemented: **false**
- Policy resolver implemented: **false**
- Core modified: **false**
- Translator modified: **false**
- Executable specification generated: **false**
- German runtime generated: **false**
- German runtime registered: **false**
- Persian runtime unchanged: **true**

## Determinism

Lowering model canonical SHA-256:

`D2D0911E26EF4652A83CDE5157CBB622861BAAB0EF8FC449783C5AED289B4266`

Scope bindings canonical SHA-256:

`188970728D5F8E704823B85E87579E55C46C124959FCE535942BF25C57CF638A`

## Next

`15.5B4.3c_EXACT_SEMANTIC_ADJUDICATION`
