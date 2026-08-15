# Phase 11.4d — Marketplace Screenshots / Listing Assets

## Status

**CLOSED — WINDOWS DESKTOP SCREENSHOTS CAPTURED AND VALIDATED**

Phase 11.4d freezes three listing screenshots for the current
Persian-to-Braille Microsoft 365 add-in:

- Word
- Excel
- PowerPoint

The screenshots were captured from Microsoft 365 Desktop on Windows after the
U+0622 / `آ` runtime correction had passed the public SDK and Microsoft 365
regressions.

## Assets

```text
integrations/microsoft365/marketplace/listing/assets/screenshots/
├── word-selection.png
├── excel-text-cell.png
├── powerpoint-text-range.png
└── manifest.json
```

The machine-readable manifest records host, selection model, caption, PNG
dimensions, byte size, SHA-256, visible capabilities, privacy-review boundary,
and platform claim.

## Listing captions

### Word

Translate a selected Persian passage, preview the Unicode Braille result, then
replace or insert it.

### Excel

Translate one selected plain-text Excel cell and replace it with the reviewed
Braille result.

### PowerPoint

Translate a selected PowerPoint text range and replace it after previewing the
Braille output.

## Certification boundary

These images establish **Windows Desktop capture evidence only**.

They do not claim Marketplace publication, Partner Center publisher
enrollment, Web live verification, Mac live verification, or iOS/iPad
certification.

Phase 11.3e therefore remains externally blocked and unchanged.

No Power BI-specific or otherwise unrelated screenshot pixel requirement is
treated as a hard Office add-in requirement. The project applies only a local
readability floor until an exact Office Partner Center upload constraint is
observed in the applicable submission UI/documentation.

## Next

Phase 11.4e:

**Windows Desktop Preview Installer + Persian installation guide**

This next step may expose a convenient Windows sideload preview, but it must
remain clearly labeled as preview/sideload distribution rather than Microsoft
Marketplace publication.
