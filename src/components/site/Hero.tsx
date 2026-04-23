import heroBg from "@/assets/hero-bg.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "radial-gradient(circle at 50% 40%, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 gradient-hero" />
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
        <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">
          B1BTC scales creators in fitness, looks, and lifestyle — connecting real audiences to real brand deals. <span className="text-foreground">i ♡ scaling.</span>
        </p>
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
