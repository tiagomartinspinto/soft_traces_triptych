# Soft Traces: Triptych

Fullscreen React/Vite installation for three manually configured image sources. Each panel can show a VDO.Ninja live feed, a local pre-recorded video loop, or a selected publicly available webcam/live camera feed.

Live Pages URL: https://tiagomartinspinto.github.io/soft_traces_triptych/

## Run The Public App

```bash
npm install
npm run dev
```

For a static exhibition build:

```bash
npm run build
npm run preview
```

The normal public artwork view intentionally shows only the triptych, one configurable sentence, and a small centered `sources` button at the bottom. The sentence is edited in `src/data/exhibition.json`.

The app does not request visitor webcam or microphone access, does not use visitor URL parameter feed overrides, does not use analytics, does not set cookies, and does not track visitors.

## Local Source Editor

The `sources` button opens the local editor route at `/editor`. It is intentionally quiet in the artwork view: small, centered, low opacity, and safe to ignore during display.

The editor can:

- View the three required panels: `object`, `space`, `trace`.
- Switch a panel between a single source and a source pool.
- Edit `sourceType`, `src`, `active`, `fallbackText`, `visualMode`, and `cropMode`.
- Add and remove sources in a panel source pool.
- Preview the current source when the browser can render it.
- Warn about `REPLACE_` placeholders.
- Warn when a publicly available webcam/live camera feed may show private spaces or identifiable people.
- Import JSON and export/download JSON that matches `public/config/cameras.json`.
- Toggle dark/light mode for the editor only.

If the local save API is unavailable, the editor still works in static mode with import/export JSON. Saving is disabled and the editor shows a message explaining that `npm run local` is needed.

## Run The Local Editor Server

```bash
npm run local
```

This starts a localhost-only Node/Express server that serves the Vite app and exposes:

- `GET /api/config/cameras`
- `POST /api/config/cameras`

`POST` validates the config and writes only to `public/config/cameras.json`.

The local editor server is intended only for trusted local exhibition setup. Do not expose it publicly.

## Configure Sources

Runtime source configuration lives in:

```text
public/config/cameras.json
```

Keep exactly three panels, in this order:

- `object`
- `space`
- `trace`

Each panel may define one source directly, or a `sources` array. When `sources` exists, the browser chooses one random active source on page load and keeps it until the page is refreshed. Random selection happens locally in the browser.

If `active` is `false`, `src` is empty, or `src` contains `REPLACE_`, the panel shows its fallback state instead of rendering media.

### VDO.Ninja Feed

Use a VDO.Ninja view URL with `cleanoutput`:

```json
{
  "id": "object",
  "sourceType": "vdo",
  "src": "https://vdo.ninja/?view=REPLACE_OBJECT_STREAM_ID&cleanoutput",
  "active": true,
  "fallbackText": "The surface is silent."
}
```

Only configure VDO.Ninja feeds that you control and have permission to exhibit.

### Local Video Loop

Put local video files in `public/media/`, then reference them from `public/config/cameras.json`:

```json
{
  "id": "space",
  "sourceType": "video",
  "src": "/soft_traces_triptych/media/example-loop.mp4",
  "active": true,
  "muted": true,
  "loop": true,
  "fallbackText": "The recording is absent."
}
```

No video files are included by default. Use only files you made, licensed, or have permission to exhibit.

### Public Webcam/Live Camera Embed

Use only manually selected, permission-safe, publicly available webcam/live camera feeds:

```json
{
  "id": "trace",
  "sourceType": "embed",
  "src": "REPLACE_PUBLIC_WEBCAM_EMBED_URL",
  "active": true,
  "fallbackText": "The distant image is unavailable."
}
```

Do not configure feeds that show private spaces, identifiable people, or anything you do not have permission to present.

## Private Local Config

For local/private exhibition operation, keep real feed details out of commits. Copy `public/config/cameras.local.example.json` to the ignored `public/config/cameras.local.json`, fill in the real URLs there, and import/export or copy those values into `public/config/cameras.json` on the exhibition machine.

On GitHub Pages, changing `public/config/cameras.json` still requires a commit, push, and redeploy.

## Visual Modes

Supported `visualMode` values:

- `normal`
- `cropped`
- `blurred`
- `ghosted`
- `high-contrast`
- `dimmed`
- `slow-zoom`

Supported `cropMode` values:

- `cover`
- `contain`
- `stretch`

## Deployment Notes

The public artwork remains safe for GitHub Pages because the save API exists only in `npm run local`. Visitors cannot change feeds through URL parameters, and there is no public admin backend.

For exhibition display, open the artwork route and avoid clicking `sources`. If the footer button is unwanted for a particular install, it can be hidden with local CSS on the exhibition machine without changing source behavior.
