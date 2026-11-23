# Changelog

## v6.0 — 2026-11-23

### Added

- `manifest.json` inside every zip: version, commit, build date, OpenList base, output root, per-entry relative path, source size/mtime, title/year/season/episode, tmdbid, URL template, cover source.
- Import a previous manifest and diff: new entries generated, changed entries rewritten, unchanged skipped, missing entries listed but not deleted by default.
- Read the root `manifest.json` straight from the media-library folder, or auto-read it before a re-run when auto-upload is on.
- Editable preflight before generation: titles, years, seasons and episode numbers can be corrected row by row; any row can be skipped; CSV export includes the full row set.
- Default "only add, never overwrite": existing local `poster.jpg`, hand-edited NFO and artwork are skipped; overwrite requires an explicit switch plus a second confirmation.
- Write-back after direct upload: the manifest is written to the library root only when every strm upload succeeds, and it merges with the existing root manifest instead of replacing it.
- Browser capability badge on first screen: direct folder write / zip fallback / zip only.
- Session-only TMDB key mode; "clear all local data"; exported config header states version, commit and "no credentials".
- strm URL templates with `openlistBase` replacement; warning and optional stripping for `sign=` / `token=` / `pwd=`.
- Footer trust block: author, repository, feedback, checksums, MIT license, changelog, threat model, manifest spec, offline-freeze promise, TMDB notice.
- Repro-build pipeline: `src/` + `tools/build.mjs` + `build.ps1` / `build.sh`; commit injected into page footer and manifest.

### Changed

- NFO now writes `<tmdbid>` when available, so a later re-scan does not fall back to filename guessing.
- Batch zip also carries `manifest.json`.
- Single-file and batch zips now keep the `片名/Season xx/` hierarchy; earlier single-file zips flattened strm files into the zip root.
- A re-run in add-only mode first reads the root manifest when present, then shows the diff; overwrite mode does not auto-read, so an explicit overwrite is not skipped by stale state.
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

- `yingyin-box-v6.0.html` — 210,235 bytes — SHA-256 `1a84df21bf287213a3f46e6da271309a2896393dc329467b741cd9a147f48384`
- `app.html` (online copy) — 210,235 bytes — same SHA-256
- `yingyin-box-v6.0.zip` — 82,590 bytes — SHA-256 `9eecb9dc96addb6c14af8257b5c6c1a0422ce13fb60d7aba0d90b95ca8b0b182`

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
