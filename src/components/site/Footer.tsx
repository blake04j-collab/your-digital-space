export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-center text-xs text-muted-foreground md:flex-row md:text-left">
        <p>© {new Date().getFullYear()} Cloud Agency — Built for creators.</p>
        <div className="flex items-center gap-5">
          {[
            { label: "Instagram", href: "https://www.instagram.com/cloudagncy" },
            { label: "X", href: "https://x.com/cloudagncy" },
            { label: "TikTok", href: "https://tiktok.com/@cloudagncy" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-lime"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
