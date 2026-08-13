# Persian-to-Braille v1 Legacy Archive

This directory preserves the historical implementation of Persian-to-Braille developed in 2016 (1395 SH).

The files under this directory are retained for historical analysis, compatibility research, and regression testing. They are not the architecture used by Persian-to-Braille v2.

## Historical Architecture

The original implementation used a two-stage translation model:

1. Persian characters were converted to an ASCII-based Braille representation.
2. A legacy Braille font rendered those ASCII characters visually as Braille cells.

This predates the Unicode-first architecture used by v2.

## Preserved Components

### VBA

`source/vba/FarsiBrailleMaker.bas`

Historical Microsoft Word macro.

`source/vba/EnglishBrailleMaker.bas`

Historical Microsoft Excel macro. Despite its filename, the implementation contains Persian-to-Braille conversion rules.

### Database

`database/Persian to Braille.sql`

Historical SQL representation of character mappings.

The SQL data is preserved as-is, including known inconsistencies with the executable VBA implementation.

### Documentation

`docs/legacy-v1-description-fa.md`

Markdown conversion of the original Persian project description.

`README.github-original.md`

Snapshot of the original GitHub README before the v2 reconstruction.

## Preservation Policy

Legacy source files are preserved without corrective modifications.

Known defects, inconsistencies, encoding differences, missing dependencies, and historical implementation details are documented separately in:

`../../docs/legacy/legacy-audit.md`

## Important

Do not use the legacy implementation as the normative Persian Braille specification.

The v2 specification, conformance tests, and translation engine will be developed independently while retaining a compatibility profile for historical behavior where appropriate.