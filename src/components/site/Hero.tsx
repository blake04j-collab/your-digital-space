export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* Soft lime glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 35%, oklch(0.94 0.23 125 / 0.15), transparent 70%)",
        }}
      />
      {/* Subtle grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 py-24 text-center md:py-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-lime" />
          Creator Partnership Program
        </div>
        <h1 className="font-display text-[clamp(3.5rem,11vw,8rem)] leading-[0.88] tracking-wide">
          Turn Your<br />
          Attention Into<br />
          <em className="not-italic text-lime">Income.</em>
        </h1>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#apply"
            className="rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.02]"
          >
            Apply Now ›
          </a>
          <a
            href="#services"
            className="rounded-xl border border-hairline bg-surface-1 px-8 py-4 font-display text-lg tracking-[0.15em] text-foreground transition-colors hover:bg-surface-2"
          >
            How it works
          </a>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>5K – 500K+ creators</span>
          <span className="text-lime">●</span>
          <span>Fitness · Looks · Lifestyle</span>
          <span className="text-lime">●</span>
          <span>Direct brand network</span>
        </div>
      </div>
    </section>
  );
}
