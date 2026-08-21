# INTEGRATION GUIDE — Drop assets and go

This document tells Cursor (or you) exactly how to wire real images and frames
into the Himalayan Highway project. Every placeholder is marked with a comment.

---

## 1. Frame Videos → Extracted Frames

Run `node extract-frames.js` after putting videos in the `videos/` folder.
This populates `public/frames/{hero,shimla,manali,spiti,ladakh}/`.

Then in `src/app/page.tsx`, change:
```ts
import { FrameLoadingProvider } from "@/hooks/useFrameLoadingDemo";
// →
import { FrameLoadingProvider } from "@/hooks/useFrameLoading";
```

Frame players are already wired in Hero.tsx and DestinationScene.tsx.
They read from `/frames/<name>/frame_XXXX.webp` automatically.

---

## 2. Hero Images (3 layers)

Put these in `public/images/`:
- `hero-bg.png` — Mountain range background
- `hero-clouds-fg.png` — Foreground mist/cloud layer

In `src/components/Hero.tsx`, find these comment blocks and uncomment/swap:

```tsx
// REPLACE this gradient div:
<div className="hero__sky" style={{...}} />
// WITH:
<img src="/images/hero-bg.png" className="hero__bg-image" alt=""
     style={{ transform: `translate3d(${mouse.x * -20}px, ${mouse.y * -10}px, 0) scale(1.15)` }} />

// REPLACE this gradient div:
<div className="hero__mist" style={{...}} />
// WITH:
<img src="/images/hero-clouds-fg.png" className="hero__mist-image" alt=""
     style={{ transform: `translate3d(${mouse.x * 12}px, 0, 0)`, opacity: 1 - fadeOut * 0.6 }} />
```

Delete `<div className="hero__mountains" .../>` — the canvas + real images replace it.

---

## 3. Destination Images (3 layers × 4 destinations)

For each destination (shimla, manali, spiti, ladakh), put in `public/images/`:
- `{id}-bg.png` — Background layer (distant mountains)
- `{id}-mist.png` — Middle mist/dust layer
- `{id}-fg.png` — Foreground frame (branches, rocks, prayer flags)

In `src/components/DestinationScene.tsx`, find the comment blocks for each layer:

```tsx
// REPLACE gradient background:
<div className="dest-scene__bg" style={{...}} />
// WITH:
<img src={`/images/${destination.id}-bg.png`} className="dest-scene__bg-img" alt=""
     style={{ transform: `translate3d(${bgX}px, ${bgY}px, 0) scale(1.15)` }} />

// REPLACE mist div:
<div className="dest-scene__mid" style={{...}} />
// WITH:
<img src={`/images/${destination.id}-mist.png`} className="dest-scene__mid-img" alt=""
     style={{ opacity: 0.3 + frameProgress * 0.3, transform: `translate3d(${mouse.x * 6}px, ${-frameProgress * 30}px, 0)` }} />

// REPLACE foreground div:
<div className="dest-scene__fg" style={{...}} />
// WITH:
<img src={`/images/${destination.id}-fg.png`} className="dest-scene__fg-img" alt=""
     style={{ transform: `translate3d(${fgX}px, ${fgY}px, 0)`, opacity: 1 - sceneExit * 0.5 }} />
```

---

## 4. Map Assets

Put in `public/images/`:
- `map-terrain.png` — Illustrated top-down terrain map
- `bus-side.png` — Side-view bus (transparent bg)
- `pin-shimla.png`, `pin-manali.png`, `pin-spiti.png`, `pin-ladakh.png`

In `src/components/MapJourney.tsx`:
- Replace the SVG `<rect>` bus shape with an `<image>` tag using `bus-side.png`
- Replace the terrain gradient `<rect>` with `<image>` using `map-terrain.png`
- Replace pin `<circle>` elements with `<image>` tags for each pin icon

---

## 5. Fonts

Put `OggText-Medium.woff2` in `public/fonts/`.
The @font-face in globals.css already points to `/fonts/OggText-Medium.woff2`.

---

## 6. File Checklist

```
public/
├── fonts/
│   └── OggText-Medium.woff2
├── frames/
│   ├── hero/frame_0001.webp ... frame_NNNN.webp
│   ├── shimla/frame_0001.webp ... frame_NNNN.webp
│   ├── manali/frame_0001.webp ... frame_NNNN.webp
│   ├── spiti/frame_0001.webp ... frame_NNNN.webp
│   └── ladakh/frame_0001.webp ... frame_NNNN.webp
├── images/
│   ├── hero-bg.png
│   ├── hero-clouds-fg.png
│   ├── map-terrain.png
│   ├── bus-side.png
│   ├── pin-shimla.png
│   ├── pin-manali.png
│   ├── pin-spiti.png
│   ├── pin-ladakh.png
│   ├── shimla-bg.png
│   ├── shimla-mist.png
│   ├── shimla-fg.png
│   ├── manali-bg.png
│   ├── manali-mist.png
│   ├── manali-fg.png
│   ├── spiti-bg.png
│   ├── spiti-mist.png
│   ├── spiti-fg.png
│   ├── ladakh-bg.png
│   ├── ladakh-mist.png
│   └── ladakh-fg.png
```

Total: 1 font + ~1200 frames + 20 images

---

## 7. Quick Test Without All Assets

The project works right now with zero assets:
- Frame players show empty canvas (no crash)
- Gradient placeholders fill in for missing images
- Demo preloader simulates loading

You can add assets incrementally — each one you drop in just replaces a gradient.

---

## 8. Frame Count Configuration

If your videos are NOT exactly 240 frames (8s × 24fps = 192, or 10s × 24fps = 240),
update the frame counts in `src/lib/destinations.ts`:

```ts
// Change frameCount for each destination:
{
  id: "shimla",
  frameCount: 192,  // ← actual number of frames extracted
  ...
}
```

Also update the hero frame count in `src/components/Hero.tsx` line ~50:
```ts
const count = 192; // ← match your actual hero frame count
```

Check actual count: `ls public/frames/shimla/ | wc -l`
