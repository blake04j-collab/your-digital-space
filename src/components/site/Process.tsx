import { Section } from "./Section";

const steps = [
  { h: "Private application", t: "Share your profile, niche, and current monetization footprint so we can assess fit." },
  { h: "Revenue & systems audit", t: "We diagnose where your funnel leaks — positioning, retention, pricing, and backend ops." },
  { h: "Custom growth blueprint", t: "A tailored scaling plan: content engine, engagement system, and brand pipeline mapped to your numbers." },
  { h: "Quiet, compounding scale", t: "We deploy the team and infrastructure behind the scenes — you stay the face, we run the system." },
];

export function Process() {
  return (
    <Section
      id="process"
      eyebrow="How it works"
      title={<>The process is simple.<br />The results <em className="not-italic text-lime">aren't accidental.</em></>}
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
