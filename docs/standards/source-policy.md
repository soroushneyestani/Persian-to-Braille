# Persian Braille Source Policy

## 1. Purpose

Persian-to-Braille v2 separates historical evidence, encoding standards, institutional publications, reference implementations, research audits, and project-specific legacy behavior.

No translation rule becomes normative merely because it exists in a previous implementation.

---

## 2. Evidence Classes

### Encoding Normative

Authoritative standards defining character encoding or representation.

Example:

- Unicode Braille Patterns

Encoding authority does not automatically imply authority over Persian linguistic or Braille translation rules.

### Current Institutional Normative

A rule source issued or explicitly maintained by a competent institution and verified as currently normative.

No Persian source has yet been assigned this classification by this project.

### Historical Institutional

A publication issued by a relevant institution but whose current normative status has not been established.

Example:

- `مجموعه علائم بریل`, 1393 / 2014

### De-facto Reference Implementation

A maintained implementation used in real-world Braille translation ecosystems but not treated by this project as the normative Persian specification.

Example:

- Liblouis `fa-ir-g1.utb`

### Research Audit

Analysis comparing sources and implementations.

Example:

- Liblouis issue #2053

Research audits provide evidence and discrepancy discovery but do not independently define normative rules.

### Candidate Implementation

A proposed or draft implementation that has not yet completed review or validation.

Example:

- Liblouis PR #2054

### Historical Project Evidence

Recovered behavior from Persian-to-Braille v1.

Legacy behavior is useful for provenance, compatibility, and regression analysis but is never sufficient by itself to define v2 behavior.

---

## 3. Rule Adoption Policy

Every normative v2 rule must record:

- rule identifier
- input character or context
- resulting Braille cells
- applicable profile
- evidence source identifiers
- evidence classification
- implementation status
- unresolved disagreements
- decision rationale

Rules must not silently resolve disagreements between sources.

---

## 4. Scope-Specific Authority

Authority is evaluated by subject.

For example:

- Unicode is authoritative for Unicode Braille encoding.
- Unicode does not define Persian literary Braille translation rules.
- An Iranian institutional Braille manual may provide strong evidence for Persian translation rules.
- Liblouis provides implementation evidence.
- Persian-to-Braille v1 provides historical project evidence.

There is therefore no universal source-ranking order independent of the rule being evaluated.

---

## 5. Current Normative Status

As of the Phase 1 audit baseline, the project has not verified a currently normative national Persian Braille publication.

The 1393/2014 Iranian manual is therefore classified as historical institutional evidence until stronger verification is obtained.

This classification may change if authoritative evidence is located.

---

## 6. Reproducibility

Mutable implementation sources must be pinned to immutable commit identifiers whenever possible.

Research issues and pull requests must record:

- observed status
- observation date
- related commit identifiers when available

Moving branches such as `master` must never be used as the sole reproducibility reference.

---

## 7. Binary and Copyright Policy

Source documents or fonts must not be redistributed unless redistribution rights are established.

Metadata, hashes, bibliographic information, page references, and independent rule observations may be stored when legally appropriate.

---

## 8. Normative versus Compatibility Profiles

The project maintains a strict distinction between:

- normative Persian Braille profiles
- legacy compatibility profiles

The `legacy-v1` profile, if implemented, reproduces historical behavior.

It must never be described as the normative Persian Braille specification.
