# Phase 2.13 — Evidence Adjudication Planning

Phase 2.13 converts the 253 deterministic Phase 2.12 evidence packets into an ordered human-adjudication plan.

This stage does not adjudicate decisions, does not modify the promotion policy, does not promote rules, and does not change the `fa-ir-g1` profile.

## Summary

- Planned adjudication items: 253
- REVIEW-REQUIRED: 252
- UNRESOLVED: 1
- Adjudication batches: 3
- Promotion-eligible items created by planning: 0
- Maintainer decisions recorded: 0
- Profile status: `draft`
- Current promotion-policy version: `1.0.0`

## Adjudication tracks

| Priority | Track | Items | Purpose |
|---:|---|---:|---|
| 0 | `unresolved` | 1 | Phase 1 could not establish a project decision. Evidence must be examined before any disposition can be proposed. |
| 2 | `implementation-conflict` | 76 | Observed stable and draft implementations differ and require explicit adjudication. |
| 3 | `implementation-alignment` | 176 | Observed stable and draft implementations align, but the Phase 1 decision remains REVIEW-REQUIRED and therefore still requires human adjudication. |

## Stable/draft evidence relationships

- `different-observed-behavior`: 76
- `same-observed-behavior`: 177

## Review signals

- `dot78Signal`: 80
- `formatOrLayoutSignal`: 39
- `hasSupplementalEvidence`: 18
- `legacyEvidenceObserved`: 114
- `manualEvidenceObserved`: 192
- `mixedLatinSignal`: 56
- `researchAudit2053Observed`: 180

## Candidate disposition vocabulary

The vocabulary below defines possible future adjudication outcomes. No outcome is selected in Phase 2.13.

- `accept-rule` — Accept a forward translation rule for project specification.
- `accept-normalization` — Resolve through explicit Unicode/text normalization behavior.
- `accept-context-rule` — Resolve through context-sensitive translation behavior.
- `accept-mode-rule` — Resolve through a translation mode boundary or mode marker rule.
- `accept-layout-policy` — Resolve as project layout/whitespace policy rather than a character rule.
- `ignore-format-control` — Explicitly ignore a format/control scalar in the selected profile.
- `explicitly-unsupported` — Record that the selected profile intentionally does not support the item.
- `out-of-scope` — Record that the item is outside the selected profile/specification scope.
- `defer-pending-evidence` — Keep the item unresolved pending stronger evidence.

## Governance boundary

Phase 1 classifications remain historical evidence and are not rewritten by adjudication planning.

Under the current promotion policy, REVIEW-REQUIRED and UNRESOLVED items do not become promotion-eligible merely because a future adjudication approves a disposition. Any adjudication-based promotion route requires a separate governance stage.

The project continues to make no claim that these decisions are the current official Iranian national Braille standard.

## Planned items

