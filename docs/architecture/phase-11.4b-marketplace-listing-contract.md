# Phase 11.4b — Marketplace Listing Metadata Contract and Icon Remediation

## Status

**IMPLEMENTED / VALIDATION REQUIRED**

This phase converts the Phase 11.4a listing audit into a source-controlled
English (`en-US`) listing contract and remediates the add-in-only manifest
high-resolution icon requirement.

## Listing identity

```text
Name: Persian-to-Braille
Locale: en-US
Publisher / manifest ProviderName: Soroush Neyestani
Hosts: Word, Excel, PowerPoint
```

The public Store text is maintained in:

```text
integrations/microsoft365/marketplace/listing/en-US.json
```

The name remains identical to the manifest `DisplayName`.

## Listing text policy

The contract includes:

- a concise customer-facing summary;
- a detailed description aligned to the manifest purpose and validated host
  behavior;
- optional search keywords for Persian/Farsi, Braille, accessibility, and
  translation;
- public Support, Privacy, and EULA URLs already validated in Phase 11.3;
- a three-host screenshot/caption plan.

The description must not claim Web or Mac live verification. Windows host
verification remains the frozen live evidence; Web and Mac remain later
release gates.

## Category decision

Microsoft requires one to three categories in Partner Center, but the
submission guide does not provide the complete live Properties taxonomy as a
stable source-controlled identifier list.

Therefore the Phase 11.4b decision is deliberate:

- do not invent a category identifier in the repository;
- select the most accurate accessibility/productivity category or categories
  from the live Partner Center Properties UI when publisher enrollment is
  available;
- keep the required range of one to three categories as a validation
  requirement;
- select no industry because this add-in is not industry-specific.

This is a Partner Center UI completion item, not a blocker for preparing the
listing package.

## High-resolution icon remediation

Phase 11.4a recorded:

```text
IconUrl:               icon-32.png  -> 32 x 32 / PASS
HighResolutionIconUrl: icon-80.png  -> 80 x 80 / GAP
```

Phase 11.4b creates:

```text
integrations/microsoft365/public/assets/icon-64.png
```

from the existing `icon-80.png` visual identity and updates only the manifest
`HighResolutionIconUrl` to the 64 x 64 asset.

The existing `icon-80.png` remains in the repository for Office add-in command
icon resources. It is not deleted or globally replaced.

## Screenshot plan

Three sanitized screenshots are planned:

1. Word selection -> preview -> Replace / Insert After.
2. Excel single plain-text cell -> preview -> Replace.
3. PowerPoint selected text range -> preview -> Replace.

Screenshots must show useful real content and must not expose unwanted personal
information.

## External publisher gate

Phase 11.3e remains:

```text
EXTERNAL BLOCKED / NOT SATISFIED
```

This phase does not alter that state and does not claim Marketplace
publication.

## Manual preview distribution

A separate later subtrack may publish a stable hosted manifest and installation
page for manual/sideload preview use while Partner Center enrollment remains
blocked.

That channel must be labelled manual/sideload preview distribution and must
not be described as Microsoft Marketplace publication.

## Next

After this contract validates:

```text
11.4c  Public Manual Preview Distribution
11.4d  Marketplace Screenshots / Listing Assets
```
