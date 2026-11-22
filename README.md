# Yingyin Box

**A local-first, single-file media-library ingester for OpenList → Jellyfin / Emby.**

Yingyin Box turns a cloud-drive folder into a clean, player-ready media library: `.strm` play files, Jellyfin/Emby-compatible NFO metadata, posters, season artwork, and renamed subtitles. It runs as one HTML file in your browser — no installer, no hosted account, and no author-side copy of your videos.

[中文说明](README.zh-CN.md) · [Website](https://yingyin-box-site.pages.dev/) · [Releases](../../releases)

![Yingyin Box web app in English](docs/screenshots/app-en.png)

## What it does

- **Scan a source folder** through OpenList, or pick a local folder in a Chromium-based browser.
- **Generate `.strm` files** with the correct episode structure for Jellyfin and Emby.
- **Write NFO metadata** for shows, seasons, episodes and movies.
- **Fetch optional TMDB metadata** — overview, rating, cast, official posters and backdrops. A TMDB key is not required.
- **Create a local fallback cover** when no poster is available, so the library never shows a blank tile.
- **Rename subtitles** to match the video, or keep the original file name.
- **Package or upload** the result: download a zip, or write directly into your media-library folder.
- **Switch the UI** between English and Chinese from the top-right corner. Chinese remains the default.

![Advanced settings in English](docs/screenshots/app-advanced-en.png)

## Why local-first

| Data | Where it goes |
| --- | --- |
| Video files | Stay on your computer or NAS. The app reads folder names and file names only; it never uploads the video. |
| OpenList credentials | Used in page memory for the current session; not written to the config file. |
| TMDB API key / token | Stored in this browser's `localStorage`; config export strips it. |
| Media library output | Written to the folder you choose, or delivered as a zip. |
| Analytics / ads | None. The app page loads no third-party scripts and has no telemetry. |

The app itself has **no hosted backend**. The project website has one small server endpoint for its contact form; it never receives media files, OpenList passwords or TMDB keys.

## Quick start

1. **Download** the web app or the full pack from [yingyin-box-site.pages.dev](https://yingyin-box-site.pages.dev/#download), or from [Releases](../../releases).
2. **Open** `yingyin-box-v5.7.html` in Chrome or Edge. There is no install step.
3. **Choose a source**: enter your OpenList URL and credentials, or use the local folder picker.
4. **Set the media-library path**, for example `/media/tv` or `/media/movies`. This is the destination path inside the generated zip, not an upload address.
5. **Optional:** add a TMDB v3 API key or v4 access token for richer metadata and official artwork.
6. **Generate** and unzip the result into your Jellyfin/Emby library.

If your browser cannot write directly to a local folder, the app falls back to a zip download. The generated folder structure still works the same way.

## Downloads

| Package | Size | SHA-256 |
| --- | --- | --- |
| Web app (`yingyin-box-v5.7.html`) | 175,814 bytes (172 KB) | `53765a727e724d083e4d8f3c09b611d4421ad5aea54e81748e7474abdde87f6d` |
| Full pack (`yingyin-box-v5.7.zip`) | 66,671 bytes (65 KB) | `f9e0eaa97578e6447d29a9ba451b264d130b0eb7b4c457287356ff0e8ca364da` |

The full pack contains the web app, a usage guide, and four NFO examples.

## Bilingual UI

The website and the app both have an `EN / 中文` switch in the top-right corner.

- The website switches its full page: hero, navigation, download section, security notes, FAQ, contact dialog and hero screenshot.
- The app switches labels, buttons, select options, dialogs, hints and common runtime messages.
- The choice is stored in `localStorage` under `yingyin_ui_lang`; Chinese is the default.
- The app's existing **metadata language** selector is separate: it controls the language of generated NFO metadata, not the UI.

![Website in English](docs/screenshots/website-en.png)

## Requirements

- **Browser:** Chrome or Edge on desktop is recommended. Safari/Firefox can still generate a zip when direct folder writing is unavailable.
- **Source:** an OpenList instance, or a local folder.
- **Library:** Jellyfin or Emby, if you want to consume the generated `.strm` + NFO structure.
- **Metadata (optional):** a TMDB API key or access token.

## Security notes

This is a single-file tool that you can read before running. A few practical precautions:

- Download only from this repository, the official website, or the release attachments.
- Some browsers show a conservative warning for downloaded HTML files. That warning is not a virus verdict; inspect the source, scan the file, or try it in a separate browser profile.
- Do not enter API keys on a shared computer. Keys are stored in that browser profile's `localStorage`; use **Clear TMDB key** when finished.
- Use HTTPS for your OpenList endpoint when it is exposed outside your LAN.
- Treat the generated media-library path as a write permission: point it at a test folder first.

## FAQ

**Does it upload my videos?** No. It reads directory and file names and generates play files/metadata. The video bytes stay on your storage.

**Can I use it without a TMDB key?** Yes. You get basic NFO metadata and a local title cover. A key adds overviews, ratings, cast and official artwork.

**Does it save my NAS password?** The OpenList password is used in page memory for the current session and is not written to the config file.

**Is this affiliated with TMDB, Jellyfin, Emby or OpenList?** No. These names are used only to describe compatibility. This is an independent personal project.

**Why does my browser warn about the HTML file?** Single-file HTML downloads often trigger a generic warning. Review the source and scan the file; the project has no installer and no bundled binaries.

## Contributing

Issues and pull requests are welcome in English or Chinese.

- Keep the app a **single, reviewable HTML file** unless there is a strong reason to split it.
- Do not add analytics, ads, tracking pixels or hidden network calls.
- Never commit API keys, tokens, passwords, `.env` files or Cloudflare secrets.
- Test both Chinese and English UI, and check that existing generation behavior is unchanged.
- For security reports, use GitHub's private security advisory rather than a public issue.

## License

MIT — see [LICENSE](LICENSE).

---

**Keywords:** OpenList, Jellyfin, Emby, media library, `.strm`, NFO, metadata, posters, subtitles, self-hosted, local-first, single-file web app, bilingual UI.
