import { Section } from "./Section";

const pains = [
  { h: "No positioning strategy.", t: "Brands don't know what to do with you, so they pass or lowball." },
  { h: "No direct brand access.", t: "Without the right network, you're stuck on cold DMs and discount codes." },
  { h: "No system behind the content.", t: "Posting consistently isn't enough if the content isn't compounding." },
  { h: "Taking low-quality deals.", t: "One bad partnership can damage your credibility with the brands that actually pay." },
];

export function Stuck() {
  return (
    <Section
      eyebrow="Why creators stay stuck"
      title={<>It's not lack of <em className="not-italic text-lime">effort.</em></>}
      lead="Most creators in this space are working hard. The problem isn't volume — it's the things almost no one gets right alone:"
    >
      <ul className="mt-8 divide-y divide-hairline">
        {pains.map((p) => (
          <li key={p.h} className="flex items-start gap-4 py-4">
            <span className="font-display text-2xl leading-none text-lime">—</span>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">{p.h}</strong> {p.t}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-base font-light text-muted-foreground">That's exactly the gap we fill.</p>
    </Section>
  );
}
