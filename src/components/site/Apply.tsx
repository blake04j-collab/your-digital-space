import { useEffect, useState } from "react";
import { ApplyForm } from "./ApplyForm";
import { Reveal } from "./Reveal";

const PROOFS = [
  { src: "/proof/views-129k.jpg", alt: "129k views in first 48 hours" },
  { src: "/proof/subs-758.jpg", alt: "758 new subscribers" },
  { src: "/proof/views-106k.jpg", alt: "106k views growth" },
  { src: "/proof/subs-1454.jpg", alt: "1454 subscribers milestone" },
];

export function Apply() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

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
      <div className="relative mx-auto max-w-2xl px-5 py-12 md:py-16">
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

        <div className="relative z-10 mt-8 rounded-3xl border border-hairline bg-surface-1/90 backdrop-blur-xl">
          <div className="p-6 md:p-10">
            <ApplyForm />
          </div>

          <div className="mx-6 border-t border-hairline md:mx-10" />

          <div className="p-6 md:p-10">
            <div className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Recent Client Results
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {PROOFS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(p.src)}
                  className="group block overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-1 ring-white/10 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-lime"
                  aria-label={`View ${p.alt}`}
                >
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    className="block h-auto w-full rounded-xl"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-2xl bg-white p-2 shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
