import { Instagram, Twitter, Music2, ArrowUpRight } from "lucide-react";
import avatar from "@/assets/b1-avatar.jpg";

type LinkItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
};

const links: LinkItem[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/b1btc",
    icon: <Instagram className="h-5 w-5" />,
    external: true,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@b1.btc",
    icon: <Music2 className="h-5 w-5" />,
    external: true,
  },
  {
    label: "X / Twitter",
    href: "https://x.com/b1btc",
    icon: <Twitter className="h-5 w-5" />,
    external: true,
  },
];

export function LinkInBio() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground grain">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lime/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] translate-x-1/3 translate-y-1/3 rounded-full bg-lime/10 blur-[100px]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-5 pb-10 pt-10">
        {/* Avatar — large like Linktree */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-full bg-gradient-to-tr from-lime/50 via-lime/20 to-transparent blur-2xl"
          />
          <img
            src={avatar}
            alt="B1"
            className="relative h-44 w-44 rounded-full border-2 border-lime/70 object-cover shadow-lime sm:h-52 sm:w-52"
            loading="eager"
          />
        </div>

        <h1 className="mt-6 font-display text-5xl tracking-tight">B1</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
          i ♡ scaling
        </p>

        {/* Featured CTA */}
        <a
          href="/"
          className="group relative mt-10 block w-full overflow-hidden rounded-2xl border border-lime/40 bg-card transition-all hover:-translate-y-0.5 hover:border-lime hover:shadow-lime"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-lime/10 via-transparent to-lime/10 opacity-0 transition-opacity group-hover:opacity-100"
          />
          <div className="relative flex items-center gap-4 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-lime font-display text-xl text-primary-foreground">
              B1
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-base leading-tight">
                Connecting creators with brands
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Creator partnership program
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-lime transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </a>

        {/* Social links */}
        <div className="mt-4 flex w-full flex-col gap-3">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="group relative flex items-center justify-center rounded-2xl border border-hairline bg-card/80 px-5 py-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-lime/60 hover:bg-card hover:shadow-lime"
            >
              <span className="absolute left-5 text-muted-foreground transition-colors group-hover:text-lime">
                {l.icon}
              </span>
              <span className="font-display text-sm uppercase tracking-[0.22em] text-foreground/90 group-hover:text-foreground">
                {l.label}
              </span>
              <ArrowUpRight className="absolute right-5 h-4 w-4 text-muted-foreground/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime" />
            </a>
          ))}
        </div>

        <div className="mt-auto pt-12 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          © B1 · b1scale.com
        </div>
      </div>
    </div>
  );
}
