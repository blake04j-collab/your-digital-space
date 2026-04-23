import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function Nav() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls =
    "relative hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:scale-x-0 after:origin-left after:bg-lime after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-lime text-primary-foreground font-display text-xl shadow-lime">
            B1
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#services" className={linkCls}>Services</a>
          <a href="#process" className={linkCls}>Process</a>
          <a href="#plans" className={linkCls}>Plans</a>
          <a href="#fit" className={linkCls}>Fit</a>
        </nav>
        <a
          href="#apply"
          className="shimmer-cta rounded-full bg-lime px-4 py-2 font-display text-sm tracking-wider text-primary-foreground transition-transform hover:scale-[1.04]"
        >
          Apply ›
        </a>
      </div>
      {/* scroll progress */}
      <div className="absolute bottom-0 left-0 h-px bg-lime transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </header>
  );
}
