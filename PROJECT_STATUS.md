# Project Status

## Completed

- Created a React + Vite app for `Soft Traces: Triptych`.
- Added fullscreen triptych layout with three live-feed panels.
- Added editable camera configuration in `src/data/cameras.json`.
- Added editable artwork and privacy text in `src/data/exhibition.json`.
- Added fallback states for inactive or missing camera URLs.
- Added optional labels, slow text fragments, visual modes, and responsive behavior.
- Added keyboard shortcuts for install mode, labels, text fragments, and debug overlay.
- Added a keyboard shortcut to hide the title and privacy overlay.
- Added cursor hiding during install mode inactivity.
- Added setup and exhibition guidance in `README.md`.
- Installed dependencies and confirmed the production build succeeds.
- Added `.gitignore` for generated build output and installed dependencies.

## Files Changed

- `index.html`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `README.md`
- `PROJECT_STATUS.md`
- `src/main.jsx`
- `src/styles.css`
- `src/data/cameras.json`
- `src/data/exhibition.json`

## Remaining Tasks

- Replace all placeholder VDO.Ninja view URLs with real viewing links.
- Test the three sender devices in the actual university or exhibition Wi-Fi environment.
- Confirm physical camera framing and signage in the installation space.
- Decide whether labels and text fragments should remain visible during the exhibition.

## Known Issues

- VDO.Ninja iframe error screens are controlled by the embedded service when a placeholder or invalid stream ID is used. Set `active` to `false` until a real feed is ready to use the artwork fallback state.
- Browser fullscreen permission cannot be triggered automatically; use the browser or display system fullscreen controls for the big screen.

## Manual Tests To Do Next

- Run `npm install`.
- Run `npm run build`.
- Run `npm run dev` or `npm run preview` and verify the layout on the exhibition display.
- Press `F`, `L`, `T`, `D`, and `O` to confirm keyboard controls.
- Test each real VDO.Ninja viewing URL in `src/data/cameras.json`.
- Check that no panel films identifiable people without consent.
- Confirm that camera devices remain powered, unlocked, and notification-free.
