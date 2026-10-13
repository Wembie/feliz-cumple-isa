# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.1] - 2026-10-12

### Added

- Link preview (Open Graph / Twitter card): editable texts in `src/vistaPrevia.ts` and a
  1200 × 630 image drawn in the page style with `npm run vista-previa`.

## [1.0.0] - 2026-10-12

### Added

- 2026 edition of the interactive birthday page (`#/2026`), in Spanish and mobile-first.
- Moments: entrance, make a wish (16 blowable candles), our little world (photo collage
  and secret stickers), multi-page letter, gift room and closing.
- Gift room with several opening choreographies and a featured box that holds two
  nested gifts; opened state is kept until the page reloads.
- Pop editorial / party collage design: tokens, spring physics, canvas confetti and
  Web Audio sounds (on by default).
- Text that auto-fits any length on any screen size.
- All visible text in a per-year constants file.
- Lock screen: texts and photos encrypted with AES-256-GCM (PBKDF2 key, one password
  per year); plaintext stays in the ignored `privado/` folder and `.env`.
- Encryption script (resize, metadata strip, gitignore checks); the dev server
  re-encrypts on save.
- Unit tests (Vitest), e2e tests (Playwright), layout stress test and a GitHub Actions
  workflow for checks and GitHub Pages deploy.

[Unreleased]: https://github.com/Wembie/feliz-cumple-isa/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/Wembie/feliz-cumple-isa/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Wembie/feliz-cumple-isa/releases/tag/v1.0.0
