# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.2] - 2026-10-12

### Added

- Photo notes on mobile: when a note is longer than the card, a bouncing "scroll to read
  more" hint with a fade appears; tapping it scrolls down and it hides at the end.
  Text editable in the constants file (`MUNDO.notaDesliza`).

### Changed

- CI split: all checks run on pull requests (`ci.yml`); a push to `main` only builds,
  deploys and creates the release (`pages.yml`). The release runs after a successful deploy.

### Fixed

- Sound was too quiet on phones: louder master gain with a limiter to avoid distortion,
  and the lid thump now uses frequencies small speakers can play.
- Sound stopped working on phones after using the microphone, locking the screen or
  switching apps: the audio now resumes on the next tap or when the page is visible again,
  and is rebuilt after the microphone is released.
- iPhone: sound plays even with the silent switch on (audio session set to playback).

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

[Unreleased]: https://github.com/Wembie/feliz-cumple-isa/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/Wembie/feliz-cumple-isa/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Wembie/feliz-cumple-isa/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Wembie/feliz-cumple-isa/releases/tag/v1.0.0
