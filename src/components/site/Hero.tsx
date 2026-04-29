import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* Floating brand glow */}
      <div
        className="pointer-events-none absolute inset-0 animate-float-glow"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 35%, oklch(0.82 0.16 220 / 0.22), transparent 70%)",
        }}
      />
      {/* Secondary halo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 80%, oklch(0.82 0.16 220 / 0.08), transparent 50%)",
        }}
      />
      {/* Subtle grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Corner ticks */}
      <CornerTicks />

      <div className="relative mx-auto max-w-5xl px-5 py-24 text-center md:py-36">
        <Reveal>
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="signal-bar" aria-hidden />
            Creator Partnership Program
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="font-display text-[clamp(3.5rem,11vw,8rem)] leading-[0.88] tracking-wide">
            Turn Your<br />
            Attention Into<br />
            <em className="not-italic text-lime">Income.</em>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#apply"
              className="shimmer-cta rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.02]"
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
        </Reveal>
        <Reveal delay={280}>
          <div className="mt-14 flex flex-col items-center justify-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:text-[11px]">
            <span>5K – 500K+ creators</span>
            <span className="hidden text-lime animate-blink sm:inline">●</span>
            <span>Fitness · Looks · Lifestyle</span>
            <span className="hidden text-lime animate-blink sm:inline">●</span>
            <span>Direct brand network</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CornerTicks() {
  const base =
    "pointer-events-none absolute h-4 w-4 border-lime/60";
  return (
    <>
      <div className={`${base} top-4 left-4 border-l border-t`} />
      <div className={`${base} top-4 right-4 border-r border-t`} />
      <div className={`${base} bottom-4 left-4 border-l border-b`} />
      <div className={`${base} bottom-4 right-4 border-r border-b`} />
    </>
  );
}
