import { Reveal } from "./Reveal";

export function BuiltFor() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
        <Reveal>
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            Built for creators
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
            Every platform. Every stage.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Whether you're starting out or already scaling, the B1 Team manages your content,
            social presence, and monetization across every major platform.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["TikTok", "Instagram", "YouTube", "X", "Twitch", "Faceless welcome"].map((p) => (
              <span
                key={p}
                className="rounded-full border border-hairline bg-surface-1/70 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur"
              >
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
