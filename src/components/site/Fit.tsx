import { Section } from "./Section";

export function Fit() {
  return (
    <Section
      id="fit"
      eyebrow="Fit check"
      title={<>We're selective.<br /><em className="not-italic text-lime">Intentionally.</em></>}
      lead="We don't take everyone into priority. That's by design — every creator we actively work with gets real attention, real strategy, real results."
    >
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-lime/30 bg-lime-soft p-6">
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            This is for you if
          </h4>
          <ul className="space-y-3 text-sm font-light text-muted-foreground">
            {[
              "You're posting consistently already",
              "You're in fitness, looks, or lifestyle",
              "You have 5K–500K+ followers",
              "You actually want to monetize",
              "You're open to structure and guidance",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="text-lime">→</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-destructive">
            This is NOT for you if
          </h4>
          <ul className="space-y-3 text-sm font-light text-muted-foreground/80">
            {[
              "You post inconsistently",
              "You're looking for overnight results",
              "You're outside the niche entirely",
              "You don't want feedback or direction",
              "You're not serious about growing",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="text-destructive">✕</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
