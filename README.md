# Soft Traces: Triptych

Fullscreen React/Vite installation for three embedded VDO.Ninja viewing feeds. The work is designed for a large horizontal exhibition screen, with a responsive stacked layout for smaller screens.

Live Pages URL: https://tiagomartinspinto.github.io/soft_traces_triptych/

## Run Locally

```bash
npm install
npm run dev
```

For an exhibition build:

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` build and publish the `dist/` folder through GitHub Pages. The Vite base path is configured in `vite.config.js` for the project URL above.

## Edit Camera Feeds

Camera configuration is loaded at runtime from `public/config/cameras.json`. Keep exactly three entries for the triptych:

- `object`: Object / Material
- `space`: Space / Room
- `trace`: Trace / Memory

Replace each `vdoNinjaViewUrl` with the VDO.Ninja viewing URL for that camera. The default values are placeholders:

```json
"vdoNinjaViewUrl": "https://vdo.ninja/?view=REPLACE_OBJECT_STREAM_ID&cleanoutput"
```

If `active` is `false`, `vdoNinjaViewUrl` is empty, or the URL contains `REPLACE_`, the app shows that panel's artwork fallback instead of rendering an iframe.
When the display browser reports that it is offline, the app uses each panel's `offlineText`.

Feed URLs are not visitor-editable through URL parameters, and there is no public admin interface. To edit feeds locally, update `public/config/cameras.json`, save, and refresh the browser. The app fetches that JSON file at runtime and falls back to an internal safe three-panel configuration if the file is missing or invalid.

On GitHub Pages, changing `public/config/cameras.json` still requires committing, pushing, and waiting for the Pages workflow to redeploy. For exhibition use from a local machine, keep real feed details private by copying `public/config/cameras.local.example.json` to the ignored `public/config/cameras.local.json`, filling in the real URLs there, and copying those values into `public/config/cameras.json` only in the local working copy used by the exhibition display.

## Visual Modes

Each panel can use one of these `visualMode` values:

- `normal`
- `cropped`
- `blurred`
- `ghosted`
- `high-contrast`
- `dimmed`
- `slow-zoom`

Use `cropMode` to control framing. Supported values are `cover`, `contain`, and `stretch`.

## Edit Artwork Text

Artwork copy lives in `src/data/exhibition.json`. Edit the title, subtitle, text fragments, privacy note, and setup note there.

## Exhibition Controls

Keyboard shortcuts:

- `F`: toggle fullscreen-style install mode and request browser fullscreen when supported
- `L`: toggle labels
- `T`: toggle text fragments
- `D`: toggle debug/config overlay
- `O`: toggle title and privacy overlay

The cursor hides after a short period of inactivity while install mode is active.

## Camera Station Setup

Use each iPhone, iPad, or tablet as a dedicated camera station:

- Open the VDO.Ninja sender link on the device.
- Keep the device plugged into power for the full exhibition period.
- Use a stable mount or stand so the framing does not drift.
- Enable Guided Access, kiosk mode, or equivalent device locking.
- Disable notifications, calls, lock-screen previews, auto-lock, and sounds.
- Test Wi-Fi stability in the room before the opening.
- Use the same network conditions expected during the exhibition.
- Avoid filming identifiable people without explicit consent.
- Add physical signage near each camera explaining that a live camera feed is part of the artwork.

## Privacy

This website embeds configured VDO.Ninja viewing links only. It does not request visitor webcam or microphone access, does not record video, does not use analytics, does not set cookies, and does not store visitor data.
