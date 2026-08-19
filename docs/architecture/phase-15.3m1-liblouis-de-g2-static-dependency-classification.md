# Phase 15.3M1 — Liblouis de-g2 Static Dependency Classification

Status: **PASS**

Role: **NON-NORMATIVE COMPARATOR**

## Frozen comparator

- Commit: `fefb3a218cead90cf5e6df6a5fc8d6a69f4dbf2e`
- Root table: `tables/de-g2.ctb`
- Root SHA-256: `eb00a9c603885434bdc0615e1d7090d4e68db1d51a0f299f500c5d9d9494016e`
- Dependency files: `15`
- Dependency edges: `14`

## Static structure

```text
de-g2.ctb
├── de-g0.utb
│   └── inherited g0 dependency branch
├── de-g2-core.cti
│   └── de-g2-core-patterns.dic
└── braille-patterns.cti
```

## Root table

`de-g2.ctb` is statically an **include-only orchestrator** at this frozen commit.

Direct include order:

1. `de-g0.utb`
2. `de-g2-core.cti`
3. `braille-patterns.cti`

This observed implementation order is not promoted to a BSKDL normative order.

## Branch classification

- Root orchestrator: `1` file
- Inherited g0 baseline: `11` files
- g2-specific branch: `2` files
- Generic Braille-pattern support: `1` file

## g2-specific branch

```text
de-g2-core.cti
└── de-g2-core-patterns.dic
```

`de-g2-core.cti` contains `558` non-comment lines and one direct include.

`de-g2-core-patterns.dic` contains `26711` pattern-data entries.

The `.dic` file is explicitly classified as **PATTERN_DATA** and is not parsed as an opcode/directive table.

## Important comparator policy

The following are observations about the Liblouis implementation, not German Braille normative rules:

- g0 inheritance structure
- direct include ordering
- g2-core implementation directives
- pattern dictionary contents
- generic `braille-patterns.cti` support

No rule is promoted merely because Liblouis contains or implements it.

## Next

Proceed to **Phase 15.3M2 — Liblouis de-g2 Static BSKDL Family Crosswalk**.
