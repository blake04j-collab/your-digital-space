import { Section } from "./Section";

export function Plans() {
  return (
    <Section
      id="plans"
      eyebrow="Two ways to work with us"
      title={<>Standard access<br />vs. <em className="not-italic text-lime">priority partnership.</em></>}
    >
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-hairline bg-surface-1 p-7 opacity-80">
          <div className="mb-4 inline-block rounded-full border border-hairline bg-surface-2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Standard
          </div>
          <h3 className="font-display text-4xl tracking-wider text-muted-foreground">Free Access</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">No upfront cost</p>
          <ul className="mt-6 space-y-3 text-sm font-light text-muted-foreground/80">
            {[
              "Added to creator pool",
              "May be considered for deals",
              "No guaranteed placements",
              "No direct brand outreach",
              "No strategy or support",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-2 h-1 w-1 rounded-full bg-muted-foreground/50" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-yellow-900/40 bg-yellow-950/30 p-3">
            <p className="text-[11px] font-light leading-relaxed text-yellow-700/80">
              Passive tier. You're in the network — but not being actively worked. Most creators here are not placed.
            </p>
          </div>
        </div>

        {/* Paid */}
        <div className="relative rounded-2xl border-[1.5px] border-lime bg-lime-soft p-7 shadow-lime">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-4 py-1 font-display text-[10px] tracking-[0.25em] text-primary-foreground">
            Recommended
          </div>
          <div className="mb-4 inline-block rounded-full bg-lime px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
            Priority
          </div>
          <h3 className="font-display text-4xl tracking-wider text-lime">Partner</h3>
          <p className="mt-1 text-sm text-muted-foreground">Investment in your growth</p>
          <ul className="mt-6 space-y-3 text-sm font-light text-foreground/90">
            {[
              "Guaranteed intro to a major brand",
              "Direct outreach on your behalf",
              "Full social media team assigned",
              "Daily content direction & post ideas",
              "Professional editing & optimization",
              "Account positioning for high-value deals",
              "Long-term partnership building",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-2 h-1 w-1 rounded-full bg-lime" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <blockquote className="mt-8 rounded-r-lg border-l-2 border-lime bg-lime-soft px-5 py-4">
        <p className="text-base font-light italic leading-relaxed text-muted-foreground">
          "We treat your page like an asset, not just content. Priority creators aren't waiting for deals — they're being actively positioned for them."
        </p>
      </blockquote>
    </Section>
  );
}
