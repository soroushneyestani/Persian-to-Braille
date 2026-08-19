# Phase 15.3M7 — Liblouis Frozen Runtime Build and Verification

**Status:** `PASS_WITH_DOCUMENTED_CROSS_HARNESS_ADAPTATION`  
**Comparator role:** `NON_NORMATIVE_COMPARATOR`  
**Normative authority:** No  
**Frozen Liblouis commit:** `fefb3a218cead90cf5e6df6a5fc8d6a69f4dbf2e`  
**Runtime version:** `3.38.0`

## Objective

Phase 15.3M7 establishes a reproducible executable Liblouis runtime for use strictly as a non-normative comparator during the German Kurzschrift audit.

M7 does not promote, infer, or define German Braille rules.

## Frozen source identity

The comparator was built from the frozen Liblouis commit:

```text
fefb3a218cead90cf5e6df6a5fc8d6a69f4dbf2e
````

The source was transferred through a Git bundle and checked out natively inside WSL Ubuntu 22.04.

```text
checkout = GIT_BUNDLE_WSL_NATIVE
core.autocrlf = false
core.eol = lf
source EOL adaptation = NONE
```

`autogen.sh` canonical Git-blob SHA-256:

```text
f7beba3e3369da89dc819301e7e9230e46ec7a7a816a0cbfeb7f758c56550b81
```

The WSL worktree copy produced the identical SHA-256.

The original frozen Windows checkout was not modified.

## Libyaml dependency

Frozen dependency:

```text
libyaml version = 0.1.4
archive SHA-256 =
6406d298a7889ad8e107239d3154c3540dbc0820ff4c5e889c60019fc2bf672b
```

Canonical Git-blob SHA-256 of `libyaml_mingw.patch`:

```text
0150e372ea9d017e8f09ddae5725f055d9ddf30c425ccaacb278a38061de80b2
```

Libyaml bootstrap, configure, MinGW build, and install passed.

## Liblouis build

The frozen source successfully completed:

```text
autogen    PASS
configure  PASS
make       PASS
install    PASS
```

Target:

```text
x86_64-w64-mingw32
```

Build environment:

```text
WSL2
Ubuntu 22.04
Wine64
```

## Raw upstream test result

The original cross-build `make check WINE=wine64` result was:

```text
TOTAL  219
PASS   216
FAIL     3
ERROR    0
```

The three raw failures were:

```text
check_all_tables.pl
check_endless_loop.pl
multiple_table_path.pl
```

They were not Braille-rule failures.

The generated cross-build harness applied:

```text
LOG_COMPILE = $(WINE)
```

to the host-side Perl scripts. Wine consequently attempted to execute the `.pl` files directly as Windows programs and rejected them.

The raw `make check` result is therefore preserved as non-zero and is **not** represented as an upstream PASS.

## Controlled cross-harness recheck

The three host-side Perl tests were re-executed with:

* native Ubuntu `/usr/bin/perl`;
* the relevant Automake environment semantics;
* a disposable `lou_checktable` wrapper;
* the original MinGW-built `lou_checktable.exe`;
* `wine64` used only for the Windows executable.

No frozen source file was modified.

A German `de-g2.ctb` wrapper smoke test passed before the recheck.

Results:

```text
check_all_tables.pl      PASS
check_endless_loop.pl    PASS
multiple_table_path.pl   PASS

controlled recheck       3 / 3 PASS
```

Therefore:

```text
effective validated tests = 219
effective PASS            = 219
effective FAIL            = 0
```

This result is classified as:

```text
PASS_WITH_DOCUMENTED_CROSS_HARNESS_ADAPTATION
```

## Installed runtime verification

Required runtime files were present after installation, including:

```text
bin/liblouis.dll
bin/lou_checktable.exe
bin/lou_translate.exe
share/liblouis/tables/de-g2.ctb
```

`lou_translate.exe`:

```text
SHA-256 =
83395428d632cc286148e1654244ff59197450ffb493697eb0dd66d415ad998c
```

Installed `de-g2.ctb`:

```text
SHA-256 =
eb34cc6bea143ba925912b1f5feff55baf512b19e9d3ba7fed0d9e07ce7cc177
```

Runtime version smoke:

```text
Liblouis 3.38.0
exit code = 0
PASS
```

## Audit bundle

The installed comparator runtime was archived outside the repository:

```text
file  = liblouis-w64-m7.zip
bytes = 6480584
SHA-256 =
21eab29f00451102295964af3370e5b19188607b810ad4de02e272dce73b8198
```

The runtime bundle is audit evidence and is not vendored into the public repository.

## Normative boundary

Liblouis remains strictly:

```text
NON_NORMATIVE_COMPARATOR
```

M7 does not:

* promote comparator behavior into the German specification;
* infer missing normative rules;
* establish normative equivalence between BSKDL and Liblouis;
* make German Core dependent on Liblouis, WSL, Wine, or the comparator runtime.

Any divergence discovered during runtime comparison must be adjudicated against the frozen normative German specification artifacts.

## M7 closure

```text
Frozen source identity                    PASS
Native WSL checkout                       PASS
Source byte identity                      PASS
Libyaml dependency build                  PASS
Liblouis build                            PASS
Raw upstream suite                        216 / 219
Cross-harness blocked host scripts          3 / 219
Controlled host-script recheck              3 / 3 PASS
Effective validation                     219 / 219 PASS
Install                                   PASS
Runtime smoke                             PASS
German de-g2 comparator table             FOUND
Comparator role                           NON_NORMATIVE
```

**Phase 15.3M7 is closed.**

Next:

```text
Phase 15.3M8
Runtime Smoke / Differential Comparator Audit
```

No German normative decision is changed by this closure.
