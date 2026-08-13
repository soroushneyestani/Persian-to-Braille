# Phase 2.11 — Review Queue Planning

Phase 2.11 converts the unresolved Phase 1 decision surface into a deterministic, planning-only adjudication queue.

This stage does not promote rules, does not change the `fa-ir-g1` profile, and does not manufacture missing evidence.

## Scope

- Master decision items: 290
- Consensus baseline excluded: 37
- REVIEW-REQUIRED queued: 252
- UNRESOLVED queued: 1
- Total review queue: 253

## Category plan

| Priority | Phase 1 stage | Category | REVIEW-REQUIRED | UNRESOLVED | Total |
|---:|---|---|---:|---:|---:|
| 1 | 1.3 | Orthographic variants | 26 | 1 | 27 |
| 2 | 1.4 | Numbers and punctuation | 57 | 0 | 57 |
| 3 | 1.5 | Mixed Latin | 56 | 0 | 56 |
| 4 | 1.6 | Whitespace and layout | 27 | 0 | 27 |
| 5 | 1.7 | Remaining coverage | 86 | 0 | 86 |

## Adjudication contract

Every queue entry begins as `pending-adjudication`.

A future adjudication stage must record a recommended disposition, a maintainer decision, a decision rationale, and whether the decision has become promotion-eligible.

No queue entry is promotion-eligible merely because it appears in this planning artifact.

## Queue

