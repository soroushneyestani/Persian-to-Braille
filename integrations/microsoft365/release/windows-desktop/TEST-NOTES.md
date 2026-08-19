# Braille Hub — Windows Desktop Test Notes

## Purpose

Internal Windows Desktop acceptance checks for the Phase 11 release package.
These are not Microsoft certification tests.

## Target environment

```text
Microsoft 365 Desktop on Windows
```

Required hosts: Word, Excel, PowerPoint.

## Installer acceptance

1. Download the public Windows Desktop Preview Installer.
2. Run the CMD file.
3. Accept UAC if requested.
4. Confirm Office is not force-closed.
5. Open Word, Excel, or PowerPoint.
6. Open `Add-ins -> Get Add-ins / Advanced -> SHARED FOLDER`.
7. Select `Braille Hub`.
8. Choose `Add`.
9. Confirm `Translate Selection` appears.

Expected result: PASS.

## Common Persian sample

```text
آموزش و دسترسی‌پذیری برای کاربران فارسی‌زبان
```

The sample intentionally includes U+0622 (`آ`).

Expected:
- translation succeeds;
- Braille preview is shown;
- U+0622 does not produce `UNKNOWN_CHARACTER`.

## Word acceptance

- translate selected Persian text;
- verify Braille preview;
- verify Copy Braille;
- verify Replace Selection;
- verify Insert After;
- verify stale-selection mutation is blocked.

Expected result: PASS.

## Excel acceptance

- select exactly one plain-text Persian cell;
- verify Braille preview;
- verify Copy Braille;
- verify Replace Selection;
- verify Insert After is unavailable;
- verify multi-cell selection rejection;
- verify formula rejection;
- verify non-string cell rejection;
- verify stale-cell mutation is blocked.

Expected result: PASS.

## PowerPoint acceptance

- select a Persian text range;
- verify Braille preview;
- verify Copy Braille;
- verify Replace Selection;
- verify Insert After is unavailable;
- verify stale text-range mutation is blocked.

Expected result: PASS.

## Automated regression acceptance

```text
Microsoft365 tests: 69/69 PASS
Phase 9 Word contract: PASS
Phase 10 three-host contracts: PASS
Phase 11 production HTTPS: PASS
Phase 11.4e live Windows installer: PASS
Phase 11.5 Windows certification matrix: PASS
```

## Non-claims

Not tested or claimed here:
- Office on the Web;
- Microsoft 365 for Mac;
- iOS/iPad;
- Partner Center publisher enrollment;
- Microsoft Marketplace publication.

Deferred phases: Phase 16, Phase 17, Phase 18.
