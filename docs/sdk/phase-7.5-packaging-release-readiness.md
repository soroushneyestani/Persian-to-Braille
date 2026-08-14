# Phase 7.5 — Packaging & Release Readiness

## Status

**Phase 7.5: IMPLEMENTED**

This deliverable makes the Core/SDK package boundary verifiably ready for a
future public npm prerelease.

It does not publish anything.

## npm namespace

The public namespace is:

```text
@persian-braille
```

The intended packages are:

```text
@persian-braille/core
@persian-braille/sdk
```

The organization namespace has been prepared separately in npm.

## Distribution architecture

The release topology remains explicit:

```text
@persian-braille/core
        |
        v
@persian-braille/sdk
        |
        v
third-party consumers
```

Core is therefore also release-ready as a public package.

The SDK is not bundled with a second copy of Core.

This preserves the repository architecture:

```text
Specification -> Core -> SDK
```

## License

The repository and both publishable packages use:

```text
MIT
```

License files:

```text
LICENSE
packages/core/LICENSE
packages/sdk/LICENSE
```

The package validator requires all three files to remain byte-identical.

Package manifests use the SPDX identifier:

```json
"license": "MIT"
```

## Public package metadata

Both Core and SDK now carry explicit:

```text
description
license
author
homepage
repository
bugs
keywords
engines
publishConfig.access
```

The current prerelease version remains:

```text
2.0.0-dev
```

The packages are no longer marked private.

`publishConfig.access` is:

```text
public
```

The actual prerelease publication command must still pass the prerelease tag
explicitly:

```text
--tag next
```

This prevents an accidental development prerelease from becoming `latest`.

## Workspace dependency policy

The development SDK manifest deliberately keeps:

```json
"@persian-braille/core": "workspace:*"
```

This guarantees local workspace resolution during development.

pnpm replaces `workspace:*` with the corresponding workspace package version
when the package is packed or published.

Phase 7.5 verifies the packed SDK manifest and requires:

```text
@persian-braille/core = 2.0.0-dev
```

No `workspace:` protocol is allowed to survive into the packed manifest.

## Published-file boundary

Both packages continue to use:

```json
"files": [
  "dist"
]
```

The package validator verifies that tarballs contain the required package
metadata, README, MIT license, and compiled ESM/declaration output.

The TypeScript incremental build cache is deliberately kept outside `dist`:

```text
packages/core/.tsbuildinfo
packages/sdk/.tsbuildinfo
```

Those files are development-only compiler caches, are removed by each package
`clean` script, and are not part of the published package boundary.

It also rejects leaked:

```text
src/
test/
tests/
node_modules/
*.tsbuildinfo
```

The SDK tarball must include:

```text
dist/index.js
dist/index.d.ts
dist/public-api.js
dist/public-api.d.ts
dist/translator.js
dist/translator.d.ts
```

## SDK README

The SDK package README now documents:

```text
installation/package names
createPersianBrailleTranslator()
translate()
translateOrThrow()
PersianBrailleTranslationError
UNKNOWN_CHARACTER failure handling
Core dependency boundary
MIT license
```

This ensures the README rendered by npm describes the actual Phase 7 public
surface rather than the original empty SDK skeleton.

## Release-readiness validator

Validator:

```text
tools/sdk/validate-sdk-package.mjs
```

Root command:

```text
pnpm run validate:sdk-package
```

The command assumes Core and SDK have been built and then performs a real pack
validation.

The root command builds both packages before invoking the validator.

## Pack verification

The validator creates real Core and SDK tarballs in a temporary directory with:

```text
pnpm pack
```

It then:

```text
parses both tarballs
validates package contents
validates packed manifests
validates MIT licensing
validates public metadata
validates exports/types
validates workspace:* conversion
rejects source/test leakage
```

Temporary tarballs are removed after validation.

No tarball is tracked in Git.

## Isolated consumer smoke

The validator creates a temporary consumer project and installs the two packed
tarballs from local files.

A temporary `pnpm-workspace.yaml` in the isolated consumer pins the Core
dependency to the local Core tarball through pnpm's `overrides` setting, so
the smoke test does not depend on Core already existing in the npm registry.

pnpm 11 no longer reads pnpm settings from the `pnpm` field of `package.json`;
workspace settings such as `overrides` belong in `pnpm-workspace.yaml`.

The installed SDK is then imported by package name:

```js
import("@persian-braille/sdk")
```

All validator subprocesses are spawned without an implicit command shell.

For pnpm subprocesses, the validator reuses the pnpm CLI path supplied through
the package-script environment. Node-based pnpm entry points (`.js`, `.cjs`,
`.mjs`) are launched with the current Node runtime, while native executables
such as Windows `pnpm.exe` are spawned directly. Windows `.cmd`/`.bat` shims
are rejected rather than reintroducing an implicit shell.

This keeps argument boundaries intact on Windows and avoids the deprecated
`spawn(..., args, { shell: true })` pattern.

The isolated Node smoke also runs with `shell: false`, preserving the multiline
`node -e` source as one argument instead of letting `cmd.exe` reinterpret or
split it.

The smoke verifies:

```text
Persian translation
UNKNOWN_CHARACTER failure
selected SDK runtime surface
absence of representative Core internals
```

This is a package-level consumer test, not a source-tree import.

## CI enforcement

Architecture Validation is extended to react to:

```text
docs/sdk/**
tools/sdk/**
LICENSE
```

and runs:

```text
pnpm run validate:sdk-package
```

Existing `packages/**` workflow coverage already captures changes to the Core
and SDK package manifests/source.

## Publication policy

Phase 7.5 does not publish.

When a deliberate prerelease is approved after merge, the intended order is:

```text
1. @persian-braille/core
2. @persian-braille/sdk
```

and the explicit prerelease flags are:

```text
--access public
--tag next
```

The Core package must exist at the matching version before the SDK is made
available from the registry.

For a final `2.0.0` release, release policy can move to `latest` deliberately.

## Authentication boundary

Registry credentials are user/CI state and must not be committed.

No project-level auth token or `.npmrc` credential is introduced by this
deliverable.

## Artifacts

```text
LICENSE
packages/core/LICENSE
packages/sdk/LICENSE
packages/core/package.json
packages/sdk/package.json
packages/core/README.md
packages/sdk/README.md
tools/sdk/validate-sdk-package.mjs
package.json
.github/workflows/architecture-validation.yml
docs/sdk/phase-7.5-packaging-release-readiness.md
```

## Explicitly outside Phase 7.5

This deliverable does not:

```text
publish Core
publish SDK
create npm tokens
store npm credentials
change Braille mappings
change Core translation semantics
change profile governance
implement CLI/Web/Microsoft 365 behavior
```

## Handoff

The next deliverable is:

**Phase 7.6 — Phase 7 Closure**

Closure must run the complete repository, conformance, SDK consumer, and SDK
package fixed point, push the feature branch, obtain green CI, and merge only
after all required validation is green.
