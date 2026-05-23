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
- The editor can preview only sources the browser/provider allows inside the page.
- If the local API is unavailable, editor saving is disabled by design; import/export still works.
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

## Manual Tests To Do Next

- In `npm run local`, edit one source in `/editor`, save, and confirm `public/config/cameras.json` changes as expected.
- Export JSON from the editor and confirm it can replace `public/config/cameras.json`.
- Import JSON into the editor and confirm validation messages are useful.
- Switch the editor between dark and light mode.
- Test one real VDO.Ninja feed.
- Test one local video file under `public/media/`.
- Test one manually selected publicly available webcam/live camera embed.
- Confirm no configured source shows private spaces, identifiable people, or anything without permission to present.
- Reopen the public artwork on the exhibition display and confirm the `sources` footer button is visually quiet enough for the install.
