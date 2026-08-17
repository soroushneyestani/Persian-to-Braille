# Phase 13.6c — SDK Documentation and Closure

## Status

Phase 13.6 documentation closure. This milestone documents the public reverse
SDK introduced in Phase 13.6b and makes the historical Phase 12 documentation
validator compatible with the later additive API.

## Baseline

- Branch: `phase13-reverse-translation`
- Baseline HEAD: `aa5ce927d218ab2535d93e7b1e36d2fdb7a97317`
- Phase 13.5c-3c2 public Core reverse boundary: closed.
- Phase 13.6b reverse SDK runtime/type materialization: green.
- Canonical SDK reverse contract: Phase 13.2.

## Public documentation result

`packages/sdk/README.md` now documents:

- the two reverse runtime exports;
- all fourteen frozen public reverse types;
- both translation methods;
- factory defaults and per-call option overrides;
- four option policies;
- eight expected failure codes;
- six diagnostic codes;
- lossy/canonical reconstruction semantics;
- the SDK-owned throwing error.

The historical Phase 12 architecture records are not rewritten. They remain
accurate descriptions of what Phase 12 did and did not include.

## Validator composition

`validate-phase12-5-developer-docs.mjs` continues to validate all historical
forward SDK documentation guarantees, but its check against the living package
README is milestone-composable: it now requires the Phase 13.6 reverse API
instead of requiring the README to keep stale Phase 12 deferral wording.

## Audit archival

The Phase 13.6a/a1/a2/a3 and 13.6c read-only audit outputs are archived under
`docs/architecture/` so the repository root does not retain transient audit
artifacts.

## Scope preservation

This step does not alter:

- Core reverse execution semantics;
- the pre-existing forward SDK implementation files;
- CLI behavior;
- Web behavior;
- Microsoft 365 behavior;
- Phase 14+ domains.

## Exit

A green `validate:phase13-6c` means the SDK reverse API and its current public
documentation are complete and Phase 13 is ready for the final phase-wide
closure audit.
