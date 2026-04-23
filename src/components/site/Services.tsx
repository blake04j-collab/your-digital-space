import { Section } from "./Section";

const pillars = [
  {
    title: "Creator Growth",
    body: "Positioning your account for long-term equity — not short-term reach. We look at how you're set up, not just follower count.",
  },
  {
    title: "Brand Partnerships",
    body: "Direct intros to brands that actually match your niche and audience. Real relationships, not spray-and-pray.",
  },
  {
    title: "Content Optimization",
    body: "Hooks, cadence, structure — dialed in to make your content work harder without you posting more.",
  },
  {
    title: "Deal Negotiation",
    body: "We advocate for high-value terms on your behalf. Most creators leave money on the table. We fix that.",
  },
];

export function Services() {
  return (
    <Section
      id="services"
      eyebrow="What we do"
      title={
        <>
          We sit at the intersection<br />of <em className="not-italic text-lime">three things.</em>
        </>
      }
      lead="Growth, monetization, and access — built into one operating system for creators who are already winning attention."
    >
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className="group rounded-2xl border border-hairline bg-surface-1 p-6 transition-colors hover:border-lime/40"
          >
            <div className="mb-3 font-display text-xs tracking-[0.25em] text-lime">
              0{i + 1}
            </div>
            <h4 className="mb-2 text-base font-medium text-foreground">{p.title}</h4>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </div>
        ))}
      </div>
      <blockquote className="mt-8 rounded-r-lg border-l-2 border-lime bg-lime-soft px-5 py-4">
        <p className="text-base font-light italic leading-relaxed text-muted-foreground">
          "We bridge the gap between attention and monetization. Most creators are one positioning shift away from significantly better deals."
        </p>
      </blockquote>
    </Section>
  );
}
