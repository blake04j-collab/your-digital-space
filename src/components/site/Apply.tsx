import { ApplyForm } from "./ApplyForm";
import { Reveal } from "./Reveal";

export function Apply() {
  return (
    <section id="apply" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, oklch(0.68 0.31 340 / 0.22), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            Apply now
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
            Let's scale your creator business.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground md:text-base">
            Tell us where to reach you. The B1 Team will follow up within 24 hours.
          </p>
        </Reveal>
        <div className="mt-10 rounded-3xl border border-hairline bg-surface-1/70 p-6 backdrop-blur md:p-10">
          <ApplyForm />
        </div>
      </div>
    </section>
  );
}
