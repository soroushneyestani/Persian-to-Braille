# Persian-to-Braille Legacy Audit

## 1. Purpose

This document records the recovered architecture, artifacts, behavior, inconsistencies, dependencies, and preservation decisions for the original Persian-to-Braille implementation developed in 2016 (1395 SH).

The legacy implementation is treated as historical evidence rather than as the normative specification for Persian-to-Braille v2.

---

## 2. Recovered Artifacts

### Source Code

- `legacy/v1/source/vba/FarsiBrailleMaker.bas`
- `legacy/v1/source/vba/EnglishBrailleMaker.bas`

### Historical Data

- `legacy/v1/database/Persian to Braille.sql`

### Documentation

- `legacy/v1/docs/legacy-v1-description-fa.md`
- `legacy/v1/README.github-original.md`

### External / Non-Redistributed Assets

- `BRAILLE.ttf`
- `BRAILLE1.ttf`
- historical research document containing extensive Braille Music material

The external assets are not included in the public repository pending copyright/provenance review.

---

## 3. Original Translation Architecture

The historical implementation did not emit Unicode Braille directly.

Its effective pipeline was:

```text
Persian text
    ↓
character substitution
    ↓
ASCII-based Braille representation
    ↓
legacy Braille display font
    ↓
visual Braille output
```

This architecture was reasonable for the original Office/VBA environment but will not be retained as the primary representation in v2.

## 4. Microsoft Word Implementation

FarsiBrailleMaker.bas implements the conversion through repeated Microsoft Word Selection.Find / ReplaceAll operations.

The recovered macro contains:

36 Persian/Arabic character mappings
10 numeric mappings
46 substitutions in total

Numbers are converted through a Braille-number-prefix representation:

1 -> #a
2 -> #b
3 -> #c
...
0 -> #j

The Word implementation does not itself establish a modern Unicode Braille representation.

## 5. Microsoft Excel Implementation

EnglishBrailleMaker.bas operates through Excel Cells.Replace.

Despite its historical filename, it implements Persian-to-Braille conversion rather than an English Braille translation engine.

It contains the same overall structure:

36 character mappings
10 numeric mappings
46 substitutions in total

After conversion, it attempts to apply the font:

Swell Braille

to a selected worksheet range.

No recovered font file currently matches that font name.

## 6. Word / Excel Unicode Difference

The two VBA implementations differ in their treatment of Yeh.

The Word macro contains the Arabic form:

ي — U+064A ARABIC LETTER YEH

The Excel macro contains the Persian form:

ی — U+06CC ARABIC LETTER FARSI YEH

Both map to the same legacy Braille-ASCII value:

i

This is a significant historical Unicode-normalization issue and must not be reproduced accidentally in the v2 core.

## 7. SQL versus Executable VBA

The historical SQL table is not an exact serialization of the VBA implementation.

Confirmed differences include:

Ain

VBA:

ع -> (

SQL:

ع -> (d

The SQL value is inconsistent with both recovered VBA implementations.

Alef with Madda

VBA:

آ -> >

SQL contains an additional trailing non-standard whitespace character after the mapping value.

Ghain

VBA:

غ -> <

The SQL representation also contains trailing non-standard whitespace.

Additional SQL Rules

The SQL file contains several mappings not present in either executable VBA macro, including punctuation and symbols such as:

؟
:
+
-
_
=
/
÷
!
.
parentheses

It also contains:

ؤ -> \

which is not implemented in the recovered VBA macros.

Therefore the SQL file appears to represent a broader historical mapping/reference table rather than the exact runtime rule set of either macro.

## 8. Legacy Font Dependencies

Two historical Braille font files were recovered:

Braille 3D

SHA-256:

CBA6C96D4023AECE909B26FB95FED89FDF390841C93A512C850EE58593633C70

Braille Normal

SHA-256:

92934DEA3EFD78161541944A8697FC7124ACB57D8685533F42DCD9C217864CF9

Both identify Philippe and François Blondel as copyright holders.

They are therefore documented but not redistributed.

The Excel macro refers to a third font name, Swell Braille, which has not yet been recovered.

## 9. Historical Documentation

The recovered Persian project description identifies the software as version 1.0.0 and states that the initial implementation was written in Mehr 1395.

It describes the original product as Office-based VBA development for converting Persian and English text, with Braille Music and potential mobile development considered as later directions.

A larger recovered research document also contains extensive Braille Music material covering areas such as:

notes and rests
clefs
accidentals
rhythmic groups
chords
slurs and ties
tremolos
fingering
repeats
ornaments
keyboard music
vocal music
string instruments
winds and percussion
accordion notation
MusicXML / MIDI-related workflow concepts

That material will be audited separately before any portion is incorporated into a future Braille Music module.

## 10. Legacy Preservation Rules

The following rules apply to legacy/v1:

Original VBA files must remain byte-preserved.
Historical SQL defects must not be silently corrected.
Corrections belong in v2 specifications or compatibility documentation.
Third-party fonts must not be redistributed without verified permission.
The old ASCII/font representation must not become the internal v2 data model.
Historical behavior may later be exposed through an explicit legacy-v1 compatibility profile.
## 11. v2 Architectural Consequences

The legacy audit establishes several requirements for v2:

Unicode-first processing
explicit Persian/Arabic normalization
Persian Yeh / Arabic Yeh handling
no mandatory font dependency
no runtime database requirement for translation tables
machine-readable translation specification
deterministic conformance tests
versioned translation profiles
Microsoft Office integration through adapters rather than embedded translation rules
platform-independent core and SDK
## 12. Remaining Legacy Work

Before Phase 0 can be closed, the following items remain:

extract all VBA mappings into machine-readable test data
compare Word VBA, Excel VBA, SQL, and historical documentation systematically
record SHA-256 hashes for every committed legacy artifact
create a machine-readable legacy manifest
verify whether any additional original source files exist
investigate the historical Swell Braille dependency
complete provenance review of the Braille Music research document
create the final v1.0.0-legacy Git tag

No v2 translation rule should be derived solely from legacy behavior without the standards audit performed in Phase 1.