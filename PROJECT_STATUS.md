# Project Status

## Completed

- Created a React + Vite app for `Soft Traces: Triptych`.
- Refocused the public artwork view to exactly three fullscreen panels plus one configurable sentence.
- Removed title, subtitle, panel labels, location labels, privacy overlay, decorative fragments, and public UI toggles from the normal exhibition view.
- Kept the `F` fullscreen shortcut, cursor hiding, and `D` debug overlay shortcut.
- Disabled the old label, text-fragment, and title-overlay shortcuts.
- Added runtime source rendering for VDO.Ninja iframe feeds, local HTML video loops, and iframe embeds for publicly available webcam/live camera feeds.
- Kept runtime config loading from `public/config/cameras.json` with an internal three-panel fallback config.
- Added `sourceType` and `src` based source configuration.
- Added optional per-panel `sources` arrays with one random active source selected locally on page load.
- Added debug overlay reporting for runtime/internal config, fullscreen state, network state, and selected source per panel.
- Added fallback handling for inactive sources, empty sources, placeholder `REPLACE_` sources, unknown source types, and local video load failures.
- Added `public/media/.gitkeep` and `public/media/README.md` for local video loops.
- Updated README guidance for VDO.Ninja feeds, local video loops, publicly available webcam/live camera feeds, privacy-safe manual selection, the one-sentence exhibition view, debug mode, and no visitor webcam/microphone access.
- Added `.gitignore` for generated build output, installed dependencies, and private local camera config.
- Added a GitHub Pages deployment workflow and Vite base path for `/soft_traces_triptych/`.
- Confirmed feed URLs are not configurable through visitor URL parameters and no public admin UI was added.
- Switched the artwork typography to Roboto through Google Fonts with a single clean fallback stack.

## Files Changed

- `README.md`
- `PROJECT_STATUS.md`
- `index.html`
- `.gitignore`
- `public/config/cameras.json`
- `public/config/cameras.local.example.json`
- `public/media/.gitkeep`
- `public/media/README.md`
- `src/main.jsx`
- `src/styles.css`
- `src/data/exhibition.json`
- `src/data/fallbackCameras.js`

## Remaining Tasks

- Replace placeholder VDO.Ninja view URLs with real viewing links for the exhibition machine.
- Add any intended local video loop files to `public/media/` on the exhibition machine.
- Replace public embed placeholders only with manually selected, permission-safe, publicly available webcam/live camera feeds.
- For GitHub Pages, commit and push any intended public config change so the Pages workflow redeploys it.
- For private/local operation, keep real feed details in the ignored `public/config/cameras.local.json` and copy them into the local runtime config only on the exhibition machine.
- Test all real sources on the actual exhibition display and network.

## Known Issues

- VDO.Ninja iframe error screens are controlled by the embedded service when an invalid non-placeholder stream ID is used.
- Public embed availability depends on the selected provider and browser iframe permissions.
- If `public/config/cameras.json` is missing, unreachable, malformed, or does not contain exactly `object`, `space`, and `trace` in order, the app uses the internal fallback config with no media sources.
- Browser fullscreen requires a user gesture. Press `F` on the display keyboard or use browser/display fullscreen controls.
- The example local video paths do not include actual video files; absent local videos fall back after the browser reports a media load error.

## Manual Tests Completed

- Run `npm run build`.
- Run `npm run build` after switching the artwork typography to Roboto.
- Run repository hygiene scan for disallowed provenance terms.
- Open the production preview at `http://127.0.0.1:4173/soft_traces_triptych/`.
- Confirm the browser renders exactly three panels and the configured sentence.
- Press `D` and confirm the debug overlay lists the selected source for each panel.

## Manual Tests To Do Next

- Run `npm run dev` or `npm run preview` and verify the layout on the exhibition display.
- Press `F` and confirm fullscreen behavior.
- Press `D` and confirm the debug overlay lists the selected source for each panel.
- Confirm placeholder VDO.Ninja and public embed sources render fallback states.
- Temporarily add one local video file under `public/media/` and confirm the video panel renders it.
- Test each real configured VDO.Ninja, local video, and public embed source.
- Confirm no configured source shows private spaces, identifiable people, or anything without permission to present.
