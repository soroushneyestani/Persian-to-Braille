# Legacy External Assets

Some assets used or collected during development of Persian-to-Braille v1 are not redistributed through this repository because they are third-party copyrighted material or their redistribution rights have not been established.

## BRAILLE.ttf

- Font name: Braille 3D
- Copyright: Philippe and François Blondel
- Historical year information: 1998 / 2012
- SHA-256: `CBA6C96D4023AECE909B26FB95FED89FDF390841C93A512C850EE58593633C70`
- Repository status: Not distributed

## BRAILLE1.ttf

- Font name: Braille Normal
- Copyright: Philippe and François Blondel
- Historical year information: 1998
- SHA-256: `92934DEA3EFD78161541944A8697FC7124ACB57D8685533F42DCD9C217864CF9`
- Repository status: Not distributed

## Swell Braille

The historical Excel macro explicitly requests a font named:

`Swell Braille`

No matching font file is currently present in the recovered project artifacts.

This is therefore recorded as an unresolved legacy dependency.

## v2 Policy

Persian-to-Braille v2 must not depend on any legacy Braille display font for its underlying representation.

The translation engine will emit Unicode Braille cells or other explicitly defined output formats. Fonts may only be treated as optional presentation resources.