# Phase 6.3 — Profile Scenario Harness

## Status

**Phase 6.3: IMPLEMENTED**

This deliverable implements deterministic execution of valid Phase 6
profile-level scenarios through the real Core forward translator.

It does not add the Phase 6.4 committed scenario corpus.

## Machine-readable schema validation

The harness loads:

```text
conformance/schema/profile-scenario.schema.json
```

and validates scenario documents before translation.

No external JSON Schema dependency is required.

The harness implements the finite JSON Schema features used by the Phase 6.2
contract, including:

```text
$ref
oneOf
type
const
enum
pattern
minLength
minimum
required
properties
additionalProperties
propertyNames
items
uniqueItems
```

Unsupported fixture fields therefore do not pass silently.

## Configuration failures versus conformance failures

The harness distinguishes invalid test data from a valid scenario whose system
behavior does not meet its expectation.

Configuration/harness errors throw `ProfileScenarioHarnessError`.

Current configuration error codes include:

```text
INVALID_SCENARIO
INVALID_SCENARIO_SET
DUPLICATE_SCENARIO_ID
PROFILE_MISMATCH
UNICODE_INPUT_MISMATCH
```

A valid scenario with an output/trace mismatch does not throw. It returns:

```text
status = fail
diagnostics = [...]
```

This distinction is required so report generation can separate invalid corpus
configuration from actual conformance failures.

## Unicode fixture integrity

Before translation, the harness derives Unicode scalar values from
`input.text` and compares them exactly with:

```text
input.codePoints
```

This makes fixture encoding corruption fail closed.

Code-point rendering uses uppercase `U+...` notation with a minimum of four
hexadecimal digits.

## Profile pinning

Every scenario must match the bundled runtime profile:

```text
profile.id
profile.version
```

A stale fixture does not silently execute against a different profile.

## Real Core execution

The harness invokes:

```text
createForwardTranslator()
```

from the built Core package.

It does not duplicate:

```text
Unicode preprocessing
rule matching
precedence
numeric state
Latin state
Braille output assembly
translation failure behavior
```

Those remain Core responsibilities.

## Success comparison

Required exact success comparisons:

```text
cells
unicodeBraille
structuralTokens
```

Optional assertions:

```text
normalizedText
trace.ruleIdsInOrder
trace.requiredRuleIds
trace.forbiddenRuleIds
trace.engineTokenClassesInOrder
trace.requiredNormalizationRuleIds
```

This supports both exact execution scenarios and narrower composition
invariants without snapshotting every internal detail.

## Failure comparison

Failure scenarios compare:

```text
code
```

and may additionally compare:

```text
causeCode
messageIncludes
location
character
codePoint
candidateRuleIds
```

Unexpected success is a conformance failure.

Unexpected failure is a conformance failure.

## Determinism

`runProfileScenarios()`:

```text
rejects duplicate IDs
sorts scenarios by ID
returns results in deterministic ID order
```

No timing, hostname, random value, or filesystem path enters the result.

## Harness verification

The committed harness regression test covers:

```text
Persian success execution
multi-rule numeric composition
unknown-character failure
unknown-format-control failure
deterministic mismatch diagnostics
schema additional-property rejection
text/codePoints mismatch rejection
profile mismatch rejection
duplicate-ID rejection
deterministic scenario-set ordering
```

The regression fixtures are in-memory harness tests.

They are not the Phase 6.4 profile conformance corpus.

## Artifacts

```text
tools/conformance/profile-scenario-harness.mjs
tools/conformance/profile-scenario-harness.test.mjs
docs/conformance/phase-6.3-profile-scenario-harness.md
```

## Explicitly outside Phase 6.3

This deliverable does not add:

```text
committed profile scenario JSON fixtures
composition coverage requirements
negative corpus requirements
machine-readable report generation
coverage aggregation
CI enforcement
Braille mappings
normative promotions
```

## Handoff

The next deliverable is:

**Phase 6.4 — Composition & Negative Suites**

It will create the finite committed `conformance/scenarios` corpus using this
harness and the Phase 6.2 schema.
