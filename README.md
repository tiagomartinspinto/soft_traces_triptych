# Soft Traces: Triptych

Fullscreen React/Vite installation for three manually configured image sources. Each panel can show a VDO.Ninja live feed, a local pre-recorded video loop, or a selected publicly available webcam/live camera feed.

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

## Exhibition Interface

The normal exhibition interface intentionally shows only one sentence over the triptych:

> A surface keeps listening after the hand has moved away.

Edit that sentence in `src/data/exhibition.json`.

Debug mode is available with `D`. Fullscreen mode is available with `F`. The old label/text/overlay shortcuts are disabled so the public view stays minimal.

The site does not request visitor webcam or microphone access, does not record video, does not use analytics, does not set cookies, and does not store visitor data.

## Configure Sources

Camera configuration is loaded at runtime from `public/config/cameras.json`. Keep exactly three panels, in this order:

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

### Source Pools

Any panel can use a source pool:

```json
{
  "id": "trace",
  "fallbackText": "The distant image is unavailable.",
  "sources": [
    {
      "sourceId": "public-webcam-one",
      "sourceType": "embed",
      "src": "REPLACE_PUBLIC_WEBCAM_EMBED_URL",
      "active": true
    },
    {
      "sourceId": "local-loop",
      "sourceType": "video",
      "src": "/soft_traces_triptych/media/trace-loop.mp4",
      "active": false,
      "muted": true,
      "loop": true
    }
  ]
}
```

The debug overlay shows which source was selected for each panel.

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

## Deploy

Pushes to `main` build and publish the `dist/` folder through GitHub Pages. The Vite base path is configured in `vite.config.js` for the project URL above.

For local/private exhibition operation, keep real feed details out of commits. Copy `public/config/cameras.local.example.json` to the ignored `public/config/cameras.local.json`, fill in the real URLs there, and copy those values into the local runtime `public/config/cameras.json` only on the exhibition machine.
