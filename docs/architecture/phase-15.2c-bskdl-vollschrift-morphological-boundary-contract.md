# Phase 15.2C — BSKDL Vollschrift Morphological Boundary Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Chapter: `3 Die Vollschrift`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter SHA-256: `a852e5acdf41910feb3cb1e91dceb9a7fbb9cecbb0a6db2766eed4d4c0df9e2a`
- PDF pages: `99–103`

## Boundary classes

Chapter 3 makes the following boundaries relevant to
contraction eligibility:

- compound-word seams,
- recognizable prefix/stem seams,
- recognizable stem/suffix seams.

## Core rule

A contraction candidate that crosses one of these
boundaries is rejected.

This must be modeled at candidate level rather than by
disabling contractions for the entire word.

## Compound examples

The source explicitly rejects cross-seam contractions in:

- `Wolgaufer`
- `Wegeunfall`
- `Nordseeinsel`
- `Comicheft`
- `Regierungschefin`
- `Dienstag`

## Prefix/stem examples

The source explicitly rejects the relevant contraction
across the derivational boundary in:

- `beurteilen`
- `geimpft`
- `eingeigelt`
- `Reimport`

## Suffix boundary distinction

The examples:

- `Gässchen`
- `Häschen`
- `Häuschen`

demonstrate an important candidate-local rule.

The `sch` candidate crosses the derivational boundary and
is rejected.

The `ch` candidate does not cross that same boundary and
remains permitted.

Therefore a rejected larger candidate must not suppress a
smaller independently eligible candidate.

## Architectural model

A future implementation may model candidates as source
spans.

A boundary crosses a candidate when it lies strictly
inside that span.

This span representation is an implementation model, not
a claimed BSKDL algorithm.

## Segmentation policy

BSKDL makes morphological segmentation normatively
relevant but does not define the software mechanism used
to discover those boundaries.

The segmentation provider therefore remains an explicit
open engineering policy.

## Coverage

- Formal rules: `10`
- Validation cases: `13`
- Compound examples: `6`
- Prefix/stem examples: `4`
- Suffix examples: `3`

## Promotion

No German translation behavior is executable yet.

## Next

Proceed to **Phase 15.2D — Pronunciation Eligibility Contract**.
