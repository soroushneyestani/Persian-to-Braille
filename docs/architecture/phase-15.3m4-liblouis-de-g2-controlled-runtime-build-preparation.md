# Phase 15.3M4 — Liblouis de-g2 Controlled Frozen Runtime Build Preparation

Status: **PASS**

Role: **NON-NORMATIVE COMPARATOR**

## Decision

```text
Prebuilt frozen runtime:      NOT AVAILABLE
Controlled build required:    YES
Selected recipe:              FROZEN_CI_MINGW_WORKFLOW
Target:                       x86_64-w64-mingw32
Native PowerShell build:      NOT SELECTED
Build performed:              NO
Installation performed:       NO
Runtime translation:          NOT STARTED
```

## Frozen build recipe

The selected recipe is the MinGW CI workflow contained in the frozen Liblouis commit.

Core sequence:

```text
POSIX build environment
        ↓
Autoconf / Automake / Libtool
        ↓
x86_64-w64-mingw32 toolchain
        ↓
./autogen.sh
        ↓
./configure --host x86_64-w64-mingw32 --enable-ucs4 ...
        ↓
make ...
        ↓
make check WINE=wine64
        ↓
isolated audit runtime
```

## Isolation policy

No build output may be written into the Braille Hub repository.

No system-wide Liblouis installation is permitted for the comparator audit.

The frozen Liblouis checkout must remain unchanged and Git-clean.

Build/install areas:

```text
<AuditCache>/liblouis-runtime-build
<AuditCache>/liblouis-runtime-prefix
```

## Comparator boundary

```text
Frozen runtime output = comparator evidence
Frozen runtime output ≠ normative BSKDL authority
```

## Next

Proceed to **Phase 15.3M5A — Local Execution Environment Capability Discovery**.

That diagnostic will choose between WSL, MSYS2/Git Bash, Docker, or another compatible local POSIX execution path without installing anything.
