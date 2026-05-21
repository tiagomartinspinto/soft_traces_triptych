# Project Status

## Completed

- Created a React + Vite app for `Soft Traces: Triptych`.
- Added fullscreen triptych layout with three live-feed panels.
- Added runtime-editable camera configuration in `public/config/cameras.json`.
- Added editable artwork and privacy text in `src/data/exhibition.json`.
- Added fallback states for inactive or missing camera URLs.
- Added offline-aware fallback copy when the display browser loses network access.
- Added optional labels, slow text fragments, visual modes, and responsive behavior.
- Added keyboard shortcuts for install mode, labels, text fragments, and debug overlay.
- Added browser fullscreen request/exit behavior to the `F` shortcut when supported.
- Added a keyboard shortcut to hide the title and privacy overlay.
- Added cursor hiding during install mode inactivity.
- Added setup and exhibition guidance in `README.md`.
- Installed dependencies and confirmed the production build succeeds.
- Added `.gitignore` for generated build output and installed dependencies.
- Confirmed the local repository is `/Users/ptiagomp/Desktop/codex projects/art project` and `origin` points to `https://github.com/tiagomartinspinto/soft_traces_triptych.git`.
- Pushed `main` to GitHub and verified the required project files are present on `origin/main`.
- Scanned tracked files for assistant/tooling references outside this status file.
- Added a GitHub Pages deployment workflow that builds the Vite app and publishes `dist/`.
- Added `vite.config.js` with the `/soft_traces_triptych/` base path for the Pages project URL.
- Updated the Pages workflow to switch the repository to workflow-based Pages deployment and avoid the old branch deployment overwriting the built app.
- Added `useFallbackInsteadOfIframeWhenPlaceholder` to each camera entry.
- Added placeholder URL detection so `REPLACE_` VDO.Ninja URLs render the artwork fallback instead of an iframe.
- Added a debug-overlay warning that lists panels still using placeholder feed URLs.
- Moved camera configuration out of the bundled React source and into `public/config/cameras.json`.
- Added runtime camera config loading with an internal safe three-panel fallback if the JSON cannot be fetched or validated.
- Added a debug-overlay note showing whether the active camera config came from runtime config or internal fallback.
- Added `public/config/cameras.local.example.json` and ignored `public/config/cameras.local.json` for private local exhibition feed details.
- Confirmed feed URLs are not configurable through visitor URL parameters and no public admin UI was added.

## Files Changed

- `index.html`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `README.md`
- `PROJECT_STATUS.md`
- `.github/workflows/deploy-pages.yml`
- `public/config/cameras.json`
- `public/config/cameras.local.example.json`
- `vite.config.js`
- `src/main.jsx`
- `src/styles.css`
- `src/data/fallbackCameras.js`
- `src/data/exhibition.json`

## Remaining Tasks

- Replace all placeholder VDO.Ninja view URLs with real viewing links.
- Keep placeholder protection enabled until every VDO.Ninja viewing URL has been replaced.
- For GitHub Pages, commit and push any intended public camera config change so the Pages workflow redeploys it.
- For local/private exhibition operation, create `public/config/cameras.local.json`, fill in real feeds there, and copy those values into the local runtime `public/config/cameras.json` without committing private URLs.
- Test the three sender devices in the actual university or exhibition Wi-Fi environment.
- Confirm physical camera framing and signage in the installation space.
- Decide whether labels and text fragments should remain visible during the exhibition.
- Confirm the first GitHub Pages workflow run completes successfully after the workflow is pushed.

## Known Issues

- VDO.Ninja iframe error screens are controlled by the embedded service when an invalid non-placeholder stream ID is used. Placeholder URLs containing `REPLACE_` now use the artwork fallback instead of an iframe.
- If `public/config/cameras.json` is missing, unreachable, malformed, or does not contain exactly `object`, `space`, and `trace` in order, the app uses the internal fallback config with no iframe feeds.
- Browser fullscreen requires a user gesture. Press `F` on the display keyboard or use the browser/display fullscreen controls.
- GitHub Pages may briefly show the old source `index.html` while the first workflow deployment finishes and the CDN cache refreshes.
- The first workflow run briefly raced with the legacy branch-based Pages deployment; the workflow now switches Pages to workflow mode and deploys after that legacy run settles.

## Manual Tests Completed

- Run `npm install`.
- Run `npm run build`.
- Run `npm run build` after adding placeholder iframe protection.
- Run `npm run build` after moving camera config to runtime JSON.
- Confirm the local runtime config URL returns the three-panel JSON.
- Confirm the debug overlay reports `runtime config` during normal local operation.
- Confirm placeholder runtime URLs render fallback states with zero iframes.
- Confirm local git status, branch, remote URL, and directory listing.
- Confirm required tracked source files exist locally.
- Confirm the live Pages URL currently responds.

## Manual Tests To Do Next

- Open `https://tiagomartinspinto.github.io/soft_traces_triptych/` after the Pages workflow finishes and confirm the triptych renders.
- Run `npm run dev` or `npm run preview` and verify the layout on the exhibition display.
- Press `F`, `L`, `T`, `D`, and `O` to confirm keyboard controls.
- Press `D` and confirm the debug overlay lists any panels still using placeholder URLs.
- Press `D` and confirm the debug overlay reports `runtime config` during normal operation.
- Temporarily break `public/config/cameras.json` locally and confirm the debug overlay reports `internal fallback`.
- Temporarily replace one `REPLACE_` URL with a real VDO.Ninja view URL and confirm that panel renders the iframe while the others remain in fallback.
- Test each real VDO.Ninja viewing URL in `public/config/cameras.json`.
- Check that no panel films identifiable people without consent.
- Confirm that camera devices remain powered, unlocked, and notification-free.
