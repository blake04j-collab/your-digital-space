import { Reveal } from "./Reveal";

export function Testimonial() {
  return (
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[60%] -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.68 0.31 340 / 0.18), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            Creator results
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
            Real creators. Real results.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-muted-foreground md:text-lg">
            See how creators are growing with Cloud Agency.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-3xl border border-lime/30 bg-surface-1/80 shadow-lime backdrop-blur">
            <video
              className="aspect-[9/16] w-full bg-black md:aspect-video"
              src="/testimonial.mp4"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
