# Phase 15.3K2 — BSKDL Kurzschrift §4.9.2 Wortfugen Restriction

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative rule

**Kürzungen über Wortfugen hinweg sind nicht zulässig.**

A Kurzschrift contraction must therefore never consume characters across a lexical/morphological word junction.

## Direct source pairs

| Contraction | Allowed | Forbidden |
|---|---|---|
| ABER | Aberwitz | aberkennen |
| BLEIB | Bleiberecht | Bleibeschichtung |
| GANZ | Ganztagsschule | Jogginganzug |
| DANK | Dankeschön | Mordanklage |
| PERSON | Personenwaage | Supersonderpreis |

## Coverage

- Formal rules: `2`
- Positive direct cases: `5`
- Negative direct cases: `5`
- Policy cases: `2`
- Validation cases: `12`
- §4.9.2 formal coverage: `COMPLETE`

## Dependency state

`SECTION_4_9_APPLICATION_RESTRICTIONS` is now **partially resolved**.

The `WORD_JUNCTION_RESTRICTION` component is formally resolved by §4.9.2.

Remaining source subsections:

- `4.9.3 Eigennamen`
- `4.9.4 Beachtung von Wortstämmen`
- `4.9.5 Beachtung von Prä- und Suffixen`

## Promotion state

- Wortfugen rule: `FORMALLY RESOLVED`
- Runtime word-junction segmentation: `PENDING`
- Overall §4.9 restriction audit: `IN PROGRESS`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3K3 — §4.9.3 Eigennamen**.
