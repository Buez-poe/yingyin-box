# Changelog

## v6.0 — 2026-11-23

### Added

- `manifest.json` inside every zip: version, commit, build date, OpenList base, output root, per-entry relative path, source size/mtime, title/year/season/episode, tmdbid, URL template, cover source.
- Import a previous manifest and diff: new entries generated, changed entries rewritten, unchanged skipped, missing entries listed but not deleted by default.
- Default "only add, never overwrite": existing local `poster.jpg`, hand-edited NFO and artwork are skipped; overwrite requires an explicit switch plus confirmation.
- Preflight report before generation: missing year, auto-numbering, duplicate episodes, suspicious characters, entries that would be skipped or rewritten.
- Browser capability badge on first screen: direct folder write / zip fallback / zip only.
- Session-only TMDB key mode; "clear all local data"; exported config header states version, commit and "no credentials".
- strm URL templates with `openlistBase` replacement; warning and optional stripping for `sign=` / `token=` / `pwd=`.
- Footer trust block: author, repository, feedback, checksums, MIT license, changelog, threat model, manifest spec, offline-freeze promise, TMDB notice.
- Repro-build pipeline: `src/` + `tools/build.mjs` + `build.ps1` / `build.sh`; commit injected into page footer and manifest.

### Changed

- NFO now writes `<tmdbid>` when available, so a later re-scan does not fall back to filename guessing.
- Batch zip also carries `manifest.json`.
- Cover priority: local same-name image > TMDB > generated title cover.
- Website primary CTA now opens the online app at `/app.html`; the full pack zip is a secondary offline/download option.

### Security

- Website and app ship a CSP with `default-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`.
- The absolute sentence "no backend server" is replaced by "no business backend that receives videos, keys or OpenList credentials".
- Feedback form blocks pasted bearer tokens, JWT-like tokens, `key=`, `token=`, `password=`, and signed playback URLs.
- Threat model documents source, storage, lifetime, access and deletion path for each credential.
- Whole-site Ed25519 signature: `SITE-SHA256SUMS` covers every deployed page, doc, download and `SHA256SUMS`; `SITE-SHA256SUMS.sig` proves the manifest. See `docs/SITE-SIGNATURE.md`.
- Trust anchor moved out of the page: `downloads/yingyin-box-v6.0-offline-archive.zip` packages the HTML, zip, manifest, signature, public key and verification docs in site layout for local archiving; after the first check, only the offline copy is used. Gitee `SHA256SUMS`, commit history and `downloads/` are documented as the second independent channel.

### Assets

- `yingyin-box-v6.0.html` — 196,090 bytes — SHA-256 `c51c7514c4a0b07f6063e23dc69badcc2952508627655288ee73e7d4bb058611`
- `app.html` (online copy) — 196,090 bytes — same SHA-256
- `yingyin-box-v6.0.zip` — 77,528 bytes — SHA-256 `25a26e4744288f1c1c9fc85b04f8646567e9682a54adca4c6844714b65d8878d`

## v5.7 — 2026-11-22

### Added

- English / Chinese UI switch in both the website and the app (`EN / 中文`).
- English hero screenshot on the website.
- English README and release notes.

### Changed

- Website copy, contact dialog, metadata and download section now follow the selected UI language.
- App labels, buttons, select options, dialogs, hints and common runtime messages now follow the selected UI language.
- Contact flow can send through the website endpoint, open the local mail client, or copy the message.

### Security

- The website does not display the contact address in plain text.
- The contact endpoint validates origin and message length and keeps provider credentials in Cloudflare secrets.
- OpenList passwords remain in page memory; TMDB credentials remain in browser `localStorage`; config export strips TMDB credentials.

### Assets

- `yingyin-box-v5.7.html` — 175,814 bytes — SHA-256 `53765a727e724d083e4d8f3c09b611d4421ad5aea54e81748e7474abdde87f6d`
- `yingyin-box-v5.7.zip` — 66,671 bytes — SHA-256 `f9e0eaa97578e6447d29a9ba451b264d130b0eb7b4c457287356ff0e8ca364da`