| Queue ID | Decision | Classification | Stage | Category | Priority |
|---|---|---|---|---|---:|
| `FA-REVIEW-001` | `FA-VAR-013` | UNRESOLVED | 1.3 | orthographic-variants | 0 |
| `FA-REVIEW-002` | `FA-FMT-001` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-003` | `FA-FMT-002` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-004` | `FA-FMT-003` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-005` | `FA-FMT-004` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-006` | `FA-FMT-005` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-007` | `FA-FMT-006` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-008` | `FA-FMT-007` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-009` | `FA-FMT-008` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-010` | `FA-FMT-009` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-011` | `FA-FMT-010` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-012` | `FA-FMT-011` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-013` | `FA-FMT-012` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-014` | `FA-SEQ-001` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-015` | `FA-SEQ-002` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-016` | `FA-SEQ-003` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-017` | `FA-VAR-001` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-018` | `FA-VAR-002` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-019` | `FA-VAR-003` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-020` | `FA-VAR-004` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-021` | `FA-VAR-005` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-022` | `FA-VAR-006` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-023` | `FA-VAR-007` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-024` | `FA-VAR-008` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-025` | `FA-VAR-009` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-026` | `FA-VAR-011` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-027` | `FA-VAR-012` | REVIEW-REQUIRED | 1.3 | orthographic-variants | 1 |
| `FA-REVIEW-028` | `FA-DIGIT-ARABIC-INDIC-0` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-029` | `FA-DIGIT-ARABIC-INDIC-1` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-030` | `FA-DIGIT-ARABIC-INDIC-2` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-031` | `FA-DIGIT-ARABIC-INDIC-3` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-032` | `FA-DIGIT-ARABIC-INDIC-4` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-033` | `FA-DIGIT-ARABIC-INDIC-5` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-034` | `FA-DIGIT-ARABIC-INDIC-6` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-035` | `FA-DIGIT-ARABIC-INDIC-7` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-036` | `FA-DIGIT-ARABIC-INDIC-8` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-037` | `FA-DIGIT-ARABIC-INDIC-9` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-038` | `FA-DIGIT-ASCII-0` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-039` | `FA-DIGIT-ASCII-1` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-040` | `FA-DIGIT-ASCII-2` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-041` | `FA-DIGIT-ASCII-3` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-042` | `FA-DIGIT-ASCII-4` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-043` | `FA-DIGIT-ASCII-5` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-044` | `FA-DIGIT-ASCII-6` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-045` | `FA-DIGIT-ASCII-7` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-046` | `FA-DIGIT-ASCII-8` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-047` | `FA-DIGIT-ASCII-9` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-048` | `FA-DIGIT-PERSIAN-0` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-049` | `FA-DIGIT-PERSIAN-1` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-050` | `FA-DIGIT-PERSIAN-2` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-051` | `FA-DIGIT-PERSIAN-3` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-052` | `FA-DIGIT-PERSIAN-4` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-053` | `FA-DIGIT-PERSIAN-5` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-054` | `FA-DIGIT-PERSIAN-6` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-055` | `FA-DIGIT-PERSIAN-7` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-056` | `FA-DIGIT-PERSIAN-8` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-057` | `FA-DIGIT-PERSIAN-9` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-058` | `FA-NUMRULE-001` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-059` | `FA-NUMRULE-002` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-060` | `FA-NUMRULE-003` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-061` | `FA-NUMRULE-004` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-062` | `FA-NUMRULE-005` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-063` | `FA-NUMRULE-006` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-064` | `FA-NUMRULE-007` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-065` | `FA-PUNC-001` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-066` | `FA-PUNC-002` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-067` | `FA-PUNC-003` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-068` | `FA-PUNC-004` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-069` | `FA-PUNC-005` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-070` | `FA-PUNC-006` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-071` | `FA-PUNC-007` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-072` | `FA-PUNC-008` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-073` | `FA-PUNC-009` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-074` | `FA-PUNC-010` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-075` | `FA-PUNC-011` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-076` | `FA-PUNC-012` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-077` | `FA-PUNC-013` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-078` | `FA-PUNC-014` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-079` | `FA-PUNC-015` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-080` | `FA-PUNC-016` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-081` | `FA-PUNC-017` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-082` | `FA-PUNC-018` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-083` | `FA-PUNC-019` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-084` | `FA-PUNC-020` | REVIEW-REQUIRED | 1.4 | numbers-punctuation | 2 |
| `FA-REVIEW-085` | `FA-LATIN-001` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-086` | `FA-LATIN-002` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-087` | `FA-LATIN-003` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-088` | `FA-LATIN-004` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-089` | `FA-LATIN-005` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-090` | `FA-LATIN-006` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-091` | `FA-LATIN-007` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-092` | `FA-LATIN-008` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-093` | `FA-LATIN-009` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-094` | `FA-LATIN-010` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-095` | `FA-LATIN-011` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-096` | `FA-LATIN-012` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-097` | `FA-LATIN-013` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-098` | `FA-LATIN-014` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-099` | `FA-LATIN-015` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-100` | `FA-LATIN-016` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-101` | `FA-LATIN-017` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-102` | `FA-LATIN-018` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-103` | `FA-LATIN-019` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-104` | `FA-LATIN-020` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-105` | `FA-LATIN-021` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-106` | `FA-LATIN-022` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-107` | `FA-LATIN-023` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-108` | `FA-LATIN-024` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-109` | `FA-LATIN-025` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-110` | `FA-LATIN-026` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-111` | `FA-LATIN-027` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-112` | `FA-LATIN-028` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-113` | `FA-LATIN-029` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-114` | `FA-LATIN-030` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-115` | `FA-LATIN-031` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-116` | `FA-LATIN-032` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-117` | `FA-LATIN-033` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-118` | `FA-LATIN-034` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-119` | `FA-LATIN-035` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-120` | `FA-LATIN-036` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-121` | `FA-LATIN-037` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-122` | `FA-LATIN-038` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-123` | `FA-LATIN-039` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-124` | `FA-LATIN-040` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-125` | `FA-LATIN-041` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-126` | `FA-LATIN-042` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-127` | `FA-LATIN-043` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-128` | `FA-LATIN-044` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-129` | `FA-LATIN-045` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-130` | `FA-LATIN-046` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-131` | `FA-LATIN-047` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-132` | `FA-LATIN-048` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-133` | `FA-LATIN-049` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-134` | `FA-LATIN-050` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-135` | `FA-LATIN-051` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-136` | `FA-LATIN-052` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-137` | `FA-LATIN-MODE-001` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-138` | `FA-LATIN-MODE-002` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-139` | `FA-LATIN-MODE-003` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-140` | `FA-LATIN-MODE-004` | REVIEW-REQUIRED | 1.5 | mixed-latin | 3 |
| `FA-REVIEW-141` | `FA-WS-001` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-142` | `FA-WS-002` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-143` | `FA-WS-003` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-144` | `FA-WS-004` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-145` | `FA-WS-005` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-146` | `FA-WS-006` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-147` | `FA-WS-007` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-148` | `FA-WS-008` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-149` | `FA-WS-009` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-150` | `FA-WS-010` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-151` | `FA-WS-011` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-152` | `FA-WS-012` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-153` | `FA-WS-013` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-154` | `FA-WS-014` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-155` | `FA-WS-015` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-156` | `FA-WS-016` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-157` | `FA-WS-017` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-158` | `FA-WS-018` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-159` | `FA-WS-019` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-160` | `FA-WS-020` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-161` | `FA-WS-021` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-162` | `FA-WS-022` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-163` | `FA-WS-023` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-164` | `FA-WS-024` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-165` | `FA-WS-025` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-166` | `FA-WS-026` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-167` | `FA-WS-027` | REVIEW-REQUIRED | 1.6 | whitespace-layout | 4 |
| `FA-REVIEW-168` | `FA-REM-001` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-169` | `FA-REM-002` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-170` | `FA-REM-003` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-171` | `FA-REM-004` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-172` | `FA-REM-005` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-173` | `FA-REM-006` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-174` | `FA-REM-007` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-175` | `FA-REM-008` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-176` | `FA-REM-009` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-177` | `FA-REM-010` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-178` | `FA-REM-011` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-179` | `FA-REM-012` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-180` | `FA-REM-013` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-181` | `FA-REM-014` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-182` | `FA-REM-015` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-183` | `FA-REM-016` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-184` | `FA-REM-017` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-185` | `FA-REM-018` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-186` | `FA-REM-019` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-187` | `FA-REM-020` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-188` | `FA-REM-021` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-189` | `FA-REM-022` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-190` | `FA-REM-023` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-191` | `FA-REM-024` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-192` | `FA-REM-025` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-193` | `FA-REM-026` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-194` | `FA-REM-027` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-195` | `FA-REM-028` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-196` | `FA-REM-029` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-197` | `FA-REM-030` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-198` | `FA-REM-031` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-199` | `FA-REM-032` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-200` | `FA-REM-033` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-201` | `FA-REM-034` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-202` | `FA-REM-035` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-203` | `FA-REM-036` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-204` | `FA-REM-037` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-205` | `FA-REM-038` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-206` | `FA-REM-039` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-207` | `FA-REM-040` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-208` | `FA-REM-041` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-209` | `FA-REM-042` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-210` | `FA-REM-043` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-211` | `FA-REM-044` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-212` | `FA-REM-045` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-213` | `FA-REM-046` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-214` | `FA-REM-047` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-215` | `FA-REM-048` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-216` | `FA-REM-049` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-217` | `FA-REM-050` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-218` | `FA-REM-051` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-219` | `FA-REM-052` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-220` | `FA-REM-053` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-221` | `FA-REM-054` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-222` | `FA-REM-055` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-223` | `FA-REM-056` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-224` | `FA-REM-057` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-225` | `FA-REM-058` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-226` | `FA-REM-059` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-227` | `FA-REM-060` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-228` | `FA-REM-061` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-229` | `FA-REM-062` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-230` | `FA-REM-CTX-001` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-231` | `FA-REM-CTX-002` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-232` | `FA-REM-CTX-003` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-233` | `FA-REM-CTX-004` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-234` | `FA-REM-CTX-005` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-235` | `FA-REM-CTX-006` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-236` | `FA-REM-CTX-007` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-237` | `FA-REM-CTX-008` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-238` | `FA-REM-CTX-009` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-239` | `FA-REM-CTX-010` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-240` | `FA-REM-CTX-011` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-241` | `FA-REM-CTX-012` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-242` | `FA-REM-CTX-013` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-243` | `FA-REM-CTX-014` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-244` | `FA-REM-CTX-015` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-245` | `FA-REM-EMPH-001` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-246` | `FA-REM-EMPH-002` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-247` | `FA-REM-EMPH-003` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-248` | `FA-REM-EMPH-004` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-249` | `FA-REM-EMPH-005` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-250` | `FA-REM-EMPH-006` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-251` | `FA-REM-EMPH-007` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-252` | `FA-REM-EMPH-008` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |
| `FA-REVIEW-253` | `FA-REM-EMPH-009` | REVIEW-REQUIRED | 1.7 | remaining-coverage | 5 |

## Safety boundary

The 37 already-promoted consensus-baseline decisions are excluded from this queue.

The `fa-ir-g1` profile remains `draft` until the remaining review surface has been adjudicated and separately validated.
