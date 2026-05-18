import { Section } from "./Section";

const pillars = [
  {
    title: "Revenue Optimization",
    body: "We audit how your audience converts and rebuild the funnel — pricing, offers, and backend systems engineered for recurring revenue.",
  },
  {
    title: "Fan Engagement Systems",
    body: "DM monetization, retention sequencing, and engagement flows that turn passive followers into long-term, high-value supporters.",
  },
  {
    title: "Content Operations",
    body: "Hooks, cadence, and production dialed in. A repeatable content engine that compounds — without you posting more.",
  },
  {
    title: "Brand Partnerships",
    body: "Direct intros into a curated brand network. Real partnerships that elevate your positioning, not generic affiliate noise.",
  },
  {
    title: "Scaling Infrastructure",
    body: "The team, tooling, and backend ops that quietly run behind every elite creator brand — built for you, kept fully private.",
  },
  {
    title: "Personal Brand Strategy",
    body: "Long-term equity in your name. We position you as a brand, not a profile — defensible, scalable, and acquisition-ready.",
  },
];

export function Services() {
  return (
    <Section
      id="services"
      eyebrow="What we build"
      title={
        <>
          Monetization systems for<br /><em className="not-italic text-lime">elite creators.</em>
        </>
      }
      lead="A complete operating layer for creators who already command attention — engineered for high-ticket, subscription-based growth."
    >
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className="card-lift group relative overflow-hidden rounded-2xl border border-hairline bg-surface-1/70 p-6 backdrop-blur transition-all hover:border-lime/50 hover:bg-surface-2 hover:shadow-lime"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-lime/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            />
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
          "Attention is cheap. Recurring revenue is the moat. We build the systems that turn one into the other — quietly, at scale."
        </p>
      </blockquote>
    </Section>
  );
}