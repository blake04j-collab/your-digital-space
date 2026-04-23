import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-lime text-primary-foreground font-display text-xl">B1</span>
        </Link>
        <nav className="hidden items-center gap-7 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#process" className="hover:text-foreground transition-colors">Process</a>
          <a href="#plans" className="hover:text-foreground transition-colors">Plans</a>
          <a href="#fit" className="hover:text-foreground transition-colors">Fit</a>
        </nav>
        <a
          href="#apply"
          className="rounded-full bg-lime px-4 py-2 font-display text-sm tracking-wider text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Apply ›
        </a>
      </div>
    </header>
  );
}
