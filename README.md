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

Run the project check before committing configuration changes:

```bash
npm run check
```

The normal public artwork view intentionally shows only the triptych and one configurable sentence. The sentence is edited in `src/data/exhibition.json`.

The app does not request visitor webcam or microphone access, does not use visitor URL parameter feed overrides, does not use analytics, does not set cookies, and does not track visitors.

## Exhibition Operation

- Press `F` to toggle fullscreen/display mode. Browsers require a user gesture before fullscreen can start.
- Press `D` during local setup to toggle the debug overlay.
- Use the local editor only during setup.
- Do not commit real feed URLs, VDO.Ninja view IDs, passwords, or private source values.
- Keep real exhibition feeds in `public/config/cameras.local.json`, which is ignored by Git.

## Local Source Editor

The `sources` button appears only when the app is running on `localhost` or `127.0.0.1`. It is hidden on GitHub Pages and other public hosts.

When visible, the button opens the editor route at `/editor` in a separate tab/window and briefly shows a small Terminal hint:

```bash
npm install
npm run local
```

The `/editor` route is sealed on non-local hosts. On GitHub Pages or any other public host it shows only:

```text
Local source editor is available only during local setup.
```

Saving remains disabled unless the local API from `npm run local` is available. Import/export still works in static mode.

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

Committed `public/config/cameras.json` should contain only inactive empty sources or `REPLACE_` placeholders. Keep real/private exhibition values in the ignored local file:

```text
public/config/cameras.local.json
```

Copy `public/config/cameras.local.example.json` to that ignored file for local setup.

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
  "active": false,
  "fallbackText": "The surface is silent."
}
```

Only configure VDO.Ninja feeds that you control and have permission to exhibit. Do not commit real view IDs or password parameters.

### Local Video Loop

Put local video files in `public/media/`, then reference them from the local config:

```json
{
  "id": "space",
  "sourceType": "video",
  "src": "/soft_traces_triptych/media/REPLACE_SPACE_LOOP.mp4",
  "active": false,
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
  "active": false,
  "fallbackText": "The distant image is unavailable."
}
```

Do not configure feeds that show private spaces, identifiable people, or anything you do not have permission to present.

### YouTube Embeds

YouTube sources must use embed URLs, not watch-page URLs. Recommended format:

```text
https://www.youtube-nocookie.com/embed/VIDEO_ID?autoplay=1&mute=1&controls=0&playsinline=1
```

Some videos and live streams still cannot be embedded if the owner disables embedding or YouTube blocks it. Local video files are still the most stable option for exhibition playback.

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

GitHub Pages direct opening of `/editor` is handled by a static fallback and resolves to the local-only editor notice on public hosts.
