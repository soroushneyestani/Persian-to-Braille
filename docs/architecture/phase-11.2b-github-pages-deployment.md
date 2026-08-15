# Phase 11.2b — GitHub Pages HTTPS Deployment Candidate

## Status

**IMPLEMENTED — LIVE DEPLOYMENT REQUIRED BEFORE CLOSURE**

## Hosting decision

The Phase 11.2b candidate uses **GitHub Pages** as the static HTTPS host for the
Microsoft 365 Marketplace web payload.

Expected production origin:

```text
https://soroushneyestani.github.io/Persian-to-Braille
```

This is a project Pages site for the existing public repository.

The Office add-in is currently a static client-side bundle and does not require
a server-side runtime for translation. GitHub Pages therefore satisfies the
current deployment shape without introducing an unnecessary application
server.

## Deployment workflow

Workflow:

```text
.github/workflows/microsoft365-marketplace-pages.yml
```

The workflow:

1. checks out the repository,
2. installs the pinned Node/pnpm workspace,
3. reruns the Phase 11.2a aggregate validation,
4. builds the Marketplace bundle with the explicit GitHub Pages production
   origin,
5. deploys only `marketplace-dist/site` to GitHub Pages,
6. publishes the generated production `manifest.xml` as a workflow artifact.

The manifest itself is not treated as a hosted webpage requirement. It remains
the Marketplace submission artifact.

## Development workflow remains separate

The validated development manifest remains:

```text
integrations/microsoft365/manifest.xml
https://localhost:3000
```

The GitHub Pages workflow builds a separate production manifest through
`build:marketplace`.

## Candidate deployment trigger

During Phase 11 validation, pushes to:

```text
phase11-marketplace
```

may deploy the candidate site.

The workflow also supports `main`, so after the Phase 11 pull request is merged,
the production site can continue to be deployed from the merged branch.

## Manual repository setting required

Before the first deployment, GitHub Pages must be configured in the repository
settings to use **GitHub Actions** as the publishing source.

This is an external repository setting and cannot be proven by source code.

## Live validation requirement

11.2b remains open until the deployed endpoints are reachable over public
HTTPS and the remote probe passes.

Expected endpoints include:

```text
/taskpane.html
/commands.html
/styles.css
/assets/icon-16.png
/assets/icon-32.png
/assets/icon-80.png
```

The remote task pane must still reference the Microsoft-hosted production
Office.js CDN.

The icon responses are also inspected for cache headers.

## Deferred

The following remain separate Phase 11 work:

```text
11.3 Support / Privacy / EULA / Publisher Identity
11.4 Marketplace Listing Metadata and Assets
11.5 Web + Mac certification execution and iOS scope decision
```

The current GitHub repository SupportUrl remains unchanged until 11.3.
