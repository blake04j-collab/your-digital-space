
# Section Divider Upgrade — Seamless Flow System

Goal: kill the "blocky" section breaks on the homepage and replace them with three layered, brand-aware transition primitives so the page reads as one continuous editorial scroll.

## Current state

- Homepage stacks: `Hero → Testimonial → HowItWorks → WhyJoin → Apply` (in `src/routes/index.tsx`).
- Body already paints a dark magenta radial + brick texture (see `src/styles.css` `body` rule), so "white-to-gray" jumps aren't the problem — the issue is each section is a self-contained block on the same flat backdrop with no transitional cues.
- `Section.tsx` uses `border-b border-hairline` (a hard hairline). Other sections have no transitions at all, so they read as stacked cards rather than a flowing page.
- Existing brand tokens we'll reuse: `--brand-lime` (neon pink), `--brand-blue`, `--hairline`, `--surface-1`.

## What I'll build

Three reusable primitives, then wire them between sections. All purely visual / presentation — no copy, layout, or business-logic changes.

### 1. `<FlowDivider />` — soft gradient fade (primary)

New component `src/components/site/FlowDivider.tsx`. A full-width, ~160px tall element with `pointer-events-none` and a vertical gradient from `transparent` → faint pink/blue tint → `transparent` using `oklch(... / 0.05–0.10)`. Variants: `pink`, `blue`, `neutral`, plus `flip` to reverse direction. Used between every major section pair.

### 2. `<CloudVeil />` — cloud-themed separator (brand)

New component `src/components/site/CloudVeil.tsx`. Layered radial gradients with heavy `blur-3xl`, semi-transparent white fog + faint pink glow, organic non-geometric shape. Sits at the bottom of a section, overlapping the next by ~16px via negative margin. Used at 1–2 high-impact transitions (Hero→Testimonial, WhyJoin→Apply) to reinforce the cloud brand without clutter.

### 3. `<AmbientShapes />` — blurred depth backdrops

New component `src/components/site/AmbientShapes.tsx`. Absolutely-positioned large blurred blobs (opacity 5–12%, soft pink / blue / white), placed off-center (top-right, bottom-left). Optional slow float animation reusing the existing `animate-float-glow` keyframe in `styles.css`. Mounted once at the page level behind `<main>` with `fixed inset-0 -z-10 pointer-events-none`, so it provides continuous depth across the whole scroll instead of per-section.

### Section cleanup

- Remove the hard `border-b border-hairline` from `Section.tsx`.
- Audit each homepage section component for any internal hard dividers / abrupt background blocks and soften (replace borders with gradient masks, drop opaque section backgrounds in favor of transparent + ambient backdrop).
- Keep section padding generous (already `py-20 md:py-28`) so dividers have room to breathe.

### Wiring in `src/routes/index.tsx`

```text
<AmbientShapes />          ← fixed, page-wide
<Nav />
<main>
  <Hero />
  <CloudVeil />            ← brand moment
  <Testimonial />
  <FlowDivider variant="pink" />
  <HowItWorks />
  <FlowDivider variant="blue" flip />
  <WhyJoin />
  <CloudVeil />            ← brand moment before CTA
  <Apply />
</main>
<Footer />
```

## Responsive & perf

- All dividers use `pointer-events-none`, no layout shift.
- Heights scale down on mobile (`h-24 md:h-40`) so blur shapes don't dominate small screens.
- Reuse existing `oklch` tokens and the existing `animate-float-glow` keyframe — no new global CSS beyond a couple of utility classes if needed.
- No new dependencies.

## Files touched

- new: `src/components/site/FlowDivider.tsx`
- new: `src/components/site/CloudVeil.tsx`
- new: `src/components/site/AmbientShapes.tsx`
- edit: `src/components/site/Section.tsx` (drop hard border)
- edit: `src/routes/index.tsx` (compose dividers between sections, mount ambient shapes)
- edit (light, only if needed): individual section components to remove any leftover hard backgrounds/borders that fight the new flow

## Out of scope

- No copy changes, no layout restructuring inside sections, no nav/footer changes, no new routes, no backend.
