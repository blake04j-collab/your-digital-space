const items = [
  "Creator Monetization",
  "Audience Scaling",
  "Fan Engagement",
  "Brand Partnerships",
  "DM Optimization",
  "Content Operations",
  "Revenue Systems",
  "Personal Brand Equity",
];

export function Marquee() {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-hairline bg-surface-1 py-5">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-3xl tracking-[0.1em] text-muted-foreground md:text-4xl">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="text-lime">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
