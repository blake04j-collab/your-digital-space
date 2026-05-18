import { useEffect, useRef } from "react";

export function Nav() {
  const barRef = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${pct})`;
      }
      tickingRef.current = false;
    };
    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls =
    "relative hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:scale-x-0 after:origin-left after:bg-lime after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/95 backdrop-blur-md [transform:translateZ(0)] [will-change:transform]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div aria-label="B1 Scale" className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-md bg-lime font-display text-xl text-primary-foreground shadow-lime">
            B1
          </span>
          <span className="hidden font-display text-sm uppercase tracking-[0.3em] text-foreground/90 sm:inline">
            Scale
          </span>
        </div>
        <nav className="hidden items-center gap-7 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#services" className={linkCls}>Services</a>
          <a href="#process" className={linkCls}>Process</a>
          <a href="#plans" className={linkCls}>Access</a>
          <a href="#fit" className={linkCls}>Fit</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#apply"
            className="shimmer-cta rounded-full bg-lime px-4 py-2 font-display text-sm tracking-wider text-primary-foreground shadow-lime transition-transform hover:scale-[1.04]"
          >
            Request Access ›
          </a>
        </div>
      </div>
      {/* scroll progress — transform-only, no React re-renders */}
      <div
        ref={barRef}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-lime [will-change:transform]"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
