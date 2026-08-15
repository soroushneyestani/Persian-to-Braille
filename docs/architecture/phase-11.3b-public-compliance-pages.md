# Phase 11.3b — Public Support / Privacy / EULA Pages

## Status

**IMPLEMENTED — VALIDATION REQUIRED BEFORE COMMIT**

## Objective

Phase 11.3b adds public, static compliance pages to the Microsoft 365 add-in
site without changing translation behavior.

Pages:

```text
support.html
privacy.html
eula.html
```

Shared presentation:

```text
compliance.css
```

## Privacy wording source

The privacy wording is constrained by the frozen Phase 11.3a runtime audit.

The pages distinguish between:

```text
application-owned content processing
and
Microsoft / GitHub / browser infrastructure processing
```

The Privacy Policy does not make an absolute claim that no network or platform
logging can exist.

## Support

The support page is a public webpage, not the repository itself.

It provides:

- host-specific usage guidance,
- troubleshooting guidance,
- a public technical issue route,
- a warning not to post confidential or sensitive information publicly.

The production manifest SupportUrl remains unchanged in 11.3b. Replacing it is
Phase 11.3c work.

## EULA

The EULA:

- identifies the publisher,
- references the repository MIT License,
- describes supported add-in functionality,
- includes user responsibilities,
- references third-party Microsoft/GitHub platforms,
- retains the MIT-style no-warranty / liability posture,
- preserves mandatory rights that cannot legally be excluded,
- links to Privacy and Support.

## Deployment

The existing static add-in build is expected to copy these pages into
`addin-dist`, which then flows into the Marketplace hosted site payload.

No live deployment is claimed by 11.3b.

## Next

```text
Phase 11.3c — Production SupportUrl integration + Marketplace build validation
```
