# Persian Braille CLI

Official command-line consumer of the public SDK.

Responsibilities:
- provide terminal translation and inspection workflows;
- consume public SDK APIs rather than internal core implementation details.

Dependency rule:
- may depend on `packages/sdk`;
- must not become a source of Braille rules.
