# Phase 15.3M5B — WSL Ubuntu 22.04 Distribution Provisioning Plan

Status: **PASS**

Mode: **PLAN BEFORE INSTALL**

Role: **NON-NORMATIVE COMPARATOR**

## Selected distribution

```text
Frozen CI runner:      ubuntu-22.04
WSL distro:            Ubuntu-22.04
WSL target version:    2
Exact runner match:    YES
Currently installed:   NO
Provisioned:           NO
```

## Planned install command

```powershell
wsl.exe --install -d Ubuntu-22.04 --no-launch
```

The command is recorded here but has not been executed by this phase.

## Identity freeze

Before installing build packages, the distribution identity and architecture must be captured.

Expected:

```text
Ubuntu 22.04
x86_64
WSL 2
```

## Frozen workflow package set

```text
autoconf
automake
curl
libtool
make
mingw-w64
pkg-config
texinfo
wine64
zip
patch
jq
```

Package count: `12`

No packages are installed in M5B.

## Build isolation

The original frozen Liblouis checkout must remain Git-clean.

Future build work must use a disposable audit-cache build area.

## Next

Proceed to **Phase 15.3M5C — Controlled WSL Ubuntu 22.04 Provisioning and Identity Freeze**.
