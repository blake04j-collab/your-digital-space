import cloud from "@/assets/neon-cloud.png";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="/" aria-label="Cloud Agency" className="flex items-center gap-2.5">
          <img
            src={cloud}
            alt=""
            aria-hidden
            className="h-7 w-auto drop-shadow-[0_0_10px_oklch(0.68_0.31_340_/_0.7)]"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Cloud Agency
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#benefits" className="transition-colors hover:text-foreground">Benefits</a>
        </nav>
        <a
          href="#apply"
          className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lime transition-transform hover:scale-[1.04]"
        >
          Apply Now
        </a>
      </div>
    </header>
  );
}
