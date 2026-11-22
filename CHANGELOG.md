# Changelog

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
