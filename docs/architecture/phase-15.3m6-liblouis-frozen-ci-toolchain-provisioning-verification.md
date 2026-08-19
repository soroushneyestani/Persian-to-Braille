# Phase 15.3M6 — Frozen CI Toolchain Provisioning and Verification

Status: **PASS**

Role: **NON-NORMATIVE COMPARATOR**

## Environment

```text
Distribution:      Ubuntu-22.04
Ubuntu version:    22.04
Architecture:      x86_64
WSL version:       2
```

## Explicit frozen-workflow packages

```text
autoconf: 2.71-2
automake: 1:1.16.5-1.3
curl: 7.81.0-1ubuntu1.26
libtool: 2.4.6-15build2
make: 4.3-4.1build1
mingw-w64: 8.0.0-1
pkg-config: 0.29.2-1ubuntu3
texinfo: 6.8-4build1
wine64: 6.0.3~repack-1
zip: 3.0-12build2
patch: 2.7.6-7build2
jq: 1.6-2.1ubuntu3.2
```

Only the 12 package names explicitly listed by the frozen workflow were requested. APT may install their normal transitive dependencies.

## Required commands

```text
autoconf: /usr/bin/autoconf
automake: /usr/bin/automake
libtoolize: /usr/bin/libtoolize
make: /usr/bin/make
x86_64-w64-mingw32-gcc: /usr/bin/x86_64-w64-mingw32-gcc
x86_64-w64-mingw32-g++: /usr/bin/x86_64-w64-mingw32-g++
pkg-config: /usr/bin/pkg-config
makeinfo: /usr/bin/makeinfo
wine64: /usr/bin/wine64
curl: /usr/bin/curl
zip: /usr/bin/zip
patch: /usr/bin/patch
jq: /usr/bin/jq
```

## Integrity

```text
Frozen Liblouis commit:   VERIFIED
Frozen checkout:          CLEAN
Liblouis build:           NOT STARTED
Runtime translation:      NOT STARTED
```

## Next

Proceed to **Phase 15.3M7 — Frozen Runtime Dependency and Liblouis Build**.
