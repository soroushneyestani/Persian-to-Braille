# Phase 15.3B — BSKDL Kurzschrift Lautgruppenkürzungen Inventory

Status: **INVENTORY COMPLETE — NOT PROMOTED**

## Normative source

- Authority: BSKDL
- Chapter: `4 Die Kurzschrift`
- Section: `4.1.1 Liste der Lautgruppenkürzungen`
- Chapter SHA-256: `73a98857438638cc4f2e77de0b4adc59490084e9c30406ae513786d5532c9669`
- Section SHA-256: `5ba52efbcc766d7c4a1a3e47c1a201c57ffea783553da10b2144c998df1c79d0`

## Independent inventory result

- Total Lautgruppen: `39`
- Inherited from Vollschrift: `8`
- Kurzschrift additions: `31`
- Single-cell Sigels: `34`
- Multi-cell Sigels: `5`
- Unique Sigel sequences: `37`
- Sigel reuse groups: `2`
- Same-position Sigel collisions: `0`
- Six-dot validation: `PASS`

## Mapping inventory

| # | Lautgruppe | Sigel | Dots | Origin | Anlaut | Inlaut | Auslaut |
|---:|---|---|---|---|:---:|:---:|:---:|
| 1 | ACH | ⠰ | 56 | Kurzschrift | — | ✓ | ✓ |
| 2 | AL | ⠒ | 25 | Kurzschrift | ✓ | ✓ | — |
| 3 | AN | ⠖ | 235 | Kurzschrift | ✓ | ✓ | — |
| 4 | AR | ⠴ | 356 | Kurzschrift | ✓ | ✓ | — |
| 5 | ATION | ⠐⠝ | 5+1345 | Kurzschrift | — | ✓ | ✓ |
| 6 | ATIV | ⠐⠧ | 5+1236 | Kurzschrift | — | ✓ | ✓ |
| 7 | AU | ⠡ | 16 | Vollschrift | ✓ | ✓ | ✓ |
| 8 | ÄU | ⠌ | 34 | Vollschrift | ✓ | ✓ | ✓ |
| 9 | BE | ⠆ | 23 | Kurzschrift | ✓ | ✓ | — |
| 10 | CH | ⠹ | 1456 | Vollschrift | ✓ | ✓ | ✓ |
| 11 | CK | ⠨ | 46 | Kurzschrift | — | ✓ | ✓ |
| 12 | EH | ⠶ | 2356 | Kurzschrift | — | ✓ | — |
| 13 | EI | ⠩ | 146 | Vollschrift | ✓ | ✓ | ✓ |
| 14 | EIN | ⠫ | 1246 | Kurzschrift | ✓ | ✓ | ✓ |
| 15 | EL | ⠽ | 13456 | Kurzschrift | ✓ | ✓ | ✓ |
| 16 | EM | ⠷ | 12356 | Kurzschrift | ✓ | ✓ | ✓ |
| 17 | EN | ⠉ | 14 | Kurzschrift | ✓ | ✓ | ✓ |
| 18 | ER | ⠻ | 12456 | Kurzschrift | ✓ | ✓ | ✓ |
| 19 | ES | ⠿ | 123456 | Kurzschrift | ✓ | ✓ | ✓ |
| 20 | EU | ⠣ | 126 | Vollschrift | ✓ | ✓ | ✓ |
| 21 | EX | ⠭ | 1346 | Kurzschrift | ✓ | — | — |
| 22 | GE | ⠯ | 12346 | Kurzschrift | ✓ | ✓ | ✓ |
| 23 | ICH | ⠼ | 3456 | Kurzschrift | — | ✓ | ✓ |
| 24 | IE | ⠬ | 346 | Vollschrift | — | ✓ | ✓ |
| 25 | IG | ⠘ | 45 | Kurzschrift | — | ✓ | ✓ |
| 26 | IN | ⠔ | 35 | Kurzschrift | ✓ | ✓ | ✓ |
| 27 | ISMUS | ⠐⠊ | 5+24 | Kurzschrift | — | ✓ | ✓ |
| 28 | ISTISCH | ⠐⠱ | 5+156 | Kurzschrift | — | ✓ | ✓ |
| 29 | ITÄT | ⠐⠜ | 5+345 | Kurzschrift | — | ✓ | ✓ |
| 30 | LICH | ⠸ | 456 | Kurzschrift | — | ✓ | ✓ |
| 31 | LL | ⠟ | 12345 | Kurzschrift | — | ✓ | ✓ |
| 32 | MM | ⠭ | 1346 | Kurzschrift | — | ✓ | ✓ |
| 33 | OR | ⠢ | 26 | Kurzschrift | ✓ | ✓ | — |
| 34 | PRO | ⠟ | 12345 | Kurzschrift | ✓ | — | — |
| 35 | SCH | ⠱ | 156 | Vollschrift | ✓ | ✓ | ✓ |
| 36 | SS | ⠮ | 2346 | Kurzschrift | — | ✓ | ✓ |
| 37 | ST | ⠾ | 23456 | Vollschrift | ✓ | ✓ | ✓ |
| 38 | TE | ⠦ | 236 | Kurzschrift | — | ✓ | ✓ |
| 39 | UN | ⠲ | 256 | Kurzschrift | ✓ | ✓ | ✓ |

## Sigel reuse audit

- `⠭` / dots `1346`: EX, MM — `POSITIONALLY_DISJOINT_REUSE`
- `⠟` / dots `12345`: LL, PRO — `POSITIONALLY_DISJOINT_REUSE`

Both reuse groups are positionally disjoint.

Therefore the §4.1.1 inventory contains no same-position Sigel collision.

## Promotion state

- Inventory: `COMPLETE`
- Application-rule formalization: `NOT STARTED`
- Precedence model: `NOT PROMOTED`
- Core implementation: `NOT STARTED`
- SDK implementation: `NOT STARTED`
- Office integration: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3C — Kurzschrift Lautgruppenkürzungen Application Rules Audit**.
