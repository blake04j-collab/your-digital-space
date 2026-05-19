import { Section } from "./Section";

const steps = [
  { h: "Private application", t: "Tell us about you and your goals — followers optional, faceless and anonymous creators welcome." },
  { h: "Revenue & systems audit", t: "We diagnose where your funnel leaks — positioning, retention, pricing, and backend ops." },
  { h: "Custom growth blueprint", t: "A tailored scaling plan: content engine, engagement system, and brand pipeline mapped to your numbers." },
  { h: "Quiet, compounding scale", t: "We deploy the team and infrastructure behind the scenes — you stay the face, we run the system." },
];

export function Process() {
  return (
    <Section
      id="process"
      eyebrow="The process"
      title={<>Discreet by design.<br /><em className="not-italic text-lime">Engineered for scale.</em></>}
    >
      <ol className="mt-10 space-y-1">
        {steps.map((s, i) => (
          <li
            key={s.h}
            className="flex items-start gap-5 border-b border-hairline py-5 last:border-none"
          >
            <span className="w-10 font-display text-3xl text-muted-foreground/40">
              0{i + 1}
            </span>
            <div className="flex-1">
              <h4 className="text-base font-medium text-foreground">{s.h}</h4>
              <p className="mt-1 text-sm font-light leading-relaxed text-muted-foreground">{s.t}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