| Plan item | Decision | Track | Stage | Category | Dot7/8 |
|---|---|---|---|---|---|
| `FA-ADJ-PLAN-001` | `FA-VAR-013` | `unresolved` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-002` | `FA-FMT-001` | `implementation-conflict` | 1.3 | orthographic-variants | yes |
| `FA-ADJ-PLAN-079` | `FA-PUNC-015` | `implementation-conflict` | 1.4 | numbers-punctuation | yes |
| `FA-ADJ-PLAN-085` | `FA-LATIN-001` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-086` | `FA-LATIN-002` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-087` | `FA-LATIN-003` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-088` | `FA-LATIN-004` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-089` | `FA-LATIN-005` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-090` | `FA-LATIN-006` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-091` | `FA-LATIN-007` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-092` | `FA-LATIN-008` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-093` | `FA-LATIN-009` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-094` | `FA-LATIN-010` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-095` | `FA-LATIN-011` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-096` | `FA-LATIN-012` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-097` | `FA-LATIN-013` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-098` | `FA-LATIN-014` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-099` | `FA-LATIN-015` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-100` | `FA-LATIN-016` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-101` | `FA-LATIN-017` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-102` | `FA-LATIN-018` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-103` | `FA-LATIN-019` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-104` | `FA-LATIN-020` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-105` | `FA-LATIN-021` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-106` | `FA-LATIN-022` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-107` | `FA-LATIN-023` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-108` | `FA-LATIN-024` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-109` | `FA-LATIN-025` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-110` | `FA-LATIN-026` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-111` | `FA-LATIN-027` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-112` | `FA-LATIN-028` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-113` | `FA-LATIN-029` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-114` | `FA-LATIN-030` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-115` | `FA-LATIN-031` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-116` | `FA-LATIN-032` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-117` | `FA-LATIN-033` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-118` | `FA-LATIN-034` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-119` | `FA-LATIN-035` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-120` | `FA-LATIN-036` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-121` | `FA-LATIN-037` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-122` | `FA-LATIN-038` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-123` | `FA-LATIN-039` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-124` | `FA-LATIN-040` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-125` | `FA-LATIN-041` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-126` | `FA-LATIN-042` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-127` | `FA-LATIN-043` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-128` | `FA-LATIN-044` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-129` | `FA-LATIN-045` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-130` | `FA-LATIN-046` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-131` | `FA-LATIN-047` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-132` | `FA-LATIN-048` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-133` | `FA-LATIN-049` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-134` | `FA-LATIN-050` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-135` | `FA-LATIN-051` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-136` | `FA-LATIN-052` | `implementation-conflict` | 1.5 | mixed-latin | yes |
| `FA-ADJ-PLAN-003` | `FA-FMT-002` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-004` | `FA-FMT-003` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-005` | `FA-FMT-004` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-006` | `FA-FMT-005` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-007` | `FA-FMT-006` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-008` | `FA-FMT-007` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-009` | `FA-FMT-008` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-010` | `FA-FMT-009` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-011` | `FA-FMT-010` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-012` | `FA-FMT-011` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-013` | `FA-FMT-012` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-014` | `FA-SEQ-001` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-016` | `FA-SEQ-003` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-026` | `FA-VAR-011` | `implementation-conflict` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-076` | `FA-PUNC-012` | `implementation-conflict` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-077` | `FA-PUNC-013` | `implementation-conflict` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-078` | `FA-PUNC-014` | `implementation-conflict` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-137` | `FA-LATIN-MODE-001` | `implementation-conflict` | 1.5 | mixed-latin | no |
| `FA-ADJ-PLAN-138` | `FA-LATIN-MODE-002` | `implementation-conflict` | 1.5 | mixed-latin | no |
| `FA-ADJ-PLAN-139` | `FA-LATIN-MODE-003` | `implementation-conflict` | 1.5 | mixed-latin | no |
| `FA-ADJ-PLAN-140` | `FA-LATIN-MODE-004` | `implementation-conflict` | 1.5 | mixed-latin | no |
| `FA-ADJ-PLAN-167` | `FA-WS-027` | `implementation-conflict` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-168` | `FA-REM-001` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-171` | `FA-REM-004` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-179` | `FA-REM-012` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-181` | `FA-REM-014` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-182` | `FA-REM-015` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-183` | `FA-REM-016` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-185` | `FA-REM-018` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-192` | `FA-REM-025` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-194` | `FA-REM-027` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-195` | `FA-REM-028` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-196` | `FA-REM-029` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-215` | `FA-REM-048` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-221` | `FA-REM-054` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-222` | `FA-REM-055` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-223` | `FA-REM-056` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-226` | `FA-REM-059` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-227` | `FA-REM-060` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-228` | `FA-REM-061` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-233` | `FA-REM-CTX-004` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-234` | `FA-REM-CTX-005` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-241` | `FA-REM-CTX-012` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-242` | `FA-REM-CTX-013` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-244` | `FA-REM-CTX-015` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-247` | `FA-REM-EMPH-003` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-251` | `FA-REM-EMPH-007` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-253` | `FA-REM-EMPH-009` | `implementation-alignment` | 1.7 | remaining-coverage | yes |
| `FA-ADJ-PLAN-015` | `FA-SEQ-002` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-017` | `FA-VAR-001` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-018` | `FA-VAR-002` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-019` | `FA-VAR-003` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-020` | `FA-VAR-004` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-021` | `FA-VAR-005` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-022` | `FA-VAR-006` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-023` | `FA-VAR-007` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-024` | `FA-VAR-008` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-025` | `FA-VAR-009` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-027` | `FA-VAR-012` | `implementation-alignment` | 1.3 | orthographic-variants | no |
| `FA-ADJ-PLAN-028` | `FA-DIGIT-ARABIC-INDIC-0` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-029` | `FA-DIGIT-ARABIC-INDIC-1` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-030` | `FA-DIGIT-ARABIC-INDIC-2` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-031` | `FA-DIGIT-ARABIC-INDIC-3` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-032` | `FA-DIGIT-ARABIC-INDIC-4` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-033` | `FA-DIGIT-ARABIC-INDIC-5` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-034` | `FA-DIGIT-ARABIC-INDIC-6` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-035` | `FA-DIGIT-ARABIC-INDIC-7` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-036` | `FA-DIGIT-ARABIC-INDIC-8` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-037` | `FA-DIGIT-ARABIC-INDIC-9` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-038` | `FA-DIGIT-ASCII-0` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-039` | `FA-DIGIT-ASCII-1` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-040` | `FA-DIGIT-ASCII-2` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-041` | `FA-DIGIT-ASCII-3` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-042` | `FA-DIGIT-ASCII-4` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-043` | `FA-DIGIT-ASCII-5` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-044` | `FA-DIGIT-ASCII-6` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-045` | `FA-DIGIT-ASCII-7` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-046` | `FA-DIGIT-ASCII-8` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-047` | `FA-DIGIT-ASCII-9` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-048` | `FA-DIGIT-PERSIAN-0` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-049` | `FA-DIGIT-PERSIAN-1` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-050` | `FA-DIGIT-PERSIAN-2` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-051` | `FA-DIGIT-PERSIAN-3` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-052` | `FA-DIGIT-PERSIAN-4` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-053` | `FA-DIGIT-PERSIAN-5` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-054` | `FA-DIGIT-PERSIAN-6` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-055` | `FA-DIGIT-PERSIAN-7` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-056` | `FA-DIGIT-PERSIAN-8` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-057` | `FA-DIGIT-PERSIAN-9` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-058` | `FA-NUMRULE-001` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-059` | `FA-NUMRULE-002` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-060` | `FA-NUMRULE-003` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-061` | `FA-NUMRULE-004` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-062` | `FA-NUMRULE-005` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-063` | `FA-NUMRULE-006` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-064` | `FA-NUMRULE-007` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-065` | `FA-PUNC-001` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-066` | `FA-PUNC-002` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-067` | `FA-PUNC-003` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-068` | `FA-PUNC-004` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-069` | `FA-PUNC-005` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-070` | `FA-PUNC-006` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-071` | `FA-PUNC-007` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-072` | `FA-PUNC-008` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-073` | `FA-PUNC-009` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-074` | `FA-PUNC-010` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-075` | `FA-PUNC-011` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-080` | `FA-PUNC-016` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-081` | `FA-PUNC-017` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-082` | `FA-PUNC-018` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-083` | `FA-PUNC-019` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-084` | `FA-PUNC-020` | `implementation-alignment` | 1.4 | numbers-punctuation | no |
| `FA-ADJ-PLAN-141` | `FA-WS-001` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-142` | `FA-WS-002` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-143` | `FA-WS-003` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-144` | `FA-WS-004` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-145` | `FA-WS-005` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-146` | `FA-WS-006` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-147` | `FA-WS-007` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-148` | `FA-WS-008` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-149` | `FA-WS-009` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-150` | `FA-WS-010` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-151` | `FA-WS-011` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-152` | `FA-WS-012` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-153` | `FA-WS-013` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-154` | `FA-WS-014` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-155` | `FA-WS-015` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-156` | `FA-WS-016` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-157` | `FA-WS-017` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-158` | `FA-WS-018` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-159` | `FA-WS-019` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-160` | `FA-WS-020` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-161` | `FA-WS-021` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-162` | `FA-WS-022` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-163` | `FA-WS-023` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-164` | `FA-WS-024` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-165` | `FA-WS-025` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-166` | `FA-WS-026` | `implementation-alignment` | 1.6 | whitespace-layout | no |
| `FA-ADJ-PLAN-169` | `FA-REM-002` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-170` | `FA-REM-003` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-172` | `FA-REM-005` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-173` | `FA-REM-006` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-174` | `FA-REM-007` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-175` | `FA-REM-008` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-176` | `FA-REM-009` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-177` | `FA-REM-010` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-178` | `FA-REM-011` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-180` | `FA-REM-013` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-184` | `FA-REM-017` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-186` | `FA-REM-019` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-187` | `FA-REM-020` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-188` | `FA-REM-021` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-189` | `FA-REM-022` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-190` | `FA-REM-023` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-191` | `FA-REM-024` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-193` | `FA-REM-026` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-197` | `FA-REM-030` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-198` | `FA-REM-031` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-199` | `FA-REM-032` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-200` | `FA-REM-033` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-201` | `FA-REM-034` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-202` | `FA-REM-035` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-203` | `FA-REM-036` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-204` | `FA-REM-037` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-205` | `FA-REM-038` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-206` | `FA-REM-039` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-207` | `FA-REM-040` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-208` | `FA-REM-041` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-209` | `FA-REM-042` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-210` | `FA-REM-043` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-211` | `FA-REM-044` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-212` | `FA-REM-045` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-213` | `FA-REM-046` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-214` | `FA-REM-047` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-216` | `FA-REM-049` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-217` | `FA-REM-050` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-218` | `FA-REM-051` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-219` | `FA-REM-052` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-220` | `FA-REM-053` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-224` | `FA-REM-057` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-225` | `FA-REM-058` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-229` | `FA-REM-062` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-230` | `FA-REM-CTX-001` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-231` | `FA-REM-CTX-002` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-232` | `FA-REM-CTX-003` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-235` | `FA-REM-CTX-006` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-236` | `FA-REM-CTX-007` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-237` | `FA-REM-CTX-008` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-238` | `FA-REM-CTX-009` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-239` | `FA-REM-CTX-010` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-240` | `FA-REM-CTX-011` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-243` | `FA-REM-CTX-014` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-245` | `FA-REM-EMPH-001` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-246` | `FA-REM-EMPH-002` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-248` | `FA-REM-EMPH-004` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-249` | `FA-REM-EMPH-005` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-250` | `FA-REM-EMPH-006` | `implementation-alignment` | 1.7 | remaining-coverage | no |
| `FA-ADJ-PLAN-252` | `FA-REM-EMPH-008` | `implementation-alignment` | 1.7 | remaining-coverage | no |
