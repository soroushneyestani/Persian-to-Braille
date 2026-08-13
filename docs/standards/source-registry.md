# Persian Braille Source Registry

Audit baseline date: 2026-08-13

This registry identifies the evidence sources used during the Persian-to-Braille v2 standards audit.

---

## SRC-IR-1393

**Title:** مجموعه علائم بریل

**Issuer:** سازمان آموزش و پرورش استثنایی کشور

**Unit:** معاونت برنامه‌ریزی آموزشی و توان‌بخشی

**Year:** 1393 / 2014

**Classification:** historical-institutional

**Current normative status:** unverified

The recovered source is reported as a 371-page publication.

The surviving recovered PDF has SHA-256:

`7974B08C12ECE7242B2A435E71C5C8CACC2F296BAD8728544A310CB33C9ADA63`

The surviving mirror has not been proven byte-identical to the former official download.

No redistribution license has been established.

The project therefore records bibliographic information, hashes, page references, and independently derived rule evidence without redistributing the recovered binary.

Primary audit record:

`https://github.com/liblouis/liblouis/issues/2053`

---

## SRC-UNICODE-BRAILLE

**Title:** Unicode Braille Patterns

**Block:** U+2800-U+28FF

**Unicode version at audit baseline:** 17.0

**Classification:** encoding-normative

**Normative scope:** Unicode representation of Braille cells

This source defines the Unicode encoding of Braille patterns.

It does not define Persian linguistic translation rules or establish which Braille cell corresponds to a Persian character.

Reference:

`https://www.unicode.org/charts/PDF/U2800.pdf`

---

## SRC-LIBLOUIS-G1

**Title:** Liblouis Persian Grade 1 table

**Path:** `tables/fa-ir-g1.utb`

**Classification:** de-facto-reference-implementation

**Normative:** false

**Pinned repository commit:**

`092e56062d1771b3ca9080651375284adaa5dfad`

Pinned source:

`https://raw.githubusercontent.com/liblouis/liblouis/092e56062d1771b3ca9080651375284adaa5dfad/tables/fa-ir-g1.utb`

This table is treated as implementation evidence and a practical interoperability baseline.

It is not treated as the normative Persian Braille specification.

---

## SRC-LIBLOUIS-2053

**Title:** Persian Braille tables: audit against Iran's 1393/2014 manual and Unicode gaps

**Type:** GitHub issue / research audit

**Issue:** liblouis/liblouis#2053

**Observed status on 2026-08-13:** open

**Classification:** research-audit

**Normative:** false

URL:

`https://github.com/liblouis/liblouis/issues/2053`

The audit compares the recovered Iranian manual with the Persian Liblouis tables and records source-backed differences and modern Unicode coverage gaps.

---

## SRC-LIBLOUIS-2054

**Title:** Draft: update Persian Grade 1 Braille from the 1393 manual

**Type:** GitHub pull request

**Pull request:** liblouis/liblouis#2054

**Observed status on 2026-08-13:** draft

**Classification:** candidate-implementation

**Normative:** false

**Pinned candidate commit:**

`d47d3f9caa67163bc57aa7f0caf6ccb1ece7b417`

URL:

`https://github.com/liblouis/liblouis/pull/2054`

The candidate contains proposed Persian Grade 1 changes based on the historical manual and modern Unicode policy decisions.

The draft must not be treated as an approved Persian national standard.

---

## SRC-LIBLOUIS-BRAILLE-SPECS

**Title:** liblouis/braille-specs repository

**Classification:** provenance-repository-baseline

**Normative:** false

**Pinned repository commit:**

`3eca6dd444c9bbdfacf393119b01986398ab7ea0`

Repository:

`https://github.com/liblouis/braille-specs`

At this baseline revision, the repository serves as a general collection of Braille specification materials.

It is recorded because the Persian source audit proposes provenance material for this repository.

It is not itself treated as a Persian Braille rule source unless a Persian-specific source record is later added.

---

## SRC-LEGACY-V1

**Title:** Persian-to-Braille v1 reconstructed legacy archive

**Historical period:** Mehr 1395 SH / 2016

**Classification:** historical-project-evidence

**Normative:** false

**Repository tag:**

`v1.0.0-legacy`

Evidence includes:

- Word VBA implementation
- Excel VBA implementation
- historical SQL mapping table
- recovered project documentation
- deterministic extracted mapping datasets
- legacy conformance seed
- archive manifest

Legacy evidence may support compatibility testing and historical comparison.

It cannot independently establish normative Persian Braille v2 rules.

---

## Registry Rule

The existence of a source in this registry does not imply endorsement.

Normative decisions are made rule-by-rule through the standards evidence matrix.
