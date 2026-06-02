import { Reveal } from "./Reveal";
import model from "@/assets/cloud-model.jpg.asset.json";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-10 md:pt-20 md:pb-14 lg:pt-24 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* LEFT COLUMN — messaging + CTA */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Reveal delay={40}>
              <span className="eyebrow mb-4 inline-block">Creator Management</span>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.25rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
                Grow Your Audience.
                <br />
                <span className="text-lime">Increase Your Income.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:mx-0">
                A full-service creator management agency. We handle your content,
                growth, and monetization — so you can focus on creating.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-7 flex flex-col items-center gap-3 md:items-start">
                <a
                  href="#apply"
                  className="shimmer-cta rounded-full bg-lime px-10 py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lime transition-transform hover:scale-[1.03]"
                >
                  Apply Now →
                </a>
                <p className="text-xs text-muted-foreground">
                  Free application · Fast review process
                </p>
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN — editorial image card */}
          <Reveal delay={340} className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-md">
              {/* Soft glow / gradient backdrop */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[2.5rem] blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, oklch(0.68 0.31 340 / 0.35), oklch(0.78 0.22 320 / 0.12) 55%, transparent 70%)",
                }}
              />

              {/* Card frame */}
              <div className="relative overflow-hidden rounded-2xl border border-hairline bg-card p-3 shadow-[0_24px_60px_-16px_oklch(0_0_0_/_0.5)]">
                <img
                  src={model.url}
                  alt="Cloud Agency creator"
                  className="block h-auto w-full rounded-xl object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
