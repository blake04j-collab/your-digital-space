export function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="font-display text-[clamp(3.5rem,12vw,8rem)] leading-none tracking-wider text-lime">
            i ♡ scaling
          </div>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <a href="https://www.instagram.com/b1btc" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">
              Instagram
            </a>
            <span className="text-hairline">·</span>
            <a href="https://x.com/b1btc" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">
              X
            </a>
            <span className="text-hairline">·</span>
            <a href="https://linktr.ee/b1btc" target="_blank" rel="noreferrer" className="hover:text-lime transition-colors">
              TikTok
            </a>
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60">
            © {new Date().getFullYear()} B1BTC · Built for creators who scale
          </p>
        </div>
      </div>
    </footer>
  );
}
