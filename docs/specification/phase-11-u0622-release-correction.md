# Phase 11 — U+0622 Release Correction

## Status

**CANDIDATE RUNTIME CORRECTION / NOT NORMATIVE PROMOTION**

A live Microsoft Word on Windows test exposed that Persian text containing
`آ` (`U+0622`, ARABIC LETTER ALEF WITH MADDA ABOVE) failed through the shared
SDK/Core path.

The Office host itself is not patched. Word continues to delegate translation
to the public SDK, and the SDK continues to delegate to Core.

## Frozen historical state

The original Phase 1/2 evidence and adjudication remain unchanged:

```text
Decision item:   FA-VAR-001
Classification:  REVIEW-REQUIRED
Adjudication:    FA-ADJ-VAR-001-001
Disposition:     defer-pending-evidence
Result:          deferred
```

This release correction does **not** rewrite that historical decision.

## New maintainer release decision

For the draft `fa-ir-g1` runtime profile, U+0622 is admitted as a
**candidate direct character rule**:

```text
آ
U+0622
dots 345
⠜
U+281C
```

Basis:

- pinned Liblouis stable evidence: dots `345`;
- pinned Liblouis draft evidence: dots `345`;
- preserved legacy Word mapping: dedicated `>` value;
- preserved legacy Excel mapping: dedicated `>` value;
- live Microsoft 365 reproduction demonstrates that leaving the scalar
  unsupported is a user-visible release defect.

The earlier uncertainty was whether U+0622 belonged in direct translation,
normalization, or a non-character layer. This release decision chooses direct
character translation because the pinned stable and draft implementations
both expose U+0622 as an explicit mapped scalar with the same dots.

## Governance boundary

This is intentionally **candidate**, not project-normative:

```text
historical Phase 1 classification rewritten: NO
historical Phase 2.14 adjudication rewritten: NO
normative promotion: NO
promotionEligible: false
official Iranian-standard claim: NO
fa-ir-g1 profile status: draft
```

A future normative transition still requires the project's separate promotion
governance.

## Runtime artifacts

```text
Rule:
spec/fa-ir/rules/records/fa-g1-var-001.json

Conformance:
spec/fa-ir/conformance/records/fa-conf-var-001.json

Maintainer correction record:
spec/fa-ir/governance/release-corrections/fa-rel-corr-u0622-001.json
```

The generated Core runtime bundle remains derived from the `fa-ir-g1` profile
and `spec/fa-ir/rules/records`; no Office-only mapping is introduced.

## Regression boundary

The release regression freezes:

```text
آ      -> successful SDK translation; Unicode Braille is ⠜
آموزش -> successful SDK translation; first Unicode Braille cell is ⠜
```

Word/Excel/PowerPoint continue to consume the shared SDK behavior.
