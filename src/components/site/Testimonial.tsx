import { Reveal } from "./Reveal";

export function Testimonial() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, oklch(0.68 0.31 340 / 0.14), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-3 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            In their words
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-wide">
            Real creators. <em className="not-italic text-lime">Real growth.</em>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface-1 shadow-lime">
              <video
                className="aspect-[9/16] w-full bg-black md:aspect-video"
                src="/testimonial.mov"
                controls
                playsInline
                preload="metadata"
              />
            </div>
            <p className="mt-5 text-center text-xs font-light uppercase tracking-[0.25em] text-muted-foreground">
              Partner testimonial
            </p>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex justify-center">
            <a
              href="#apply"
              className="rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.02]"
            >
              Request Access ›
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
