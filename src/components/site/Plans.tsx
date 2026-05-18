import { Section } from "./Section";

export function Plans() {
  return (
    <Section
      id="plans"
      eyebrow="Two ways to engage"
      title={<>Network access<br />vs. <em className="not-italic text-lime">private partnership.</em></>}
    >
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-hairline bg-surface-1/70 p-7 backdrop-blur opacity-80">
          <div className="mb-4 inline-block rounded-full border border-hairline bg-surface-2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Network
          </div>
          <h3 className="font-display text-4xl tracking-wider text-muted-foreground">Listed Access</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">No upfront commitment</p>
          <ul className="mt-6 space-y-3 text-sm font-light text-muted-foreground/80">
            {[
              "Added to the creator network",
              "Considered for inbound opportunities",
              "No guaranteed placements",
              "No dedicated team or strategy",
              "No active scaling work",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-2 h-1 w-1 rounded-full bg-muted-foreground/50" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-hairline bg-surface-2 p-3">
            <p className="text-[11px] font-light leading-relaxed text-muted-foreground/80">
              Passive tier. You exist in the network — but nothing is built around you.
            </p>
          </div>
        </div>

        {/* Paid */}
        <div className="relative rounded-2xl border-[1.5px] border-lime bg-lime-soft p-7 shadow-lime backdrop-blur">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-4 py-1 font-display text-[10px] tracking-[0.25em] text-primary-foreground shadow-lime">
            By Invitation
          </div>
          <div className="mb-4 inline-block rounded-full bg-lime px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
            Private
          </div>
          <h3 className="font-display text-4xl tracking-wider text-lime">Partnership</h3>
          <p className="mt-1 text-sm text-muted-foreground">A full scaling system, built around you</p>
          <ul className="mt-6 space-y-3 text-sm font-light text-foreground/90">
            {[
              "Revenue & funnel optimization",
              "Fan engagement & DM systems",
              "Dedicated content operations team",
              "Curated brand partnership pipeline",
              "Backend scaling infrastructure",
              "Positioning for long-term brand equity",
              "Private, white-glove communication",
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
          "We treat your brand as an asset class. Private partners aren't waiting for growth — they're being engineered for it."
        </p>
      </blockquote>
    </Section>
  );
}
