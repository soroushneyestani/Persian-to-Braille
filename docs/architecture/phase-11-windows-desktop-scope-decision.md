# Phase 11 Scope Decision — Windows Desktop First

## Status

**ACTIVE SCOPE DECISION**

Phase 11 is closed against the Microsoft 365 Desktop for Windows product
surface only.

This decision does not rewrite or invalidate earlier evidence. Historical
records that classify Web and Mac as `EXPECTED / NOT EXECUTED`, or Partner
Center publisher enrollment as externally blocked, remain accurate for the
time at which those records were created.

## Phase 11 release target

The Phase 11 release target is now:

```text
Microsoft Word for Microsoft 365 Desktop on Windows
Microsoft Excel for Microsoft 365 Desktop on Windows
Microsoft PowerPoint for Microsoft 365 Desktop on Windows
```

The required Phase 11 evidence is therefore limited to Windows Desktop:

- production HTTPS hosting;
- add-in-only XML production manifest;
- Word / Excel / PowerPoint Windows runtime behavior;
- shared SDK/Core delegation;
- Windows sideload installation;
- Windows Desktop Preview Installer;
- Windows screenshots;
- Windows regression and release preflight;
- Windows release package and test notes.

## Deferred platform work

### Phase 16 — Office on the Web

Phase 16 will perform live Office on the web execution, sideload validation,
host-specific UX verification, and any web-specific compatibility work.

### Phase 17 — Microsoft 365 for Mac

Phase 17 will perform live Mac sideloading, Word/Excel/PowerPoint execution,
host-specific compatibility testing, and Mac release evidence.

### Phase 18 — Microsoft Marketplace / Partner Center Official Publication

Phase 18 will perform the external publisher / Partner Center work required for
official Marketplace publication, including publisher identity/enrollment,
submission, certification, listing completion, and publication.

The historical Phase 11.3e publisher gate remains preserved as external
evidence, but it no longer blocks the Windows Desktop technical closure of
Phase 11.

## Phase 11 remaining roadmap

```text
11.4e  Windows Desktop Preview Installer + Persian Installation Guide  CLOSED
11.5   Windows Desktop Certification Matrix
11.6   Windows Desktop Release Package + Test Notes
11.7   Windows Desktop Certification / Release Preflight
11.8   Phase 11 Windows Desktop Closure
```

## Non-claims

Closing Phase 11 does not claim:

- Office on the web live verification;
- Microsoft 365 for Mac live verification;
- iOS/iPad certification;
- Partner Center publisher enrollment;
- Microsoft Marketplace publication.

Those claims may only be added by their later dedicated phases.
