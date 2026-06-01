import { Reveal } from "./Reveal";
import cloud from "@/assets/neon-cloud.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="relative mx-auto max-w-4xl px-5 pt-20 pb-24 text-center md:pt-28 md:pb-32">
        <Reveal delay={40}>
          <img
            src={cloud}
            alt=""
            aria-hidden
            className="mx-auto mb-8 h-20 w-auto md:h-24 drop-shadow-[0_0_30px_oklch(0.68_0.31_340_/_0.7)]"
          />
        </Reveal>
        <Reveal delay={120}>
          <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] tracking-wide text-foreground">
            Scale your creator
            <br />
            brand <em className="not-italic text-lime">beyond content.</em>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-7 max-w-xl text-base font-light leading-relaxed text-muted-foreground">
            A private growth partner for creators, influencers, and personal brands.
            We build the systems behind audience growth, monetization, and long-term scale.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#apply"
              className="rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.02]"
            >
              Request Access ›
            </a>
            <a
              href="#services"
              className="rounded-xl border border-hairline bg-surface-1/60 px-8 py-4 font-display text-lg tracking-[0.15em] text-foreground backdrop-blur transition-colors hover:bg-surface-2"
            >
              What we do
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
