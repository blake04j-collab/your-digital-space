import { Reveal } from "./Reveal";

export function Testimonial() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            Creator stories
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] tracking-tight">
            Real creators. Real results.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-2xl border border-hairline bg-surface-1/80 backdrop-blur">
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
