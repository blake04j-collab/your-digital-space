import { Reveal } from "./Reveal";
import cloud from "@/assets/neon-cloud.png";
import model from "@/assets/cloud-model.jpg.asset.json";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-12 text-center md:pt-24 md:pb-16">
        <Reveal delay={40}>
          <img
            src={cloud}
            alt="Cloud Agency"
            className="mx-auto mb-8 h-14 w-auto md:h-16 drop-shadow-[0_0_30px_oklch(0.68_0.31_340_/_0.7)]"
          />
        </Reveal>
        <Reveal delay={120}>
          <h1 className="font-display text-[clamp(2.5rem,7.5vw,5.75rem)] font-semibold leading-[1.02] tracking-tight text-foreground">
            Grow Your Audience.
            <br />
            <span className="text-lime">Increase Your Income.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Cloud Agency helps creators unlock high-value opportunities, increase revenue,
            and build long-term sustainable income from their content.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="#apply"
              className="rounded-full bg-lime px-10 py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lime transition-transform hover:scale-[1.03]"
            >
              Apply Now →
            </a>
            <p className="text-xs text-muted-foreground">
              Free application · Fast review process
            </p>
          </div>
        </Reveal>
      </div>
      <Reveal delay={320}>
        <div className="relative mx-auto max-w-5xl px-5 pb-20 md:pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-hairline shadow-2xl">
            <img
              src={model.url}
              alt="Cloud Agency creator"
              className="block h-auto w-full object-cover"
              loading="eager"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, oklch(0 0 0 / 0.45) 100%)",
              }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
