# Braille Hub

**Text & Music Accessibility for Microsoft 365**

> **Project status:** Feature development complete.
> **Current stage:** Release candidate / distribution validation.
> **Microsoft Marketplace:** Not published yet; Marketplace submission/publication is an external release step and is not required for the completed feature set.

[Install Braille Hub](https://soroushneyestani.github.io/Persian-to-Braille/install.html) ·
[Download Manifest](https://soroushneyestani.github.io/Persian-to-Braille/install/manifest.xml) ·
[Support](https://soroushneyestani.github.io/Persian-to-Braille/support.html) ·
[Privacy](https://soroushneyestani.github.io/Persian-to-Braille/privacy.html) ·
[EULA](https://soroushneyestani.github.io/Persian-to-Braille/eula.html)

---

## Overview

**Braille Hub** is the completed evolution of the original **Persian-to-Braille** project.

The repository keeps its historical `Persian-to-Braille` name and public URLs, while the product itself is now **Braille Hub**: a platform-independent text and music accessibility system with a shared Core, public SDK, CLI/Web consumers, and a Microsoft 365 add-in.

The project is designed around one rule:

> Office, browser, CLI, and other hosts must not own Braille semantics.
> They call the same public SDK and reuse the same translation engines.

This keeps the behavior consistent across supported environments and avoids separate desktop/web language engines.

---

## What Braille Hub supports

### Text Braille

| Input / Mode | Support |
| --- | --- |
| **Persian → Braille** | Supported through the Persian Braille Core and public SDK |
| **English / Latin → Braille** | Supported as ordinary uncontracted six-dot English/Latin through the current Latin-span rules |
| **German → Braille** | Supported in Basisschrift, Vollschrift, and Kurzschrift |
| **German regions** | Deutschland / Österreich and Schweiz regional behavior |
| **Persian Braille → Persian text** | Supported through the stateful reverse-translation Core/SDK API |

> English support is **not** a claim of contracted UEB / English Grade-2 translation.

### Braille Music

| Source | Output |
| --- | --- |
| **MIDI (`.mid`, `.midi`)** | Braille Music |
| **MusicXML (`.musicxml`, `.xml`)** | Braille Music |
| **Compressed MusicXML (`.mxl`)** | Braille Music |

Braille Music uses a dedicated semantic music path and the shared Braille Music engine. Unsupported or ambiguous notation is handled explicitly rather than being silently deleted or guessed.

---

## Microsoft 365

Braille Hub is integrated with:

- **Microsoft Word**
- **Microsoft Excel**
- **Microsoft PowerPoint**

The host boundary remains:

```text
Microsoft 365
      ↓
Braille Hub SDK
      ↓
Core / German / Music
      ↓
Unicode Braille / Braille Music
```

### Platform status

| Platform | Status |
| --- | --- |
| **Windows Desktop** | Live verified |
| **Office on the Web** | Validated with the same Office.js / SDK / Core architecture |
| **macOS — manifest sideload** | User-reported working |
| **macOS — direct `.pkg` installer** | Release candidate; final tester confirmation pending |
| **Microsoft Marketplace** | Publication pending |

The completed product does **not** depend on Marketplace publication to define its feature-complete state. Marketplace is the official distribution channel planned after release validation.

---

## Microsoft 365 feature surface

### Persian / English

Available through the shared text workflow in supported Office hosts.

Typical flow:

```text
Office selection
      ↓
Preview
      ↓
Braille Hub SDK
      ↓
Unicode Braille
      ↓
Copy / Replace / Insert where supported by the host
```

### German

The German tab supports:

```text
Region
├── Deutschland / Österreich
└── Schweiz

Level
├── Basisschrift
├── Vollschrift
└── Kurzschrift
```

German rules remain in the shared Core/SDK architecture and are not duplicated inside Word, Excel, PowerPoint, or the web host.

### MIDI

In Microsoft Word, MIDI files can be inspected by Track + Channel source line and translated to Braille Music through the public SDK.

### MusicXML / MXL

Microsoft Word also exposes a separate MusicXML workflow for:

- `.musicxml`
- `.xml`
- `.mxl`

The MXL path uses the hardened compressed-container loader before translation through the same Braille Music engine.

---

## Reverse translation

Braille Hub also includes a dedicated **Persian Braille → Persian text** path.

Reverse translation is stateful. It does not use a naive global one-cell-to-one-character lookup because Braille cells can be ambiguous depending on numeric mode, language mode, punctuation, and surrounding context.

The reverse API therefore preserves an explicit ambiguity policy and fails safely when interpretation is not sufficiently determined.

---

## Architecture

The repository is a monorepo with clear package and host boundaries.

```text
Braille Hub
│
├── Specification / generated runtime data
│
├── Core
│   ├── Persian forward translation
│   ├── Persian reverse translation
│   └── German Braille
│
├── Music
│   ├── MIDI
│   ├── MusicXML / MXL
│   └── Braille Music engine
│
├── Public SDK
│
├── Applications
│   ├── CLI
│   └── Web playground
│
└── Microsoft 365
    ├── Word
    ├── Excel
    ├── PowerPoint
    ├── Windows Desktop
    ├── Office on the Web
    └── macOS preview distribution
```

The Microsoft 365 runtime boundary is intentionally thin:

```text
Microsoft365 → SDK → Core
                    └→ Music
```

No Persian, German, MIDI, MusicXML, or Braille Music rules are implemented directly in the Office host layer.

---

## Installation

The public installation page contains the current preview distribution options:

### Installation page

https://soroushneyestani.github.io/Persian-to-Braille/install.html

It provides:

- **Windows Desktop Preview Installer**
- **macOS Preview Installer (`.pkg`)**
- **Microsoft 365 add-in manifest**
- Office on the Web sideload instructions
- Microsoft 365 administrator deployment instructions
- Windows / Mac installation notes
- screenshots and current verification status

### Stable production manifest

```text
https://soroushneyestani.github.io/Persian-to-Braille/install/manifest.xml
```

The hosted manifest points to the production HTTPS assets and does not use the local development `localhost` endpoint.

---

## Validation

The final development phases preserve full regression and package-boundary validation.

Latest closure baseline:

```text
Music regression        224 / 224 PASS
SDK regression           51 / 51 PASS
Microsoft 365           111 / 111 PASS
Microsoft 365 build      PASS
Microsoft 365 typecheck  PASS
```

The macOS installer release-candidate contract additionally validates:

```text
Word wef target          CONFIGURED
Excel wef target         CONFIGURED
PowerPoint wef target    CONFIGURED
GitHub macOS PKG build   CONFIGURED
GitHub artifact          CONFIGURED
GitHub prerelease        CONFIGURED
```

Apple Developer ID signing/notarization is release hardening and is not claimed by the current preview package.

---

## Standards and implementation policy

Braille Hub separates normative rules from comparison tools and implementation conveniences.

- Persian Braille rules are materialized through the project's formal specification/runtime pipeline.
- German Braille was implemented from the project’s audited German Braille standards work, including Basisschrift, Vollschrift, Kurzschrift, and Swiss regional behavior.
- Braille Music compatibility is implemented through the project's audited Braille Music contracts.
- Unsupported semantic cases remain explicit and fail closed rather than being silently simplified.

The project does not treat a third-party implementation as an automatic replacement for its own specification and regression evidence.

---

## Development

### Requirements

- Node.js
- pnpm
- TypeScript toolchain from the workspace
- Windows is used for the verified desktop Office preview workflow
- macOS package generation is performed on a GitHub-hosted macOS runner

### Install dependencies

```bash
pnpm install
```

### Build the Core

```bash
pnpm --filter @persian-braille/core run build
```

### Build / test Music

```bash
pnpm --filter @persian-braille/music run build
pnpm --filter @persian-braille/music test
```

### Build / test SDK

```bash
pnpm --filter @persian-braille/sdk run build
pnpm --filter @persian-braille/sdk test
```

### Build / test Microsoft 365

```bash
pnpm --filter @persian-braille/microsoft365 run build
pnpm --filter @persian-braille/microsoft365 test
```

---

## Distribution state

The **software development roadmap is complete**.

The remaining work is release/distribution activity rather than feature development:

1. collect final macOS preview-installer feedback;
2. repair only reproducible release defects if a tester reports one;
3. complete Microsoft Marketplace / Partner Center publication when the external process is available.

Until then, the GitHub Pages manual-preview channel remains the public evaluation path.

---

## Project history

The repository began as a Persian-to-Braille project and later grew into a broader accessibility platform.

Major completed areas include:

- formal Persian Braille specification/runtime work;
- Unicode normalization;
- Persian forward translation;
- conformance/regression infrastructure;
- public SDK;
- CLI and browser playground;
- Word, Excel, and PowerPoint integration;
- production HTTPS / manual distribution;
- developer ecosystem;
- Persian reverse translation;
- MIDI → Braille Music;
- German Braille;
- MusicXML / MXL → Braille Music;
- Microsoft 365 Office on the Web;
- macOS preview packaging.

The public product name is now **Braille Hub**.

---

## License

Braille Hub is released under the **MIT License**.

See [`LICENSE`](./LICENSE).

---

## Author

**Soroush Neyestani**

GitHub: [@soroushneyestani](https://github.com/soroushneyestani)

---

## فارسی

**Braille Hub** نسخه‌ی تکمیل‌شده‌ی پروژه‌ی قدیمی **Persian-to-Braille** است.

در نسخه‌ی فعلی، پروژه فقط تبدیل فارسی به بریل نیست و قابلیت‌های اصلی آن شامل این موارد است:

- تبدیل فارسی به بریل
- تبدیل متن انگلیسی/لاتین ساده به بریل شش‌نقطه‌ای
- تبدیل آلمانی به بریل در سه حالت Basisschrift، Vollschrift و Kurzschrift
- پشتیبانی منطقه‌ای آلمان/اتریش و سوئیس
- تبدیل بریل فارسی به متن فارسی
- تبدیل MIDI به Braille Music
- تبدیل MusicXML / MXL به Braille Music
- استفاده در Word، Excel و PowerPoint
- اجرا در Windows Desktop و Office on the Web
- مسیر نصب آزمایشی برای macOS

توسعه‌ی قابلیت‌های اصلی پروژه به پایان رسیده است. مرحله‌ی فعلی مربوط به اعتبارسنجی نهایی بسته‌ی نصب macOS و سپس فرایند انتشار رسمی در Microsoft Marketplace است.
