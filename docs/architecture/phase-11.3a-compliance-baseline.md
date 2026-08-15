# Phase 11.3a — Support / Privacy / EULA / Publisher Compliance Baseline

## Status

**CLOSED — BASELINE FROZEN WITH COMPLIANCE GAPS RECORDED**

Audit date:

```text
2026-08-15
```

Baseline commit:

```text
ede64ea42e1df8ef9151bcdbd1f167a951172fe4
```

## Frozen Phase 11.2 regression

The Phase 11.2 aggregate validation passed at the start of this audit.

Production hosting remains verified at:

```text
https://soroushneyestani.github.io/Persian-to-Braille
```

## Current manifest identity

```text
ProviderName: Soroush Neyestani
SupportUrl:   https://github.com/soroushneyestani/Persian-to-Braille
```

The ProviderName is a repository fact.

Partner Center publisher identity and program enrollment remain external gates and
must not be assumed from repository state.

## Runtime privacy findings

The repository audit found no app-owned:

- `fetch(...)` calls,
- `XMLHttpRequest`,
- WebSocket/EventSource communication,
- `localStorage`,
- `sessionStorage`,
- IndexedDB,
- application cookies,
- authentication/account system,
- analytics or telemetry SDK.

The runtime does load Microsoft Office.js from:

```text
https://appsforoffice.microsoft.com/lib/1/hosted/office.js
```

The `https://localhost:3000` match is the frozen development base URL constant
used by the production-manifest materializer; it is not evidence of a production
runtime data transfer.

## Privacy-policy drafting rule

Based on the audited application code, Phase 11.3b may state that the add-in does
not implement its own analytics, account system, browser persistence, or
app-owned network transport for selected Office content.

However, the policy must **not** use an absolute statement such as:

```text
No network activity occurs.
No third party ever receives technical request metadata.
Nothing is ever logged anywhere.
```

The add-in necessarily loads Microsoft Office.js, and the production web assets
are delivered through GitHub Pages. Hosting/browser/Office infrastructure can
process ordinary request metadata independently of the app's own runtime logic.

The safer compliance distinction is:

```text
Application-owned content processing
vs.
hosting/platform technical request processing
```

## Required public pages

Not present at the Phase 11.3a baseline:

```text
Support
Privacy Policy
EULA / Terms
```

These become Phase 11.3b implementation work.

## Support URL

The current manifest SupportUrl points to the GitHub repository and remains a
Marketplace gap.

Phase 11.3c will replace the SupportUrl in the production Marketplace manifest
with the public HTTPS support page while preserving the localhost development
manifest.

## External Partner Center gates

Still unresolved outside the repository:

- Partner Center publisher/developer enrollment,
- Microsoft 365 and Copilot program enrollment,
- publisher-name alignment with `ProviderName="Soroush Neyestani"`.

These remain explicit external checks.

## Next

```text
Phase 11.3b — Public Support / Privacy / EULA pages
```
