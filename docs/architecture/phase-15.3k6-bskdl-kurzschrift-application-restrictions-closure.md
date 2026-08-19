# Phase 15.3K6 — BSKDL Kurzschrift §4.9 Application Restrictions Closure

Status: **PASS WITH RUNTIME DEPENDENCIES**

Canonical decision:

```text
SECTION_4_9_APPLICATION_RESTRICTIONS
FORMALLY_RESOLVED
```

## Source coverage

- §4.9.1 — Vollschrift prohibition inheritance: `COMPLETE`
- §4.9.2 — Wortfugen: `COMPLETE`
- §4.9.3 — Eigennamen: `COMPLETE`
- §4.9.4 — Wortstämme: `COMPLETE`
- §4.9.5 — Prä-/Suffixe: `COMPLETE`

## Aggregated coverage

- Restriction families: `5`
- Formal rules: `18`
- Unique formal rule IDs: `18`
- Validation cases: `91`
- Unique validation case IDs: `91`

## Canonical restriction families

1. Vollschrift contraction-prohibition inheritance
2. Wortfuge prohibition
3. Proper-name restrictions
4. Word/stem restrictions
5. Prefix/suffix boundary restrictions

## Incoming deferred dependencies

The previously deferred `SECTION_4_9_APPLICATION_RESTRICTIONS` dependency is now formally resolved for:

- `15.3F` — Zweiformige Kürzungen
- `15.3G` — Komma-Kürzungen
- `15.3H` — Umlautungspunkt

This resolution applies to the normative source audit. It does **not** mean that the runtime implementation is complete.

## Preserved precision

- §4.9.3 `wird nicht gekürzt` and §4.9.4 `sollte nicht gekürzt werden` remain distinct.
- `offensichtlich erhalten` and `eindeutig erhalten` remain distinct.
- The Doppelkonsonant exception does not create a mandatory contraction rule.
- `KOMM` and `LETZT` are explicit historical exceptions; `GE/genau` remains rationale-only.
- §4.9.5 doubt handling continues to delegate to §4.1.2.4.

## Runtime precedence

No complete total runtime precedence order is inferred from §4.9.

A deterministic executable evaluation model must be materialized later while preserving all source-backed prohibitions, exceptions, delegations, and modality distinctions.

## Promotion state

- §4.9 formal source audit: `COMPLETE`
- `SECTION_4_9_APPLICATION_RESTRICTIONS`: `FORMALLY_RESOLVED`
- Runtime dependencies: `OPEN`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- SDK implementation: `NOT STARTED`
- Office integration: `NOT STARTED`
- Conformance promotion: `NOT READY`
- Profile IDs: `NOT FROZEN`

## Next

Proceed to **Phase 15.3L — Kurzschrift Cross-Artifact Consistency and Taxonomy Audit**.
