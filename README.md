# Soft Traces: Triptych

Fullscreen React/Vite installation for three embedded VDO.Ninja viewing feeds. The work is designed for a large horizontal exhibition screen, with a responsive stacked layout for smaller screens.

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

## Edit Camera Feeds

Camera configuration lives in `src/data/cameras.json`. Keep exactly three entries for the triptych:

- `object`: Object / Material
- `space`: Space / Room
- `trace`: Trace / Memory

Replace each `vdoNinjaViewUrl` with the VDO.Ninja viewing URL for that camera. The default values are placeholders:

```json
"vdoNinjaViewUrl": "https://vdo.ninja/?view=REPLACE_OBJECT_STREAM_ID&cleanoutput"
```

Set `active` to `false` or leave `vdoNinjaViewUrl` empty to show that panel's fallback text instead of an iframe.
When the display browser reports that it is offline, the app uses each panel's `offlineText`.

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
