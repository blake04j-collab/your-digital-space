import { Reveal } from "./Reveal";

const steps = [
  { n: "01", h: "Apply", t: "Submit a short application — it takes under a minute." },
  { n: "02", h: "Review", t: "The Cloud Agency team reviews your profile." },
  { n: "03", h: "Grow", t: "Access opportunities designed to increase your income." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            How it works
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mx-auto max-w-2xl text-center font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
            Three steps to scale.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={120 + i * 80}>
              <div className="card-lift h-full rounded-2xl border border-hairline bg-surface-1/80 p-8 backdrop-blur">
                <div className="mb-5 font-display text-2xl text-lime">{s.n}</div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{s.h}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
