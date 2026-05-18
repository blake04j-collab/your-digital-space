import { Section } from "./Section";

export function Fit() {
  return (
    <Section
      id="fit"
      eyebrow="Fit"
      title={<>Selective<br /><em className="not-italic text-lime">by design.</em></>}
      lead="We work with a small number of creators at any time. Every brand we scale gets real attention, real systems, real ownership."
    >
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-lime/30 bg-lime-soft p-6 backdrop-blur">
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            A fit if
          </h4>
          <ul className="space-y-3 text-sm font-light text-muted-foreground">
            {[
              "You already have an engaged audience",
              "You run a subscription-based creator brand",
              "You're generating consistent monthly revenue",
              "You want to scale without trading more time",
              "You value privacy and long-term equity",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="text-lime">→</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 backdrop-blur">
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-destructive">
            Not a fit if
          </h4>
          <ul className="space-y-3 text-sm font-light text-muted-foreground/80">
            {[
              "You're still building an initial audience",
              "You're looking for overnight virality",
              "You want a generic agency relationship",
              "You're unwilling to operate as a brand",
              "You're not serious about long-term scale",
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
