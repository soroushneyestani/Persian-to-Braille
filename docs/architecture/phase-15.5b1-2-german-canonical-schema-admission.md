# Phase 15.5B1.2 — German Canonical Schema Admission

## Status

**SCHEMA_ADMITTED**

## Architectural decision

German specification materialization uses a two-layer model:

1. canonical normative specification,
2. executable runtime specification.

The canonical rule schema is therefore not the runtime-rule schema.

## Why

The Phase 15.1 Chapter 2 audit contains heterogeneous normative semantics:
character mappings, numeric state, case state, bounded emphasis scopes,
foreign-language spans, boundary behavior, structural rules, delegation,
host-policy boundaries, and deferred external dependencies.

Forcing those source rules directly into the existing Persian
`input/output` runtime shape would be lossy or would invent execution
semantics that have not yet been frozen.

## Canonical rule model

Each German canonical rule records:

- stable identity,
- introduction text mode,
- source-contract binding,
- normative/audit status,
- lossless semantic payload,
- runtime disposition,
- conformance links.

The source-specific semantic payload is preserved without loss.

## State and scope

State semantics are real and must be preserved.

This includes numeric state, capitalization/case state, bounded emphasis
scope, and foreign-language spans.

B1.2 does not define a generic executable `state` runtime rule type.

Typed state/runtime lowering belongs to B2/B3/B4.

## Runtime boundary

`RuntimeSpecificationBundle` remains unchanged.

The runtime bundle builder remains unchanged.

No German executable rule or runtime bundle is admitted here.

## German profile

The German canonical profile uses:

- `language = de`
- explicit `textMode`
- six-dot Braille
- no `region` field
- no numeric `grade` field

Regional configuration remains orthogonal.

Internal profile identity is deferred to B1.3.

Public profile identifiers remain `NOT_FROZEN`.

## Admission state

Schema files: **2**

Profile records: **0**

Canonical rule records: **0**

Runtime rule records: **0**

German runtime bundles: **0**

## Next

**15.5B1.3 — Basisschrift internal canonical profile materialization**
