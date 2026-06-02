import { useEffect, useRef, useState } from "react";
import { ApplyForm } from "./ApplyForm";
import { Reveal } from "./Reveal";

type Proof = {
  src: string;
  alt: string;
  pos: string; // desktop absolute positioning classes
  translate: string; // initial translate (collapsed behind form)
  rotate: string;
  delay: number;
};

const PROOFS: Proof[] = [
  {
    src: "/proof/views-129k.jpg",
    alt: "129k views in first 48 hours",
    pos: "lg:top-0 lg:-left-24 xl:-left-40",
    translate: "translate-x-32 translate-y-16",
    rotate: "-rotate-6",
    delay: 0,
  },
  {
    src: "/proof/subs-758.jpg",
    alt: "758 new subscribers",
    pos: "lg:top-8 lg:-right-28 xl:-right-44",
    translate: "-translate-x-32 translate-y-16",
    rotate: "rotate-6",
    delay: 120,
  },
  {
    src: "/proof/views-106k.jpg",
    alt: "106k views growth",
    pos: "lg:bottom-4 lg:-left-28 xl:-left-44",
    translate: "translate-x-32 -translate-y-16",
    rotate: "rotate-3",
    delay: 240,
  },
  {
    src: "/proof/subs-1454.jpg",
    alt: "1454 subscribers milestone",
    pos: "lg:bottom-0 lg:-right-24 xl:-right-40",
    translate: "-translate-x-32 -translate-y-16",
    rotate: "-rotate-3",
    delay: 360,
  },
];

export function Apply() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="apply" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, oklch(0.68 0.31 340 / 0.22), transparent 70%)",
        }}
      />
      <div ref={ref} className="relative mx-auto max-w-2xl px-5 py-12 md:py-16">
        <Reveal>
          <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-lime">
            Apply now
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-center font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
            Start growing with Cloud Agency.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground md:text-base">
            Tell us where to reach you. Our team follows up within 24 hours.
          </p>
        </Reveal>

        {/* Form + floating proof screenshots */}
        <div className="relative mt-8">
          {/* Desktop floating proofs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            {PROOFS.map((p, i) => (
              <div
                key={i}
                className={`absolute w-52 xl:w-60 ${p.pos} transition-all duration-[1100ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                  visible
                    ? `translate-x-0 translate-y-0 opacity-90 ${p.rotate}`
                    : `${p.translate} opacity-0 rotate-0 scale-90 blur-md`
                }`}
                style={{ transitionDelay: `${p.delay}ms` }}
              >
                <div className="relative rounded-2xl bg-white p-2 shadow-[0_20px_60px_-15px_rgba(255,0,200,0.35),0_8px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/20">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl blur-2xl"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, oklch(0.68 0.31 340 / 0.45), transparent 70%)",
                    }}
                  />
                  <img
                    src={p.src}
                    alt={p.alt}
                    className="block w-full rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Form (always dominant, on top) */}
          <div className="relative z-10 rounded-3xl border border-hairline bg-surface-1/90 p-6 backdrop-blur-xl md:p-10">
            <ApplyForm />
          </div>
        </div>

        {/* Mobile / tablet: 2x2 proof grid below the form */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
          {PROOFS.map((p, i) => (
            <div
              key={i}
              className={`rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-white/10 transition-all duration-700 ${
                visible ? "opacity-90 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${p.delay}ms` }}
            >
              <img src={p.src} alt={p.alt} className="block w-full rounded-lg" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
