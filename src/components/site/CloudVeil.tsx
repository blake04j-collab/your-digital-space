export function CloudVeil({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative -my-4 h-32 w-full overflow-hidden md:h-48 ${className}`}
    >
      <div
        className="absolute -left-1/4 top-1/2 h-[140%] w-[80%] -translate-y-1/2 rounded-[50%] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(1 0 0 / 0.08), oklch(0.78 0.22 320 / 0.06) 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-1/4 top-1/2 h-[140%] w-[80%] -translate-y-1/2 rounded-[50%] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.68 0.31 340 / 0.10), oklch(1 0 0 / 0.04) 55%, transparent 70%)",
        }}
      />
    </div>
  );
}
