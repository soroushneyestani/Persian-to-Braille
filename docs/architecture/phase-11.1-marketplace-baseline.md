# Phase 11.1 — Microsoft Marketplace Submission Baseline Audit

## Status

**CLOSED — BASELINE FROZEN WITH MARKETPLACE GAPS RECORDED**

Audit date:

```text
2026-08-15
```

Phase 11 starts from the Phase 10 merge on `main`:

```text
c9a82483354832a3f292117ca20ae4875881e324
```

The Phase 10 aggregate regression was rerun at Phase 11 entry and passed.

## Current Office add-in baseline

The current development manifest remains the Phase 10 three-host add-in-only XML manifest:

```text
Document       -> Word
Workbook       -> Excel
Presentation   -> PowerPoint
```

The task pane already loads Office.js from the Microsoft-hosted production CDN:

```text
https://appsforoffice.microsoft.com/lib/1/hosted/office.js
```

## Marketplace-ready items

The audit confirmed:

- Phase 10 remains fully green.
- Word, Excel, and PowerPoint are all declared hosts.
- Windows real-client verification is preserved for all three hosts.
- The manifest passed the official Microsoft manifest validator in Phase 10.5a.
- A high-resolution icon element is present.
- Office.js already uses the required Microsoft-hosted production CDN.
- The architecture boundary remains `Microsoft365 -> SDK -> Core`.

## Production blockers / required work

### Production hosting

Active manifest endpoints still use:

```text
https://localhost:3000
```

This includes the task pane, command page, and manifest icon URLs.

Phase 11 must introduce a real SSL-secured production deployment without rewriting historical Phase 9/10 evidence.

### Support URL

Current manifest value:

```text
https://github.com/soroushneyestani/Persian-to-Braille
```

This is not an acceptable final Office Add-in Marketplace support target. The submission requires a public support webpage that does not require authentication; a GitHub repository is not accepted as the Support URL.

### Legal / support URLs

The submission still needs valid HTTPS pages for:

```text
Support
Privacy Policy
End User License Agreement (EULA)
```

### Marketplace listing

Still required:

- final listing title and summary
- full Marketplace description
- category/keyword decisions
- production logo/icon assets
- screenshots and other listing media
- localization decisions
- certification test notes for Word, Excel, and PowerPoint

## External Partner Center gates

The repository cannot prove:

- whether the Partner Center publisher/developer account is ready
- whether the required publishing program enrollment is complete
- whether the Partner Center publisher identity aligns with `ProviderName`

These remain explicit external checks, not assumed PASS results.

## Platform certification gates

Current real-client evidence:

```text
Windows  VERIFIED / PASS
Web      NOT EXECUTED
Mac      NOT EXECUTED
```

Web and Mac remain release/certification gates where the APIs used by the add-in are compatible.

For iOS/iPad, Phase 11 must make an explicit scope decision. iOS is not automatically claimed as verified merely because manifest analysis lists possible platform support.

## Historical evidence rule

Phase 11 must **not** scrub `localhost` from historical Phase 8/9/10 audit and sideload evidence. Those files correctly describe development and verification history.

Production URL work should target the active production deployment/manifest path while preserving the existing development and historical evidence paths.

## Next

```text
Phase 11.2 — Production Hosting / HTTPS / Production Manifest
```

11.2 must decide the production origin/domain and establish a deployment/manifest strategy that does not break the validated local sideload workflow.
