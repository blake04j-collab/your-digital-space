import { Reveal } from "./Reveal";

const benefits = [
  { h: "Higher Income Opportunities", t: "Access deals and revenue streams designed to scale creator income." },
  { h: "Premium Brand Partnerships", t: "Get connected with trusted brands that align with your audience." },
  { h: "Creator-Focused Support", t: "A dedicated team that knows the creator economy inside out." },
  { h: "Fast Application Review", t: "Hear back from our team within 24 hours." },
  { h: "Long-Term Growth", t: "Sustainable strategies built for income that compounds." },
  { h: "Free to Apply", t: "No fees, no commitments — just a fast, simple application." },
];

export function WhyJoin() {
  return (
    <section id="benefits" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            Why creators join
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mx-auto max-w-2xl text-center font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
            Everything creators need to grow.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.h} delay={100 + i * 60}>
              <div className="card-lift h-full rounded-2xl border border-hairline bg-surface-1/70 p-6 backdrop-blur transition-colors hover:border-lime/40">
                <div className="mb-3 h-2 w-2 rounded-full bg-lime shadow-lime" />
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{b.h}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
