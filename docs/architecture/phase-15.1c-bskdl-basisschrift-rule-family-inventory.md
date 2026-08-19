# Phase 15.1C — BSKDL Basisschrift Rule-Family Inventory

Status: **IN PROGRESS**

## Normative authority

This inventory is derived from Chapter 2 of the frozen BSKDL rulebook.

- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter: `2 Die Basisschrift`
- Printed pages: `27–87`

## Architectural finding

Basisschrift is not modeled as an alphabet-only character table.

Chapter 2 defines stateful, contextual, boundary, formatting, and embedded-system behavior in addition to atomic signs.

All Basisschrift signs and rules form the substrate inherited by Vollschrift and Kurzschrift.

## Rule families

### 2.1 Das Alphabet

- ID: `DE-BASIS-01`
- Implementation concern: `ATOMIC_CHARACTER_MAPPING`
- Printed page start: `27`
- Normative extraction: `PENDING`
- Executable implementation: `false`

### 2.2 Satz- und Sonderzeichen

- ID: `DE-BASIS-02`
- Implementation concern: `PUNCTUATION_AND_SPECIAL_SIGNS`
- Printed page start: `27`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.2.1` Einformige Zeichen (p. 27)
- `2.2.2` Mehrformige Zeichen (p. 28)
- `2.2.3` Brailleschrifttechnische Hilfs- und Zusatzzeichen (p. 31)

### 2.3 Zahlen

- ID: `DE-BASIS-03`
- Implementation concern: `STATEFUL_NUMERIC_NOTATION`
- Printed page start: `33`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.3.1` Arabische Zahlen (p. 33)
- `2.3.1.1` Grundzahlen (p. 33)
- `2.3.1.2` Ordnungszahlen (p. 35)
- `2.3.1.3` Zeitangaben (p. 36)
- `2.3.1.4` Dezimalklassifikatoren, Kapitel- und Versnummern (p. 37)
- `2.3.1.5` Zahlenbrüche (p. 38)
- `2.3.1.6` Prozent, Promille, Grad, Minute, Sekunde (p. 38)
- `2.3.1.7` Paragrafzeichen (p. 39)
- `2.3.1.8` Ankündigungspflichtige Satzzeichen nach Zahlen und zwischen Ziffern (p. 40)
- `2.3.2` Römische Zahlen (p. 41)

### 2.4 Verbindungen mit Zahlen

- ID: `DE-BASIS-04`
- Implementation concern: `NUMBER_TEXT_BOUNDARIES`
- Printed page start: `42`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.4.1` Zahlen am Anfang von Wörtern (p. 42)
- `2.4.2` Zahlen und Einheiten (p. 43)

### 2.5 Striche

- ID: `DE-BASIS-05`
- Implementation concern: `DASH_SLASH_BOUNDARY_RULES`
- Printed page start: `44`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.5.1` Waagerechter Strich (p. 44)
- `2.5.1.1` Trennungsstrich (p. 44)
- `2.5.1.2` Bindestrich (p. 45)
- `2.5.1.3` Gedankenstrich, Auslassungsstrich, Ergänzungsstrich, Strecken- und Vergleichsstrich (p. 45)
- `2.5.1.4` Aufzählungszeichen (p. 47)
- `2.5.1.5` Strich zwischen Zahlen (p. 48)
- `2.5.1.6` Strich als Minuszeichen (p. 48)
- `2.5.2` Schrägstrich (p. 48)
- `2.5.3` Senkrechter Strich (p. 50)

### 2.6 Groß- und Kleinschreibung

- ID: `DE-BASIS-06`
- Implementation concern: `CASE_STATE_MACHINE`
- Printed page start: `51`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.6.1` Großer Erstbuchstabe (p. 52)
- `2.6.2` Einzelgroßbuchstaben und Großbuchstabenfolgen (p. 53)
- `2.6.3` Kleinbuchstaben (p. 55)
- `2.6.4` Gemischte Groß- und Kleinbuchstaben (p. 56)
- `2.6.5` Griechische Buchstaben (p. 58)
- `2.6.6` Nicht ableitbare Groß-/Kleinschreibung (p. 58)
- `2.6.7` Binnengroßschreibung (p. 59)
- `2.6.8` Abkürzungen mit Punkt (p. 62)

### 2.7 Hervorhebungen

- ID: `DE-BASIS-07`
- Implementation concern: `EMPHASIS_STATE_MACHINE`
- Printed page start: `65`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.7.1` Erste Hervorhebungsart (p. 65)
- `2.7.2` Zweite Hervorhebungsart (p. 66)
- `2.7.3` Versalien (p. 67)

### 2.8 Akzentbuchstaben und Buchstaben in besonderer Form

- ID: `DE-BASIS-08`
- Implementation concern: `DIACRITIC_AND_SPECIAL_LETTER_FORMS`
- Printed page start: `68`
- Normative extraction: `PENDING`
- Executable implementation: `false`

Subsections:

- `2.8.1` Akzentbuchstaben (p. 68)
- `2.8.2` Buchstaben in besonderer Form (p. 70)

### 2.9 Fremdsprachliche Einschübe

- ID: `DE-BASIS-09`
- Implementation concern: `EMBEDDED_LANGUAGE_BOUNDARY`
- Printed page start: `71`
- Normative extraction: `PENDING`
- Executable implementation: `false`

### 2.10 Mathematische Zeichen und Einschübe

- ID: `DE-BASIS-10`
- Implementation concern: `EMBEDDED_MATH_BOUNDARY`
- Printed page start: `73`
- Normative extraction: `PENDING`
- Executable implementation: `false`

### 2.11 Einschübe in Computerbraille

- ID: `DE-BASIS-11`
- Implementation concern: `EMBEDDED_COMPUTER_BRAILLE_BOUNDARY`
- Printed page start: `81`
- Normative extraction: `PENDING`
- Executable implementation: `false`

### 2.12 Trennzeichen für Tabellenzellen

- ID: `DE-BASIS-12`
- Implementation concern: `STRUCTURAL_TABLE_SEPARATOR`
- Printed page start: `84`
- Normative extraction: `PENDING`
- Executable implementation: `false`

### 2.13 Satzzeichen in Wörtern

- ID: `DE-BASIS-13`
- Implementation concern: `IN_WORD_PUNCTUATION_BOUNDARIES`
- Printed page start: `85`
- Normative extraction: `PENDING`
- Executable implementation: `false`

## Scope boundary

Sections 2.9, 2.10, and 2.11 remain part of the Basisschrift audit even where the embedded language, mathematical notation, or Computerbraille system is implemented separately.

The boundary and announcement behavior defined by BSKDL remains German text-profile behavior.

## Promotion policy

This artifact is an inventory only. No rule, sign, mapping, or state transition is promoted into Braille Hub Core by Phase 15.1C.

## Next

Phase 15.1D performs normative Basisschrift rule extraction, beginning with alphabet, signs, numbers, and control-state behavior.
