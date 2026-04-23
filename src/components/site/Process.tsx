import { Section } from "./Section";

const steps = [
  { h: "Fill out the form", t: "We collect your profile, niche, and socials to understand where you're at." },
  { h: "We evaluate your account", t: "Positioning, content quality, monetization potential — not just follower count." },
  { h: "We assess the right fit", t: "We identify which brands and opportunities actually make sense for your audience." },
  { h: "You're placed in the pipeline", t: "Either added to our broader creator network, or moved to priority where active outreach begins." },
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
