import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="relative">
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <Reveal>
          <div className="mb-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {eyebrow}
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-[0.95] tracking-wide text-foreground">
            {title}
          </h2>
        </Reveal>
        {lead && (
          <Reveal delay={140}>
            <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-muted-foreground md:text-base">
              {lead}
            </p>
          </Reveal>
        )}
        {children && <Reveal delay={200}>{children}</Reveal>}
      </div>
    </section>
  );
}
