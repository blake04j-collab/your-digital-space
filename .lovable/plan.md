## Changes

### 1. Replace `/lueybtc` profile picture
- Copy the uploaded image (`user-uploads://photo_2026-05-18_21-22-00.jpg`) over `public/luey-avatar.jpg` so the existing `<img src="/luey-avatar.jpg">` in `LueyLinkInBio.tsx` picks it up. No code change needed.

### 2. Remove "Selective by design" section + rework "exclusive/elite" copy
The site currently positions itself as selective and audience-required. Open it up so anyone — including faceless/anonymous creators with zero following — feels welcomed.

**Delete the Fit section entirely**
- Remove `<Fit />` and its import from `src/routes/index.tsx`.
- Remove the `Fit` link from `src/components/site/Nav.tsx` (the only remaining nav link, so the nav links list will be empty — keep the logo + Apply CTA).
- Delete `src/components/site/Fit.tsx`.

**Soften copy elsewhere to match "we work with anyone, faceless welcome"**

- `src/routes/index.tsx` meta: change titles/descriptions from "Elite Creators / high-revenue / high-ticket" to inclusive phrasing, e.g. *"B1 Scale — Creator Growth, From Zero to Scale"* / *"We scale creators at any stage — faceless, anonymous, or established. Private partnerships, built around you."*
- `src/components/site/Hero.tsx`: subline "...built for high-revenue subscription brands." → "...built for any creator ready to grow — faceless, anonymous, or fully public."
- `src/components/site/Services.tsx`:
  - Title `"...elite creators."` → `"...modern creators."`
  - Lead: drop "creators who already command attention — engineered for high-ticket" → "Engineered for creators at any stage — whether you're just starting, faceless, or already scaling."
  - Service body referring to "every elite creator brand" → "every creator brand we partner with".
- `src/components/site/Process.tsx`: first step "Share your profile, niche, and current monetization footprint so we can assess fit." → "Tell us about you and your goals — followers optional, faceless welcome."
- `src/components/site/Stuck.tsx`: line about "curated access" stays but rephrased to remove gatekeeping tone.
- `src/components/site/Footer.tsx`: "Built for elite creator brands" → "Built for creators at every stage."
- `src/components/site/Plans.tsx`: not imported anywhere on the homepage, but contains "private partners" copy — leave untouched since it's unused (avoid scope creep).

### Files touched
- `public/luey-avatar.jpg` (overwrite)
- `src/routes/index.tsx`
- `src/components/site/Nav.tsx`
- `src/components/site/Fit.tsx` (delete)
- `src/components/site/Hero.tsx`
- `src/components/site/Services.tsx`
- `src/components/site/Process.tsx`
- `src/components/site/Stuck.tsx`
- `src/components/site/Footer.tsx`

No backend / data changes. No design system token changes — keeps the existing pink/dark aesthetic and the red Luey page theme intact.