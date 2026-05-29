# Project Status

## Completed

- Sanitized committed runtime camera configuration so it contains no real live-feed URLs, VDO.Ninja view IDs, password parameters, or private source values.
- Kept real exhibition source values out of the repository by relying on ignored `public/config/cameras.local.json` for local/private setup.
- Updated `public/config/cameras.local.example.json` with inactive placeholder examples for VDO.Ninja, local video, public embed, and source-pool usage.
- Sealed the public artwork route so non-local visitors see only the triptych and the sentence.
- Restricted the full editor interface to `localhost` and `127.0.0.1`.
- Added a minimal non-local `/editor` notice: "Local source editor is available only during local setup."
- Added a GitHub Pages-safe `404.html` fallback so direct `/editor` refresh/open resolves back into the app instead of a Pages 404.
- Added `npm run validate:config` for committed public camera config safety checks.
- Added `npm run check` to run config validation and the production build.
- Improved public fallback visuals with subtle signal drift, low-contrast scan texture, and quiet absence states instead of visible error messaging.
- Kept the three-panel triptych structure unchanged: `object`, `space`, `trace`.
- Kept VDO.Ninja, local video, and embed support runtime-configured through `public/config/cameras.json`.
- Kept no visitor webcam/microphone requests, no visitor URL parameter source overrides, no analytics, no cookies, and no tracking.
- Updated README with exhibition operation, local-only editor behavior, config safety, `npm run check`, and source setup guidance.

## Files Changed

- `README.md`
- `PROJECT_STATUS.md`
- `package.json`
- `public/404.html`
- `public/config/cameras.json`
- `public/config/cameras.local.example.json`
- `scripts/validate-config.js`
- `src/main.jsx`
- `src/styles.css`

## Remaining Tasks

- Put real exhibition feeds only in `public/config/cameras.local.json` on the exhibition machine.
- Copy or import approved local/private source values during setup, then avoid committing them.
- Add intended local video loop files to `public/media/` on the exhibition machine.
- Test all real sources on the actual exhibition display, browser, and network.

## Known Issues

- Public embeds depend on the provider allowing iframe playback.
- YouTube videos and live streams may still refuse embedding if embedding is disabled by the owner or blocked by YouTube.
- VDO.Ninja iframe error screens are controlled by the embedded service when an invalid non-placeholder stream ID is used.
- Browser fullscreen requires a user gesture. Press `F` on the display keyboard or use browser/display fullscreen controls.
- The editor can preview only sources the browser/provider allows inside the page.
- Source pools randomly select one active source on page load; refresh to select again.

## Manual Tests Completed

- Ran `npm run check`.
- Ran `npm run build`.
- Ran the tracked-file provenance scan after cleanup.

## Manual Tests To Do Next

- Open the public GitHub Pages route and confirm only the triptych plus the sentence are visible.
- Open the public `/editor` route directly and confirm it shows only the local-setup notice.
- Run `npm run local`, open `/editor` on localhost, and confirm the full editor appears.
- Save a local test config and confirm the artwork refresh workflow loads the latest config.
- Test one real VDO.Ninja feed, one local video loop, and one manually selected publicly available webcam/live camera embed.
- Confirm no configured source shows private spaces, identifiable people, or anything without permission to present.
