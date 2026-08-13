# Phase 6.2 — Conformance Domain Contract

## Status

**Phase 6.2: DOMAIN CONTRACT DEFINED**

This deliverable defines the machine-readable profile-scenario and report
contracts used by Phase 6.

It does not implement a scenario runner.

## Separation from canonical rule vectors

The existing Phase 2 conformance records remain unchanged:

```text
spec/fa-ir/conformance/records
```

Those 175 records are single-rule vectors and remain specification-owned.

Phase 6 introduces a separate profile-level scenario layer:

```text
conformance/scenarios        (Phase 6.4 corpus)
conformance/schema           (Phase 6.2 contracts)
tools/conformance            (Phase 6.3/6.5 execution/reporting)
```

A profile scenario may exercise multiple rules and engine layers through the
real forward translator.

It must not be materialized as a fake Phase 2 rule vector.

## Scenario lifecycle

Profile scenarios use an independent lifecycle:

```text
required
draft
```

`required` means the scenario is intended to gate Phase 6 CI.

`draft` means the scenario is executable/reportable but is not yet a required
CI gate.

This lifecycle has no normative-promotion meaning.

In particular:

```text
required scenario != normative Braille rule
draft scenario    != candidate Braille rule
scenario PASS     != normative promotion
```

## Scenario categories

The finite Phase 6 category vocabulary is:

```text
persian
sequence
numeric
latin
layout-normalization
mixed
negative
```

Additional detail belongs in lowercase hyphenated `tags`.

A new category requires an explicit contract revision instead of silently
appearing in scenario data.

## Scenario input

Every scenario input records:

```text
text
codePoints
```

The duplicated code-point representation is deliberate.

It provides an encoding-integrity assertion for committed fixtures and avoids
repeating the PowerShell literal-encoding ambiguity discovered during Phase
5.4.

The Phase 6 harness must reject a fixture whose `text` and `codePoints` do not
describe the same Unicode scalar sequence.

## Expected success

A success expectation contains exact profile output:

```text
kind = success
cells
unicodeBraille
structuralTokens
```

It may additionally assert:

```text
normalizedText
trace.ruleIdsInOrder
trace.requiredRuleIds
trace.forbiddenRuleIds
trace.engineTokenClassesInOrder
trace.requiredNormalizationRuleIds
```

Trace assertions are optional so scenarios can test only the execution
properties relevant to their purpose without snapshotting unrelated internal
detail.

## Expected failure

A failure expectation contains:

```text
kind = failure
code
```

The failure code vocabulary is aligned with the Phase 5 translation contract:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
UNKNOWN_SEQUENCE
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

A scenario may additionally assert:

```text
causeCode
messageIncludes
location
character
codePoint
candidateRuleIds
```

## Profile pinning

Every scenario pins:

```text
profile.id
profile.version
```

Phase 6 does not silently run a scenario against a different profile version.

## Scenario identifiers

Profile scenarios use:

```text
FA-PROFILE-CONF-...
```

This distinguishes them from existing canonical single-rule vector IDs:

```text
FA-CONF-...
```

## Report contract

The report contains:

```text
profile
scenarioSchemaVersion
summary
coverage
results
```

Summary counters:

```text
total
required
draft
passed
failed
```

Coverage dimensions:

```text
categories
lifecycles
expectationKinds
```

Each scenario result contains:

```text
id
lifecycle
category
expectationKind
status
diagnostics
```

## Deterministic reporting contract

Reports must be reproducible for the same repository state and scenario
corpus.

The report contract intentionally excludes:

```text
wall-clock timestamp
execution duration
random identifier
machine hostname
absolute filesystem path
```

Report results must be ordered by scenario ID before serialization.

JSON output must use UTF-8 and stable formatting.

## Fail-closed contract

Phase 6 harness/reporting must fail closed for:

```text
invalid scenario schema
duplicate scenario ID
profile ID/version mismatch
text/codePoints mismatch
unsupported scenario category/lifecycle
unexpected success/failure kind
output mismatch
trace assertion mismatch
report schema violation
```

No scenario may pass because an unsupported field was ignored; both schemas
use `additionalProperties: false`.

## Contract artifacts

```text
conformance/schema/profile-scenario.schema.json
conformance/schema/conformance-report.schema.json
docs/conformance/phase-6.2-domain-contract.md
```

Conceptual domain types represented by the schemas are:

```text
ConformanceScenario
ScenarioLifecycle
ScenarioCategory
ExpectedSuccess
ExpectedFailure
TraceExpectation
ScenarioResult
CoverageSummary
ConformanceReport
```

## Explicitly not implemented here

Phase 6.2 does not add:

```text
scenario runner
scenario fixtures
composition cases
negative corpus
coverage calculation
report generator
CI gate
Braille mappings
normative promotions
```

## Handoff

The next deliverable is:

**Phase 6.3 — Profile Scenario Harness**

It will validate scenario documents, verify Unicode input integrity, invoke the
real Core `ForwardTranslator`, compare typed expectations, and return
deterministic in-memory scenario results.

Report generation remains Phase 6.5.
