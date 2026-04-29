## Goal

Replace the blinking lime dot beside "Creator Partnership Program" in the hero with **Option D — a small lime signal bar with a sweeping highlight**. Same footprint, more crafted, matches the existing `shimmer-cta` language.

## Changes

### 1. `src/styles.css` — add signal-bar utility

Inside the `@layer utilities` block, just after the existing `animate-blink` rule (around line 246), add:

```css
/* Signal bar with sweeping highlight */
@keyframes signal-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.signal-bar {
  position: relative;
  display: inline-block;
  width: 14px;
  height: 2px;
  background-color: var(--brand-lime);
  overflow: hidden;
  border-radius: 1px;
  opacity: 0.85;
}
.signal-bar::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.9), transparent);
  transform: translateX(-100%);
  animation: signal-sweep 2.6s ease-in-out infinite;
}
```

### 2. `src/components/site/Hero.tsx` — swap the dot for the bar

Replace lines 38–41:

```tsx
<div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
  <span className="signal-bar" aria-hidden />
  Creator Partnership Program
</div>
```

## Notes

- Keeps the pill the exact same height; only the dot becomes a 14×2px lime bar.
- Sweep animation reuses the same easing/timing feel as the Apply button shimmer for consistency.
- No new dependencies, no other files affected.

Approve and I'll apply it.
