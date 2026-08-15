# Persian-to-Braille — Windows Desktop Release Notes

## Classification

**WINDOWS DESKTOP RELEASE CANDIDATE / MANUAL SIDELOAD DISTRIBUTION**

Target: Microsoft 365 Desktop on Windows only.

This package is not Microsoft Marketplace publication.

## Supported hosts

### Word
- WordApi 1.1
- selected text translation
- Copy Braille
- Replace Selection
- Insert After
- exact stale-selection guard

### Excel
- ExcelApi 1.1
- exactly one selected plain-text cell
- Copy Braille
- Replace Selection
- multi-cell selections rejected
- formulas and non-string cells rejected
- exact stale-cell snapshot guard

### PowerPoint
- PowerPointApi 1.5
- selected text-range translation
- Copy Braille
- Replace Selection
- exact snapshot: slideId + shapeId + start + length + text

## Runtime architecture

```text
Microsoft 365 Desktop
  -> Microsoft365 integration
  -> public SDK
  -> standalone Core
```

## Current Persian Braille runtime

- profile: `fa-ir-g1 0.1.0 (draft)`
- rules: 176
- candidate rules: 139
- normative rules: 37
- U+0622 / `آ` release correction: included

## Windows distribution evidence

- live GitHub Pages HTTPS download: PASS
- production manifest validation: PASS
- local trusted catalog setup: PASS
- Office add-in discovery: PASS
- real Windows installation flow: PASS
- Translate Selection: PASS
- Braille preview/runtime flow: PASS

## Deferred work

- Office on the Web -> Phase 16
- Microsoft 365 for Mac -> Phase 17
- Microsoft Marketplace / Partner Center -> Phase 18
