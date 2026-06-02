import { Reveal } from "./Reveal";
import cloud from "@/assets/neon-cloud.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-20 text-center md:pt-24 md:pb-28">
        <Reveal delay={40}>
          <img
            src={cloud}
            alt="B1 Scale"
            className="mx-auto mb-8 h-16 w-auto md:h-20 drop-shadow-[0_0_30px_oklch(0.68_0.31_340_/_0.7)]"
          />
        </Reveal>
        <Reveal delay={120}>
          <h1 className="font-display text-[clamp(2.25rem,7vw,5.25rem)] leading-[1.02] tracking-tight text-foreground">
            Become a million dollar creator with
            <br />
            <span className="text-lime">B1 Scale.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A full-service social media and creator management agency. We handle your content,
            growth, and monetization — so you can focus on creating.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="#apply"
              className="rounded-full bg-lime px-10 py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lime transition-transform hover:scale-[1.03]"
            >
              Start your journey →
            </a>
            <p className="text-xs text-muted-foreground">
              Free to apply · Response within 24 hours
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
