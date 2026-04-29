import { Instagram, Twitter, Music2, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground grain">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center px-5 py-12">
        {/* Avatar */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-lime/40 blur-xl" aria-hidden />
          <img
            src={avatar}
            alt="B1"
            className="relative h-28 w-28 rounded-full border-2 border-lime/60 object-cover shadow-lime"
            loading="eager"
          />
        </div>

        <h1 className="mt-5 font-display text-4xl tracking-tight">B1</h1>
        <p className="mt-1 text-sm uppercase tracking-[0.25em] text-muted-foreground">
          i ♡ scaling
        </p>

        {/* Featured CTA */}
        <a
          href="/"
          className="group mt-8 block w-full overflow-hidden rounded-2xl border border-hairline bg-card transition-all hover:-translate-y-0.5 hover:border-lime/60 hover:shadow-lime"
        >
          <div className="flex items-center gap-4 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-lime font-display text-xl text-primary-foreground">
              B1
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-base">Connecting creators with brands</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Creator partnership program · Apply for priority placement
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-lime" />
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
              className="group flex items-center justify-between rounded-xl border border-hairline bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-lime/60 hover:shadow-lime"
            >
              <span className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground">
                {l.icon}
                {l.label}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-lime" />
            </a>
          ))}
        </div>

        {/* For Creators */}
        <a
          href="/"
          className="shimmer-cta mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-6 py-3 font-display text-sm tracking-wider text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          For Creators ›
        </a>

        <div className="mt-auto pt-10 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
          © B1 · b1scale.com
        </div>
      </div>
    </div>
  );
}
