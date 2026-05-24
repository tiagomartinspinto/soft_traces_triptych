# Project Status

## Completed

- Added a local source editor at `/editor`.
- Kept the public artwork route minimal: exactly three panels, the configured sentence, and a small centered `sources` button.
- Added editor-only dark/light mode.
- Added editing for the required panels: `object`, `space`, and `trace`.
- Added controls for single-source panels and source-pool panels.
- Added editing for `sourceType`, `src`, `active`, `fallbackText`, `visualMode`, `cropMode`, and video `muted`/`loop`.
- Added add/remove source controls for panel source pools.
- Added per-panel preview in the editor.
- Added validation for exactly three panels in the required order.
- Added warnings for placeholder `REPLACE_` sources.
- Added warnings for publicly available webcam/live camera feeds that may show private spaces or identifiable people.
- Added import JSON and export/download JSON controls.
- Simplified the public `sources` button so it opens `/editor` in a separate tab/window instead of replacing the artwork view.
- Added a small transient Terminal hint after pressing `sources`.
- Restricted the `sources` footer button to `localhost` and `127.0.0.1` only.
- Hid the `sources` footer button on GitHub Pages and other public hosts.
- Added YouTube embed detection for `youtube.com/embed/` and `youtube-nocookie.com/embed/` URLs.
- Updated iframe handling so YouTube embeds use `strict-origin-when-cross-origin` and `allowFullScreen`.
- Kept non-YouTube embeds and VDO.Ninja on the stricter `no-referrer` iframe policy.
- Added editor post-save guidance telling the user to refresh the artwork tab or open refreshed artwork.
- Added an `open refreshed artwork` editor button after successful local save, using `configUpdated=TIMESTAMP`.
- Added a `preview artwork` editor toolbar button.
- Added an editor warning for source pools explaining random active-source selection on artwork page load.
- Converted saved YouTube `/live/` URLs in `public/config/cameras.json` to `youtube-nocookie.com/embed/` URLs.
- Added VDO.Ninja render-time URL normalization for `cleanoutput`, `autostart`, `play`, and `muted`.
- Updated VDO iframe crop behavior so `cover` fills the panel and crops instead of showing letterboxed bands.
- Kept `contain` and `stretch` crop modes available for VDO iframe sources.
- Matched editor previews to the selected panel `cropMode`.
- Added a localhost-only Node/Express server for local exhibition setup.
- Added `npm run local`.
- Added local API endpoints:
  - `GET /api/config/cameras`
  - `POST /api/config/cameras`
- Added server-side validation before writing config.
- Restricted config writes to `public/config/cameras.json`.
- Bound the local server to `127.0.0.1`.
- Kept runtime artwork config at `public/config/cameras.json`.
- Kept the internal fallback config for failed runtime config loads.
- Kept the public artwork safe for GitHub Pages with no public backend, no visitor feed URL overrides, no analytics, no cookies, and no webcam/microphone requests.
- Updated README with public/static operation, local editor server use, import/export, save behavior, warnings, editor theme toggle, and the `sources` footer button.

## Files Changed

- `README.md`
- `PROJECT_STATUS.md`
- `package.json`
- `package-lock.json`
- `local-server.js`
- `src/main.jsx`
- `src/styles.css`
- `src/lib/cameraConfig.js`
- `public/config/cameras.json`

## Remaining Tasks

- Replace placeholder VDO.Ninja view URLs with real viewing links on the exhibition machine.
- Add intended local video loop files to `public/media/` on the exhibition machine.
- Replace public embed placeholders only with manually selected, permission-safe, publicly available webcam/live camera feeds.
- Use `npm run local` during trusted local setup when direct saving from the editor is useful.
- For GitHub Pages, commit and push intended public config changes so Pages redeploys.
- Test all real sources on the actual exhibition display and network.

## Known Issues

- VDO.Ninja iframe error screens are controlled by the embedded service when an invalid non-placeholder stream ID is used.
- Public embed availability depends on the selected provider and browser iframe permissions.
- YouTube videos and live streams may still refuse embedding if embedding is disabled by the owner or blocked by YouTube.
- YouTube watch-page URLs are not supported as embeds; use `/embed/` URLs.
- Artwork tabs do not update automatically after editor saves; refresh the artwork tab or use `open refreshed artwork`.
- VDO cover mode intentionally crops the iframe to avoid letterboxing.
- The editor can preview only sources the browser/provider allows inside the page.
- If the local API is unavailable, editor saving is disabled by design; import/export still works.
- The `/editor` route remains available directly, but saving still requires the local API from `npm run local`.
- If `public/config/cameras.json` is missing, unreachable, malformed, or does not contain exactly `object`, `space`, and `trace` in order, the app uses the internal fallback config with no media sources.
- Browser fullscreen requires a user gesture. Press `F` on the display keyboard or use browser/display fullscreen controls.
- Example local video paths do not include actual video files; absent local videos fall back after the browser reports a media load error.

## Manual Tests Completed

- Ran `npm install express`.
- Ran `npm run build`.
- Ran `npm run local`.
- Confirmed the local server starts at `http://127.0.0.1:5173/soft_traces_triptych/`.
- Confirmed `GET /api/config/cameras` returns the current camera config.
- Opened the public artwork route in the browser.
- Confirmed the artwork route renders exactly three panels.
- Confirmed the artwork route includes the configured sentence.
- Confirmed the artwork route includes one centered `sources` button.
- Clicked `sources` and confirmed it opens `/editor` separately while the artwork page remains in place.
- Confirmed the `sources` button shows the Terminal hint for `npm install` and `npm run local`.
- Confirmed `/editor` renders three editor panels.
- Confirmed local save is enabled when `npm run local` is running.
- Ran `npm run build` after making the `sources` button localhost-only.
- Ran `npm run build` after adding YouTube iframe handling.
- Checked YouTube embed URL detection with a `youtube-nocookie.com/embed/` sample.
- Ran `npm run build` after adding refreshed artwork workflow.
- Confirmed local editor save shows the refreshed-artwork guidance and button.
- Confirmed the YouTube URLs currently in `public/config/cameras.json` are detected as YouTube embed URLs.
- Ran `npm run build` after updating VDO autoplay and crop behavior.
- Confirmed VDO viewer URLs receive `cleanoutput`, `autostart`, `play`, and `muted`.
- Ran tracked-file provenance scan after cleanup.

## Manual Tests To Do Next

- In `npm run local`, edit one source in `/editor`, save, and confirm `public/config/cameras.json` changes as expected.
- Export JSON from the editor and confirm it can replace `public/config/cameras.json`.
- Import JSON into the editor and confirm validation messages are useful.
- Switch the editor between dark and light mode.
- Test one real VDO.Ninja feed.
- Confirm real VDO.Ninja feeds autoplay on the exhibition browser after the first page load.
- Confirm VDO `cover`, `contain`, and `stretch` crop modes on the exhibition display.
- Test one local video file under `public/media/`.
- Test one manually selected publicly available webcam/live camera embed.
- Test the intended YouTube embed URLs on the exhibition browser and network.
- Prefer local video files for the most stable exhibition playback.
- After saving in the local editor, use `open refreshed artwork` and confirm the artwork tab loads the latest config.
- Confirm no configured source shows private spaces, identifiable people, or anything without permission to present.
- Reopen the public artwork on the exhibition display and confirm the `sources` footer button is visually quiet enough for the install.
