import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* Floating brand glow — neon pink */}
      <div
        className="pointer-events-none absolute inset-0 animate-float-glow"
        style={{
          background: "radial-gradient(ellipse 55% 45% at 50% 35%, oklch(0.68 0.31 340 / 0.32), transparent 70%)",
        }}
      />
      {/* Secondary purple halo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 80% 80%, oklch(0.55 0.25 310 / 0.18), transparent 55%)",
        }}
      />
      {/* Brick-wall texture, very subtle */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "120px 40px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <CornerTicks />

      <div className="relative mx-auto max-w-5xl px-5 py-24 text-center md:py-36">
        {/* Neon cloud motif */}
        <Reveal></Reveal>
        <Reveal delay={40}>
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface-1/70 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
            <span className="signal-bar" aria-hidden />
            Private Creator Growth Partner
            <span className="signal-bar" aria-hidden />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="font-display text-[clamp(3rem,10vw,7.5rem)] leading-[0.9] tracking-wide">
            Scale Your
            <br />
            Creator Brand
            <br />
            <em className="not-italic text-lime drop-shadow-[0_0_18px_oklch(0.68_0.31_340_/_0.6)]">Beyond Content.</em>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-xl text-sm font-light leading-relaxed text-muted-foreground md:text-base">
            B1 Scale helps modern creators optimize monetization, fan engagement, and backend growth systems — built for
            high-revenue subscription brands.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#apply"
              className="shimmer-cta rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.02]"
            >
              Request Access ›
            </a>
            <a
              href="#services"
              className="rounded-xl border border-hairline bg-surface-1/70 px-8 py-4 font-display text-lg tracking-[0.15em] text-foreground backdrop-blur transition-colors hover:bg-surface-2 hover:border-lime/40"
            >
              How it works
            </a>
          </div>
        </Reveal>
        <Reveal delay={340}>
          <div className="mt-14 flex flex-col items-center justify-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:text-[11px]">
            <span>Creator monetization</span>
            <span className="hidden text-lime animate-blink sm:inline">●</span>
            <span>Premium fan platforms</span>
            <span className="hidden text-lime animate-blink sm:inline">●</span>
            <span>Scaling infrastructure</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function NeonCloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <filter id="cloud-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M30 55 Q12 55 12 40 Q12 28 26 26 Q28 12 44 12 Q58 12 62 22 Q68 18 76 22 Q90 22 92 36 Q108 38 108 50 Q108 60 96 60 H32 Q30 60 30 55 Z"
        stroke="oklch(0.78 0.28 340)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#cloud-glow)"
      />
    </svg>
  );
}

function CornerTicks() {
  const base = "pointer-events-none absolute h-4 w-4 border-lime/60";
  return (
    <>
      <div className={`${base} top-4 left-4 border-l border-t`} />
      <div className={`${base} top-4 right-4 border-r border-t`} />
      <div className={`${base} bottom-4 left-4 border-l border-b`} />
      <div className={`${base} bottom-4 right-4 border-r border-b`} />
    </>
  );
}
