# Yingyin Box v5.7

A local-first, single-file media-library ingester for OpenList → Jellyfin / Emby.

## Highlights

- One HTML file: no installer, no hosted account, no bundled binaries.
- Generates `.strm`, Jellyfin/Emby-compatible NFO, posters, season artwork and a local cover fallback.
- Optional TMDB metadata; works without a TMDB key.
- Renames subtitles or keeps the original file name.
- Packages the result as a zip or writes directly into a chosen media-library folder.
- English / Chinese UI switch in both the website and the app.
- No analytics, ads or third-party scripts in the app.

## Downloads

- `yingyin-box-v5.7.html` — 175,814 bytes — SHA-256 `53765a727e724d083e4d8f3c09b611d4421ad5aea54e81748e7474abdde87f6d`
- `yingyin-box-v5.7.zip` — 66,671 bytes — SHA-256 `f9e0eaa97578e6447d29a9ba451b264d130b0eb7b4c457287356ff0e8ca364da`

The full pack includes the web app, a usage guide and four NFO examples.

## Website

https://yingyin-box-site.pages.dev/

## Notes

- TMDB, Jellyfin, Emby and OpenList are trademarks of their respective owners. This is an independent project and is not affiliated with or endorsed by them.
- The OpenList password is used in page memory and is not written to the config file.
- TMDB credentials are stored in the browser's `localStorage`; config export strips them.
- The website's contact endpoint never receives media files, OpenList passwords or TMDB keys.

## License

MIT.
