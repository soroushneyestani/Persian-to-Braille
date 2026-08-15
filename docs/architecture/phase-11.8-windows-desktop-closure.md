# Phase 11.8 — Final Windows Desktop Closure

## Status

**CLOSED — PHASE 11 WINDOWS DESKTOP RELEASE COMPLETE**

Phase 11 is closed for the current release scope:

```text
Microsoft 365 Desktop on Windows
```

This closure is an internal Persian-to-Braille project release decision. It is
not Microsoft certification and it does not claim Microsoft Marketplace
publication.

## Final Windows candidate

The final Windows Desktop candidate validated by Phase 11.7 is:

```text
242547ed0a4262a6b56b06d22546a010ed07fc30
```

Phase 11.7 verified that candidate from a clean committed checkout and recorded:

- Phase 11.6 aggregate validation: PASS;
- release provenance: PASS;
- package SHA-256 integrity: PASS;
- production manifest: PASS;
- working-tree stability: PASS;
- GitHub Actions current-candidate run: PASS;
- Windows Desktop CI release artifact: PASS.

GitHub Actions evidence:

```text
run number: 13
run id: 31900419098
conclusion: success
artifact: persian-to-braille-windows-desktop-release-1
artifact id: 9250927199
```

Package-manifest SHA-256:

```text
8ebc50cf24b921d0dc75c3063df233bbc380d7cf617a4e9e60d8e814ea735ffc
```

## Phase 11 completion matrix

| Phase | Result |
|---|---|
| 11.1 Submission / release baseline audit | CLOSED |
| 11.2 Production hosting / HTTPS / production manifest | CLOSED |
| 11.3 Support / Privacy / EULA technical preparation | CLOSED for Windows scope |
| 11.3e Publisher identity external gate | PRESERVED / DEFERRED TO PHASE 18 |
| 11.4a Listing baseline | CLOSED |
| 11.4b Listing metadata contract | CLOSED |
| 11.4c Public manual preview distribution | CLOSED |
| 11.4d Windows host screenshots | CLOSED |
| 11.4e Windows Desktop Preview Installer | CLOSED |
| 11.5 Windows Desktop Certification Matrix | CLOSED |
| 11.6 Windows Desktop Release Package + Test Notes | CLOSED |
| 11.7 Windows Desktop Release Preflight | CLOSED |
| 11.8 Final Windows Desktop Closure | CLOSED |

Historical documents that still describe Web/Mac or publisher gates using the
older Phase 11 policy remain immutable historical evidence. The later Windows
Desktop scope-decision record supersedes those old release-gate semantics.

## Host release state

### Word / Windows

**PASS**

- WordApi 1.1;
- Translate Selection;
- Copy Braille;
- Replace Selection;
- Insert After;
- exact stale-selection guard;
- Windows live verification preserved.

### Excel / Windows

**PASS**

- ExcelApi 1.1;
- exactly one plain-text cell;
- Translate Selection;
- Copy Braille;
- Replace Selection;
- formula / non-string / multi-cell guards;
- exact stale-cell snapshot;
- Windows live verification preserved.

### PowerPoint / Windows

**PASS**

- PowerPointApi 1.5;
- selected text range;
- Translate Selection;
- Copy Braille;
- Replace Selection;
- exact five-field stale snapshot;
- Windows live verification preserved.

## Regression state

The Windows release closure preserves:

```text
Microsoft365 tests: 69/69 PASS
Core runtime rules: 176
candidate rules: 139
normative rules: 37
architecture: Microsoft365 -> SDK -> Core
U+0622 / آ release correction: included
public trust-wording guard: PASS
production HTTPS / no-localhost guard: PASS
```

No Office-specific direct dependency on Core was introduced.

## Distribution state

The Windows Desktop release has:

- public GitHub Pages HTTPS hosting;
- production add-in manifest;
- Windows Desktop Preview Installer;
- PowerShell setup helper;
- public Persian/English installation guidance;
- Word / Excel / PowerPoint screenshots;
- release notes;
- Windows test notes;
- package provenance;
- package-manifest SHA-256 records;
- checksum file;
- GitHub Actions Windows release artifact.

The Windows network-share mechanism remains a sideload/testing distribution
mechanism and is not represented as Microsoft Marketplace publication.

## Public trust boundary

The public distribution wording explicitly avoids:

- claiming the setup helper is code-signed when it is not;
- describing the project production manifest as an official Microsoft
  manifest;
- claiming Microsoft Marketplace publication.

## Deferred phases

The following work is intentionally outside Phase 11 closure:

```text
Phase 16 — Office on the Web
Phase 17 — Microsoft 365 for Mac
Phase 18 — Microsoft Marketplace / Partner Center official publication
```

The historical publisher-identity external gate remains preserved for Phase 18
and does not block the Windows Desktop release closed here.

## Post-candidate change boundary

The Phase 11.7 final candidate is commit
`242547ed0a4262a6b56b06d22546a010ed07fc30`.

After that candidate, only Phase 11 evidence, validation metadata, closure
records, and package-script wiring are permitted before Phase 11 closure. No
runtime, Core, SDK, Word, Excel, PowerPoint, manifest payload, installer
behavior, or translation-semantic change is permitted.

Closure preparation base:

```text
f9274a8c4cc9fd49d2e3dcb9abc1067d6b84a73e
```

## Phase 11 result

```text
PHASE 11 WINDOWS DESKTOP: CLOSED / PASS

Word / Windows:       PASS
Excel / Windows:      PASS
PowerPoint / Windows: PASS
Production hosting:   PASS
Windows installer:    PASS
Release package:      PASS
Release preflight:    PASS
Trust wording:        PASS

Web:                   DEFERRED TO PHASE 16
Mac:                   DEFERRED TO PHASE 17
Marketplace:           DEFERRED TO PHASE 18
```

## Next

**Phase 12 — Developer Ecosystem**
