# Phase 2.12 — Evidence Packet Generation

Phase 2.12 transforms the 253-item Phase 2.11 review queue into one deterministic evidence packet per decision.

The packets preserve source material already recorded by the project. They do not adjudicate decisions, promote rules, or invent missing evidence.

## Summary

- Evidence packets: 253
- REVIEW-REQUIRED packets: 252
- UNRESOLVED packets: 1
- Promotion-eligible packets: 0
- Maintainer decisions recorded: 0
- Project-normative decisions made: 0
- Registered source IDs observed: 5
- Supplemental stage-evidence records preserved: 18
- Profile status: `draft`

## Categories

- `mixed-latin`: 56
- `numbers-punctuation`: 57
- `orthographic-variants`: 27
- `remaining-coverage`: 86
- `whitespace-layout`: 27

## Evidence channels observed

- `draftLiblouis`: 253
- `iranianManual`: 192
- `legacyV1`: 114
- `researchAudit2053`: 180
- `stableLiblouis`: 253

## Stable/draft comparison

- `different-observed-behavior`: 75
- `insufficient-data`: 27
- `same-observed-behavior`: 151

## Provenance inputs

- `spec/fa-ir/governance/review-queue.json` — `08862B1A3BA4E1FAF256A4D0736FF5E29A828BFAFC8E0F984E1FA18EAF7D2A3B`
- `spec/fa-ir/evidence/master-decision-matrix.json` — `9A3D8070D2364C368F7B1B4D9B661B114C74EE3BFFBC89BAED87DAD18CA4DB7A`
- `docs/standards/source-registry.md` — `DE21FE9525130597BAEA0F0BED275A169853D83E93CA6FECA4EFCAF397B42BA0`
- `spec/fa-ir/evidence/orthographic-variants.json` — `258C18412C2B0BBCA30DF1C2F5EE50FC9689B16825CB225E1C96F399DAC67831`
- `spec/fa-ir/evidence/numbers-punctuation.json` — `E203DA4EB068E614A9DEEF1BDFAAEBFCF7E037D6AA638B2A52C1E6DC3D620C9C`
- `spec/fa-ir/evidence/mixed-latin.json` — `53D970743AA8014A13C07C39CD8769F61100217243FF271ECB4EDE5FC35B480E`
- `spec/fa-ir/evidence/whitespace-layout.json` — `03138EA01B1213C4CE85D31D68766C49CE2BF7DDA5A105D50D7C2ED557997942`
- `spec/fa-ir/evidence/remaining-coverage.json` — `58196A992A4B0BA657ECD4F8313CC78DA625C556C2F918573388791BC312FCA9`

## Packet contract

Each packet contains the exact Phase 1 master decision, the canonical matching stage-evidence record, any same-ID supplemental stage-evidence records, relevant source-registry sections, stage source pins where available, observed evidence-channel coverage, and a neutral review question.

Each packet begins with:

- `recommendedDisposition = null`
- `maintainerDecision = null`
- `decisionRationale = null`
- `promotionEligible = false`

## Safety boundary

Evidence collection is not adjudication. No packet in this stage changes the project specification.

The `fa-ir-g1` profile remains `draft`.

## Packet index

