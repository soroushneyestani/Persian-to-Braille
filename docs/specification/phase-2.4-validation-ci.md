# Phase 2.4 — Negative Validation Fixtures and CI Gate

Phase 2.4 makes the Phase 2 specification checks executable in continuous
integration.

The positive validator from Phase 2.3 proves that the current candidate package
is internally consistent. The negative suite proves the complementary property:
known-invalid packages are rejected for the intended reason.

## Negative fixtures

All fixtures are created in temporary repository-shaped sandboxes. The working
repository is never mutated.

The suite currently injects five independent defects:

1. dot 7 in the six-dot `fa-ir-g1` profile;
2. a broken rule-to-conformance-vector reference;
3. an unregistered source ID;
4. a Unicode Braille rendering inconsistent with the declared dot cells;
5. an invalid precedence relationship between the audited `*` and `***` rules.

Each fixture must make the validator exit non-zero, emit the validator `FAIL`
marker, and include the expected invariant-specific diagnostic.

## CI gate

`.github/workflows/specification-validation.yml` runs on relevant pushes,
pull requests, and manual dispatch.

The CI job:

- checks out the repository with read-only credentials;
- installs Python 3.13;
- installs the pinned specification-validation dependency set;
- regenerates Phase 2.1 schemas;
- regenerates the Phase 2.2 candidate package;
- runs the independent Phase 2.3 validator;
- runs all Phase 2.4 negative fixtures;
- fails if tracked generated specification artifacts differ after regeneration.

The workflow supplies the CI check needed for repository protection. A
workflow by itself does not block merging: after the check has run at least
once, the `main` branch must require this status check through a repository
ruleset or branch-protection rule.

The `pull_request` trigger intentionally has no path filter. Once a check is
required, every pull request must cause that check to report a result; otherwise
an unrelated pull request can remain blocked waiting for a required check that
never ran.

The workflow also includes `merge_group` so the same required check remains
compatible with a future GitHub merge queue.

## Security boundary

The workflow grants only `contents: read`.

Third-party GitHub Actions are pinned to full commit SHAs. The comments beside
those SHAs identify the reviewed upstream release versions.

The negative fixture runner executes only repository-owned Python against
temporary copies of repository data. It does not fetch or execute fixture code
from external sources.

## Normative status

A green CI gate proves structural consistency, traceability, reproducibility,
and rejection of the covered invalid states. It does not make any candidate
Persian Braille rule normative.

Normative promotion remains a separate explicit specification decision.


## Repository protection gate

After the workflow has completed successfully on GitHub at least once, configure
a branch ruleset targeting `main` and enable **Require status checks to pass
before merging**.

Select the check produced by the job named:

`Validate Persian Braille specification`

Only after that repository rule is active is the Phase 2.4 workflow a
merge-blocking CI gate rather than an advisory CI check.
