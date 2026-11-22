# Security Policy

## Supported version

Security fixes are applied to the current release line (currently **v5.7**).

## Reporting a vulnerability

Please **do not** open a public issue for a vulnerability, leaked credential or a report that includes personal data.

Use GitHub's **private security advisory** for this repository. Include:

- the affected version and browser;
- the exact steps to reproduce;
- the impact (for example, unexpected network request, credential exposure, or writing outside the selected folder);
- a minimal proof of concept, if safe.

If the advisory form is unavailable, use the project website's contact form and ask for a private channel. Do not include a live API key, password or private media path in the first message.

## Scope

In scope:

- the single-file web app in `downloads/`;
- the static website and its contact endpoint in `functions/`;
- claims in the documentation that could cause unsafe use.

Out of scope:

- vulnerabilities in OpenList, Jellyfin, Emby, TMDB, the browser or the operating system;
- misconfiguration of a user's NAS, reverse proxy or media library permissions;
- content hosted on third-party services;
- social engineering that does not involve this project's code.

## Security model

- The app reads the source folder and writes only to the destination the user selects (or returns a zip).
- Video bytes are not uploaded to the author.
- The OpenList password is used in page memory for the current session and is not written to the config file.
- TMDB credentials are stored in the browser's `localStorage`; the config export removes them.
- The app page loads no third-party scripts and has no analytics.
- The website's contact endpoint accepts only a message and uses server-side secrets; it does not receive media files, OpenList passwords or TMDB keys.

## Good-faith research

Please avoid testing against accounts, servers or media libraries you do not own. Do not access other users' data, run destructive tests, or publish details before a fix is available.
