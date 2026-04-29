import { useRef, useState } from "react";
import { Instagram, Music2, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import avatar from "@/assets/b1-avatar.jpg";
import resultViews from "@/assets/results/views.jpg";
import resultImpressions from "@/assets/results/impressions.jpg";
import resultVisitors from "@/assets/results/visitors.png";
import resultSubscribers from "@/assets/results/subscribers.png";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Result = {
  src: string;
  alt: string;
  stat: string;
  label: string;
  type?: "image" | "video";
  poster?: string;
  fit?: "cover" | "contain";
};

const results: Result[] = [
  { src: "/results/earnings.mp4", poster: "/results/earnings-poster.jpg", alt: "$63k earnings in 7 days", stat: "$63K", label: "Earnings / 7d", type: "video" },
  { src: resultViews, alt: "129k views in first 48 hours", stat: "129K", label: "Views / 48h", fit: "contain" },
  { src: resultImpressions, alt: "93,701 impressions and 5,288 link clicks", stat: "93.7K", label: "Impressions" },
  { src: resultVisitors, alt: "20,307 profile visitors over 5 days", stat: "20.3K", label: "Visitors / 5d" },
  { src: resultSubscribers, alt: "758 subscribers in 1 day", stat: "758", label: "Subs / 1d", fit: "contain" },
];

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
];

export function LinkInBio() {
  const [zoomed, setZoomed] = useState<{ src: string; alt: string; type?: "image" | "video" } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: "smooth" });
  };

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
        {/* Avatar */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-full bg-gradient-to-tr from-lime/50 via-lime/20 to-transparent blur-2xl"
          />
          <img
            src={avatar}
            alt="B1"
            className="relative h-28 w-28 rounded-full border-2 border-lime/70 object-cover shadow-lime"
            loading="eager"
          />
        </div>

        <h1 className="mt-6 font-display text-5xl tracking-tight">B1</h1>
        <div className="mt-4 space-y-0.5 text-center text-[13px] lowercase leading-tight tracking-[0.25em] text-muted-foreground">
          <p>i ♡ scaling</p>
          <p>making the attention pay</p>
          <p>social media marketing</p>
        </div>

        {/* Featured CTA */}
        <a
          href="/"
          className="group relative mt-8 block w-full overflow-hidden rounded-2xl border border-lime/40 bg-card transition-all hover:-translate-y-0.5 hover:border-lime hover:shadow-lime"
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
        <div className="mt-3 flex w-full flex-col gap-3">
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

        {/* Proof of work — single horizontal scrollable row */}
        <div className="mt-8 -mx-5 w-[calc(100%+2.5rem)]">
          <div className="mb-4 flex items-center justify-between px-5">
            <h2 className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Proof of work
            </h2>
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] uppercase tracking-[0.25em] text-lime/80 sm:inline">
                Scroll →
              </span>
              <button
                type="button"
                onClick={() => scrollByDir(-1)}
                aria-label="Scroll left"
                className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-card/80 text-muted-foreground backdrop-blur transition-all hover:border-lime/60 hover:text-lime"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByDir(1)}
                aria-label="Scroll right"
                className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-card/80 text-muted-foreground backdrop-blur transition-all hover:border-lime/60 hover:text-lime"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {results.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setZoomed({ src: r.src, alt: r.alt, type: r.type })}
                className="group relative w-[68%] shrink-0 snap-start overflow-hidden rounded-2xl border border-hairline bg-card/80 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:border-lime/60 hover:shadow-lime focus:outline-none focus-visible:border-lime focus-visible:shadow-lime sm:w-[55%]"
                aria-label={`View larger: ${r.alt}`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-background">
                  {r.type === "video" ? (
                    <video
                      src={r.src}
                      poster={r.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={r.src}
                      alt={r.alt}
                      loading="lazy"
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                        r.fit === "contain" ? "object-contain p-2" : "object-cover"
                      }`}
                    />
                  )}
                </div>
                <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
                  <span className="font-display text-lg leading-none text-foreground">
                    {r.stat}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {r.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-12 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          © B1 · b1scale.com
        </div>
      </div>

      {/* Zoom dialog */}
      <Dialog open={!!zoomed} onOpenChange={(o) => !o && setZoomed(null)}>
        <DialogContent className="max-w-4xl border-lime/40 bg-card p-2 sm:p-3">
          <DialogTitle className="sr-only">{zoomed?.alt ?? "Result"}</DialogTitle>
          {zoomed && (zoomed.type === "video" ? (
            <video
              src={zoomed.src}
              autoPlay
              loop
              controls
              playsInline
              className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
            />
          ) : (
            <img
              src={zoomed.src}
              alt={zoomed.alt}
              className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
            />
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProofRow({
  results,
  onZoom,
}: {
  results: Result[];
  onZoom: (r: Result) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="mt-8 -mx-5 w-[calc(100%+2.5rem)]">
      <div className="mb-4 flex items-center justify-between px-5">
        <h2 className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Proof of work
        </h2>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-lime/80 sm:inline">
            Scroll →
          </span>
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Scroll left"
            className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-card/80 text-muted-foreground backdrop-blur transition-all hover:border-lime/60 hover:text-lime"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Scroll right"
            className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-card/80 text-muted-foreground backdrop-blur transition-all hover:border-lime/60 hover:text-lime"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {results.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => onZoom(r)}
            className="group relative w-[68%] shrink-0 snap-start overflow-hidden rounded-2xl border border-hairline bg-card/80 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:border-lime/60 hover:shadow-lime focus:outline-none focus-visible:border-lime focus-visible:shadow-lime sm:w-[55%]"
            aria-label={`View larger: ${r.alt}`}
          >
            <div className="aspect-[4/3] overflow-hidden bg-background">
              {r.type === "video" ? (
                <video
                  src={r.src}
                  poster={r.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <img
                  src={r.src}
                  alt={r.alt}
                  loading="lazy"
                  className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                    r.fit === "contain" ? "object-contain p-2" : "object-cover"
                  }`}
                />
              )}
            </div>
            <div className="flex items-baseline justify-between gap-2 px-3 py-2.5">
              <span className="font-display text-lg leading-none text-foreground">
                {r.stat}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {r.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
