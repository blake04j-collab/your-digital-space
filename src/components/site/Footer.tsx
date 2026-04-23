import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background">
      {/* lime glow base */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 100%, oklch(0.82 0.16 220 / 0.18), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="relative">
              <div className="font-display text-[clamp(3.5rem,13vw,9rem)] leading-none tracking-wider text-lime drop-shadow-[0_0_30px_oklch(0.82_0.16_220_/_0.4)]">
                i ♡ scaling
              </div>
              <div className="mx-auto mt-3 h-px w-24 bg-lime/50" />
            </div>
            <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {[
                { label: "Instagram", href: "https://www.instagram.com/b1btc" },
                { label: "X", href: "https://x.com/b1btc" },
                { label: "TikTok", href: "https://tiktok.com/@b1.btc" },
              ].map((s, i) => (
                <span key={s.label} className="flex items-center gap-6">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="relative transition-colors hover:text-lime after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:scale-x-0 after:origin-left after:bg-lime after:transition-transform after:duration-300 hover:after:scale-x-100"
                  >
                    {s.label}
                  </a>
                  {i < 2 && <span className="text-lime/40">✦</span>}
                </span>
              ))}
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60">
              © {new Date().getFullYear()} B1SCALE · Built for creators who scale
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
