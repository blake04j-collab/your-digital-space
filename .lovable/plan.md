# /lueybtc — Nightclub Mode

Replace the rainbow LUEY page with a dark, after-hours club scene. No rainbows. Cinematic, slightly stylized, non-sexualized.

## Scene composition

Single full-viewport scene, layered back-to-front:

1. **Background** — deep near-black with a faint violet wash; subtle vignette.
2. **Disco speckle** — slowly rotating field of tiny dots (radial-gradient pattern) for ambient sparkle.
3. **Haze layer** — two large blurred radial gradients (magenta + cyan) drifting slowly, simulating fog catching light.
4. **Spotlight cones** — 3 large conic/linear-gradient triangles (magenta, cyan, violet) angled down from the top, sweeping side-to-side on different durations. Soft blur, screen blend.
5. **Dancer silhouette** — inline SVG, centered-lower. Abstract figure: one hip popped, one arm raised, hair flowing — pure black silhouette with a thin neon rim-light (magenta on one side, cyan on the other via drop-shadow filters). Stylized poster-art, not realistic. Gentle sway animation (~2s, subtle rotate + translate to feel like she's moving to the beat).
6. **Floor glow** — elliptical gradient under the dancer's feet pulsing with the beat.
7. **Wordmark** — "LUEY" in Bebas Neue (already loaded in styles.css), large but not screen-filling, positioned upper area so it doesn't collide with the dancer. White fill with magenta + cyan neon glow (layered drop-shadows) that pulses on the beat.
8. **Tagline** — small tracked-out "AFTER HOURS · EST. NOWHERE" eyebrow under the wordmark.
9. **Beat pulse** — a single shared ~120bpm keyframe (`luey-beat`) drives the wordmark glow intensity and floor-glow scale so the whole scene feels synced.

## Color palette

- bg: `#05030a`
- magenta: `#ff2d92`
- cyan: `#22e0ff`
- violet: `#7a2cff`
- silhouette: pure `#000` with neon rim via filter

No rainbow gradients anywhere.

## Animations (local `<style>` block)

- `luey-beat` — 0.5s pulse on glow/scale (~120bpm)
- `luey-sweep-a/b/c` — spotlight cones sway ±15° on 7s/9s/11s cycles
- `luey-haze` — fog drift, 14s ease-in-out
- `luey-speckle-spin` — 60s linear rotate on disco field
- `luey-sway` — dancer subtle hip sway, 2s ease-in-out
- All animations respect `prefers-reduced-motion` (wrap with media query to disable transforms).

## Dancer SVG

Inline SVG, ~50vh tall, centered horizontally, anchored near bottom. Abstract silhouette: head (circle), flowing hair (curved path), torso with hip tilt, one arm raised overhead, one arm out, legs with one knee bent. Tasteful poster-style outline filled black. Rim-lit via two `drop-shadow()` filters (magenta left, cyan right).

## Files

- **Edit** `src/routes/lueybtc.tsx` — replace the rainbow component entirely with the nightclub scene and new keyframes. Keep the same `head()` meta and `noindex` settings.

No new dependencies. No other files touched.
