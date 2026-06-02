import { Reveal } from "./Reveal";

const benefits = [
  { h: "Revenue Optimization", t: "Analyze your content performance, audience behavior, and monetization channels to uncover opportunities that increase earnings and create more predictable, long-term income streams." },
  { h: "Paywall Management", t: "Optimize your subscription pricing, content strategy, messaging, and fan conversion process without requiring you to spend more time online." },
  { h: "Content Strategy", t: "Personalized content strategy designed to increase audience engagement, improve retention, and create more opportunities for growth across your platforms." },
  { h: "Account Management", t: "We handle day-to-day platform operations including posting schedules, profile optimization, and performance tracking to ensure your account is consistently converting at its highest potential." },
  { h: "Audience Growth", t: "Identifies growth opportunities across social platforms and implements proven strategies to help expand your reach, attract new followers, and build a stronger personal brand." },
  { h: "Free to Apply", t: "No fees, no commitments. Just a fast, simple application." },
];

export function WhyJoin() {
  return (
    <section id="benefits" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
