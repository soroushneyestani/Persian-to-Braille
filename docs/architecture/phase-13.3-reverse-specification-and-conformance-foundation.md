# Phase 13.3 — Reverse Specification and Conformance Foundation

## Status

**MATERIALIZED / VALIDATION REQUIRED**

Phase 13.3 establishes the first canonical reverse-specific specification
artifacts without implementing the reverse runtime engine.

## Inputs

The foundation is grounded in:

```text
Phase 13.2 frozen reverse architecture/contract
Phase 13.1b ambiguity classification
176 canonical forward rules
176 canonical forward conformance vectors
```

The Phase 13.3a audit found no pre-existing reverse-specific spec artifacts and
confirmed the repository JSON-Schema convention uses draft 2020-12.

## Reverse specification boundary

```text
spec/fa-ir/reverse/
├── README.md
├── schemas/
│   ├── reverse-policy.schema.json
│   ├── reverse-profile.schema.json
│   └── reverse-conformance.schema.json
├── policy/
│   └── fa-ir-g1-reverse-policy.json
├── profiles/
│   └── fa-ir-g1-reverse.json
└── conformance/
    ├── manifest.json
    └── records/
```

The 176 forward rules remain direction=`forward` and are not rewritten.

## Seed conformance

The foundation materializes **16 independent reverse seed records**.

They cover:

- one directly reversible Persian letter;
- numeric mode with Persian, ASCII, and Arabic-Indic rendering policies;
- numeric decimal context;
- Latin span state;
- Latin capitalization;
- Persian punctuation canonicalization;
- strict ambiguity failure;
- ellipsis longest-match behavior;
- same-cell paired punctuation using delimiter context;
- invalid non-Braille input;
- unterminated Latin span;
- dangling capital indicator;
- exact-layout non-recoverability;
- exact-ZWNJ non-recoverability.

The seed set is deliberately not a mechanical inversion of all 176 forward
vectors.

## Conformance kinds

Two record kinds are defined:

```text
translation
capability
```

`translation` vectors describe successful or failed reverse translations.

`capability` records capture negative guarantees that cannot be represented by
inventing a lost Braille input, such as exact source-layout recovery.

## No runtime implementation

Phase 13.3 does not add:

```text
createPersianBrailleReverseTranslator
translateFromBraille
reverse Core parser
reverse SDK runtime
```

Those belong to later Phase 13 implementation work.

## Next

```text
Phase 13.4 — Reverse Core Parser Foundation
```
