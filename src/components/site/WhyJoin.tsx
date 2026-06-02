import { Reveal } from "./Reveal";

const benefits = [
  { h: "Content Creation", t: "Front-end production for every major platform — shot, edited, and posted." },
  { h: "Social Media Management", t: "Daily posting, scheduling, and platform strategy across TikTok, IG, YouTube, and X." },
  { h: "Audience Growth", t: "Data-driven strategies to grow followers, engagement, and watch time." },
  { h: "Monetization & Paywalls", t: "Comprehensive paywall and subscription management to maximize revenue." },
  { h: "Influencer Marketing", t: "Campaigns and partnerships managed end-to-end by our team." },
  { h: "DM & Fan Engagement", t: "Pro chat operators that turn audience attention into recurring revenue." },
];

export function WhyJoin() {
  return (
    <section id="benefits" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            What we offer
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mx-auto max-w-2xl text-center font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
            A full-service creator agency.
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
