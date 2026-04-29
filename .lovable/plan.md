# Add subheading and reframe key proof tiles

Three tiny edits, all in `src/components/site/LinkInBio.tsx`. No new files, no asset changes.

## 1. Add subheading under "i ♡ scaling"

Right under the existing `i ♡ scaling` line, add a second line:

> **making the attention pay**
>
> **social media marketing**

Styled slightly larger and brighter than the uppercase tagline so it reads as the primary message, but still subordinate to the `B1` display headline.

## 2. Make the Views tile show the full "129k" in the preview

The Views screenshot has the chart at the top and the big "129k" number near the bottom. With `object-cover` on a `4:3` frame, the bottom of the image (where 129k lives) gets cropped.

Fix: switch the Views tile to `object-contain` (and a dark background to fill the letterboxing) so the entire screenshot — including the "129k" — is visible inside the card before clicking. The click-to-zoom dialog still opens the full image.

## 3. Same fix for the Subs tile

The Subscribers screenshot has "758 Subscribers" sitting low in the frame and gets cropped the same way. Apply the same `object-contain` treatment so the full "758" reads in the preview.

Other tiles (Earnings video, Impressions, Visitors) keep `object-cover` — they look better filling the frame and their key numbers are already centered.

## Technical details

- File: `src/components/site/LinkInBio.tsx`
- Add a `fit?: "cover" | "contain"` field to the `Result` type and set `fit: "contain"` on the Views and Subs entries; default remains `cover`.
- In the tile renderer, switch the `<img>` class between `object-cover` and `object-contain` based on `r.fit`. When `contain`, give the image wrapper a solid `bg-background` so the empty space matches the card.
- Subheading uses `font-display`, a slightly larger size than the uppercase tagline, and normal letter-spacing so it doesn't compete with `i ♡ scaling`.