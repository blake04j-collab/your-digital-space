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
    <section id={id} className="border-b border-hairline">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <Reveal>
          <div className="mb-5 flex items-center gap-3 eyebrow">
            <span>{eyebrow}</span>
            <span className="h-px flex-1 bg-lime/30" />
          </div>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="font-display text-4xl leading-[0.95] md:text-5xl">{title}</h2>
        </Reveal>
        {lead && (
          <Reveal delay={140}>
            <p className="mt-6 text-base font-light leading-relaxed text-muted-foreground md:text-lg">
              {lead}
            </p>
          </Reveal>
        )}
        <Reveal delay={200}>{children}</Reveal>
      </div>
    </section>
  );
}
