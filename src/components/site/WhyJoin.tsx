import { Reveal } from "./Reveal";

const benefits = [
  { h: "Brand Deals", t: "Paid partnerships matched to your niche." },
  { h: "Sponsorship Opportunities", t: "Recurring sponsorships with vetted brands." },
  { h: "Affiliate Partnerships", t: "High-commission affiliate programs." },
  { h: "Creator Growth Support", t: "Guidance from operators who scale creators." },
  { h: "Fast Response Times", t: "Hear back within 24 hours, not weeks." },
  { h: "Free To Apply", t: "No fees. No catch. Just opportunities." },
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
          <h2 className="mx-auto max-w-2xl text-center font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
            Everything you need to grow.
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