| Packet | Decision | Classification | Stage | Category |
|---|---|---|---|---|
| `FA-EVIDENCE-001` | `FA-VAR-013` | UNRESOLVED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-002` | `FA-FMT-001` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-003` | `FA-FMT-002` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-004` | `FA-FMT-003` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-005` | `FA-FMT-004` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-006` | `FA-FMT-005` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-007` | `FA-FMT-006` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-008` | `FA-FMT-007` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-009` | `FA-FMT-008` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-010` | `FA-FMT-009` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-011` | `FA-FMT-010` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-012` | `FA-FMT-011` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-013` | `FA-FMT-012` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-014` | `FA-SEQ-001` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-015` | `FA-SEQ-002` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-016` | `FA-SEQ-003` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-017` | `FA-VAR-001` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-018` | `FA-VAR-002` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-019` | `FA-VAR-003` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-020` | `FA-VAR-004` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-021` | `FA-VAR-005` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-022` | `FA-VAR-006` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-023` | `FA-VAR-007` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-024` | `FA-VAR-008` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-025` | `FA-VAR-009` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-026` | `FA-VAR-011` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-027` | `FA-VAR-012` | REVIEW-REQUIRED | 1.3 | orthographic-variants |
| `FA-EVIDENCE-028` | `FA-DIGIT-ARABIC-INDIC-0` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-029` | `FA-DIGIT-ARABIC-INDIC-1` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-030` | `FA-DIGIT-ARABIC-INDIC-2` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-031` | `FA-DIGIT-ARABIC-INDIC-3` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-032` | `FA-DIGIT-ARABIC-INDIC-4` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-033` | `FA-DIGIT-ARABIC-INDIC-5` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-034` | `FA-DIGIT-ARABIC-INDIC-6` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-035` | `FA-DIGIT-ARABIC-INDIC-7` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-036` | `FA-DIGIT-ARABIC-INDIC-8` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-037` | `FA-DIGIT-ARABIC-INDIC-9` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-038` | `FA-DIGIT-ASCII-0` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-039` | `FA-DIGIT-ASCII-1` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-040` | `FA-DIGIT-ASCII-2` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-041` | `FA-DIGIT-ASCII-3` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-042` | `FA-DIGIT-ASCII-4` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-043` | `FA-DIGIT-ASCII-5` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-044` | `FA-DIGIT-ASCII-6` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-045` | `FA-DIGIT-ASCII-7` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-046` | `FA-DIGIT-ASCII-8` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-047` | `FA-DIGIT-ASCII-9` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-048` | `FA-DIGIT-PERSIAN-0` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-049` | `FA-DIGIT-PERSIAN-1` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-050` | `FA-DIGIT-PERSIAN-2` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-051` | `FA-DIGIT-PERSIAN-3` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-052` | `FA-DIGIT-PERSIAN-4` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-053` | `FA-DIGIT-PERSIAN-5` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-054` | `FA-DIGIT-PERSIAN-6` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-055` | `FA-DIGIT-PERSIAN-7` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-056` | `FA-DIGIT-PERSIAN-8` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-057` | `FA-DIGIT-PERSIAN-9` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-058` | `FA-NUMRULE-001` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-059` | `FA-NUMRULE-002` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-060` | `FA-NUMRULE-003` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-061` | `FA-NUMRULE-004` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-062` | `FA-NUMRULE-005` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-063` | `FA-NUMRULE-006` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-064` | `FA-NUMRULE-007` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-065` | `FA-PUNC-001` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-066` | `FA-PUNC-002` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-067` | `FA-PUNC-003` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-068` | `FA-PUNC-004` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-069` | `FA-PUNC-005` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-070` | `FA-PUNC-006` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-071` | `FA-PUNC-007` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-072` | `FA-PUNC-008` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-073` | `FA-PUNC-009` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-074` | `FA-PUNC-010` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-075` | `FA-PUNC-011` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-076` | `FA-PUNC-012` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-077` | `FA-PUNC-013` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-078` | `FA-PUNC-014` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-079` | `FA-PUNC-015` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-080` | `FA-PUNC-016` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-081` | `FA-PUNC-017` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-082` | `FA-PUNC-018` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-083` | `FA-PUNC-019` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-084` | `FA-PUNC-020` | REVIEW-REQUIRED | 1.4 | numbers-punctuation |
| `FA-EVIDENCE-085` | `FA-LATIN-001` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-086` | `FA-LATIN-002` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-087` | `FA-LATIN-003` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-088` | `FA-LATIN-004` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-089` | `FA-LATIN-005` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-090` | `FA-LATIN-006` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-091` | `FA-LATIN-007` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-092` | `FA-LATIN-008` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-093` | `FA-LATIN-009` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-094` | `FA-LATIN-010` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-095` | `FA-LATIN-011` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-096` | `FA-LATIN-012` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-097` | `FA-LATIN-013` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-098` | `FA-LATIN-014` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-099` | `FA-LATIN-015` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-100` | `FA-LATIN-016` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-101` | `FA-LATIN-017` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-102` | `FA-LATIN-018` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-103` | `FA-LATIN-019` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-104` | `FA-LATIN-020` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-105` | `FA-LATIN-021` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-106` | `FA-LATIN-022` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-107` | `FA-LATIN-023` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-108` | `FA-LATIN-024` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-109` | `FA-LATIN-025` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-110` | `FA-LATIN-026` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-111` | `FA-LATIN-027` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-112` | `FA-LATIN-028` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-113` | `FA-LATIN-029` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-114` | `FA-LATIN-030` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-115` | `FA-LATIN-031` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-116` | `FA-LATIN-032` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-117` | `FA-LATIN-033` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-118` | `FA-LATIN-034` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-119` | `FA-LATIN-035` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-120` | `FA-LATIN-036` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-121` | `FA-LATIN-037` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-122` | `FA-LATIN-038` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-123` | `FA-LATIN-039` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-124` | `FA-LATIN-040` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-125` | `FA-LATIN-041` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-126` | `FA-LATIN-042` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-127` | `FA-LATIN-043` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-128` | `FA-LATIN-044` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-129` | `FA-LATIN-045` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-130` | `FA-LATIN-046` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-131` | `FA-LATIN-047` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-132` | `FA-LATIN-048` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-133` | `FA-LATIN-049` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-134` | `FA-LATIN-050` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-135` | `FA-LATIN-051` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-136` | `FA-LATIN-052` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-137` | `FA-LATIN-MODE-001` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-138` | `FA-LATIN-MODE-002` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-139` | `FA-LATIN-MODE-003` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-140` | `FA-LATIN-MODE-004` | REVIEW-REQUIRED | 1.5 | mixed-latin |
| `FA-EVIDENCE-141` | `FA-WS-001` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-142` | `FA-WS-002` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-143` | `FA-WS-003` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-144` | `FA-WS-004` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-145` | `FA-WS-005` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-146` | `FA-WS-006` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-147` | `FA-WS-007` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-148` | `FA-WS-008` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-149` | `FA-WS-009` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-150` | `FA-WS-010` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-151` | `FA-WS-011` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-152` | `FA-WS-012` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-153` | `FA-WS-013` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-154` | `FA-WS-014` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-155` | `FA-WS-015` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-156` | `FA-WS-016` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-157` | `FA-WS-017` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-158` | `FA-WS-018` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-159` | `FA-WS-019` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-160` | `FA-WS-020` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-161` | `FA-WS-021` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-162` | `FA-WS-022` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-163` | `FA-WS-023` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-164` | `FA-WS-024` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-165` | `FA-WS-025` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-166` | `FA-WS-026` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-167` | `FA-WS-027` | REVIEW-REQUIRED | 1.6 | whitespace-layout |
| `FA-EVIDENCE-168` | `FA-REM-001` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-169` | `FA-REM-002` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-170` | `FA-REM-003` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-171` | `FA-REM-004` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-172` | `FA-REM-005` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-173` | `FA-REM-006` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-174` | `FA-REM-007` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-175` | `FA-REM-008` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-176` | `FA-REM-009` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-177` | `FA-REM-010` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-178` | `FA-REM-011` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-179` | `FA-REM-012` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-180` | `FA-REM-013` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-181` | `FA-REM-014` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-182` | `FA-REM-015` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-183` | `FA-REM-016` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-184` | `FA-REM-017` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-185` | `FA-REM-018` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-186` | `FA-REM-019` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-187` | `FA-REM-020` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-188` | `FA-REM-021` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-189` | `FA-REM-022` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-190` | `FA-REM-023` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-191` | `FA-REM-024` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-192` | `FA-REM-025` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-193` | `FA-REM-026` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-194` | `FA-REM-027` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-195` | `FA-REM-028` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-196` | `FA-REM-029` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-197` | `FA-REM-030` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-198` | `FA-REM-031` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-199` | `FA-REM-032` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-200` | `FA-REM-033` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-201` | `FA-REM-034` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-202` | `FA-REM-035` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-203` | `FA-REM-036` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-204` | `FA-REM-037` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-205` | `FA-REM-038` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-206` | `FA-REM-039` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-207` | `FA-REM-040` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-208` | `FA-REM-041` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-209` | `FA-REM-042` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-210` | `FA-REM-043` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-211` | `FA-REM-044` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-212` | `FA-REM-045` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-213` | `FA-REM-046` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-214` | `FA-REM-047` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-215` | `FA-REM-048` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-216` | `FA-REM-049` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-217` | `FA-REM-050` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-218` | `FA-REM-051` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-219` | `FA-REM-052` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-220` | `FA-REM-053` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-221` | `FA-REM-054` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-222` | `FA-REM-055` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-223` | `FA-REM-056` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-224` | `FA-REM-057` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-225` | `FA-REM-058` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-226` | `FA-REM-059` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-227` | `FA-REM-060` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-228` | `FA-REM-061` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-229` | `FA-REM-062` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-230` | `FA-REM-CTX-001` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-231` | `FA-REM-CTX-002` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-232` | `FA-REM-CTX-003` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-233` | `FA-REM-CTX-004` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-234` | `FA-REM-CTX-005` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-235` | `FA-REM-CTX-006` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-236` | `FA-REM-CTX-007` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-237` | `FA-REM-CTX-008` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-238` | `FA-REM-CTX-009` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-239` | `FA-REM-CTX-010` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-240` | `FA-REM-CTX-011` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-241` | `FA-REM-CTX-012` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-242` | `FA-REM-CTX-013` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-243` | `FA-REM-CTX-014` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-244` | `FA-REM-CTX-015` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-245` | `FA-REM-EMPH-001` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-246` | `FA-REM-EMPH-002` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-247` | `FA-REM-EMPH-003` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-248` | `FA-REM-EMPH-004` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-249` | `FA-REM-EMPH-005` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-250` | `FA-REM-EMPH-006` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-251` | `FA-REM-EMPH-007` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-252` | `FA-REM-EMPH-008` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
| `FA-EVIDENCE-253` | `FA-REM-EMPH-009` | REVIEW-REQUIRED | 1.7 | remaining-coverage |
