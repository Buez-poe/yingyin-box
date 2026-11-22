# Contributing to Yingyin Box

Thanks for taking the time to help. This is a small, local-first project; the goal is to keep it understandable, reviewable and useful for people running their own media library.

## Before you start

- Open an issue first for a larger change, especially anything that touches data flow, networking, file writing or generated library structure.
- Keep the app a **single, reviewable HTML file** unless splitting it has a clear maintenance benefit.
- Do not add analytics, ads, tracking pixels, hidden network calls or remote script tags.
- Never commit API keys, OpenList passwords, `.env` files, Cloudflare secrets or personal media paths.

## What to test

- The app still opens from `file://` in Chrome or Edge.
- Chinese and English UI both switch correctly (the `EN / 中文` button in the top-right).
- Existing generation behavior is unchanged: `.strm`, NFO, posters, local cover fallback, subtitle naming, zip output and optional direct upload.
- A run without a TMDB key still produces a usable library.
- No third-party scripts or analytics are introduced.

## Pull requests

1. Keep the change focused; one behavior per PR is easier to review.
2. Describe the user-visible effect and any security/data-flow impact.
3. Include screenshots for UI changes, in both languages when relevant.
4. Update `README.md` and `README.zh-CN.md` if the user-facing behavior changes.
5. Do not bump version numbers or rewrite release assets unless the maintainer asks.

## Reporting security issues

Please do not open a public issue for a vulnerability or a leaked credential. Use GitHub's **private security advisory** for this repository, or contact the maintainer through the website's contact form. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contribution is licensed under the project's MIT license.
