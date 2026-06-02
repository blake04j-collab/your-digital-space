import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    h: "Apply",
    t: "Tell us about you and your content — it takes under a minute.",
  },
  {
    n: "02",
    h: "Strategy Call",
    t: "We map out your content, growth, and monetization plan.",
  },
  {
    n: "03",
    h: "We Run It",
    t: "Our team manages your content, audience, and revenue end-to-end.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            How it works
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mx-auto max-w-2xl text-center font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
            Full-service management. Zero guesswork.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
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
