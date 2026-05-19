import { Section } from "./Section";

const pains = [
  { h: "Starting from zero feels impossible.", t: "Without a system, the first thousand fans take longer than the next hundred thousand." },
  { h: "Fan engagement leaks revenue.", t: "Most creators lose 40%+ of potential revenue in untracked DMs and broken retention flows." },
  { h: "No real partnership pipeline.", t: "Without the right intros, deals shrink to whatever lands in the inbox — usually the wrong fit." },
  { h: "Operating as a person, not a brand.", t: "Without positioning and ops, a creator can't scale beyond their own bandwidth — faceless or not." },
];

export function Stuck() {
  return (
    <Section
      eyebrow="Why creators plateau"
      title={<>It's never lack of <em className="not-italic text-lime">potential.</em></>}
      lead="Whether you're starting from zero, building faceless, or already scaling — what's missing is the system underneath. The part no one sees, and the part that actually compounds."
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
      <p className="mt-6 text-base font-light text-muted-foreground">That's the layer we build.</p>
    </Section>
  );
}