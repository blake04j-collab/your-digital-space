type Variant = "pink" | "blue" | "neutral";

const tint: Record<Variant, string> = {
  pink: "oklch(0.68 0.31 340 / 0.10)",
  blue: "oklch(0.78 0.22 320 / 0.08)",
  neutral: "oklch(1 0 0 / 0.05)",
};

export function FlowDivider({
  variant = "pink",
  flip = false,
  className = "",
}: {
  variant?: Variant;
  flip?: boolean;
  className?: string;
}) {
  const color = tint[variant];
  const stops = flip
    ? `linear-gradient(to top, transparent 0%, ${color} 50%, transparent 100%)`
    : `linear-gradient(to bottom, transparent 0%, ${color} 50%, transparent 100%)`;
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative h-24 w-full md:h-40 ${className}`}
      style={{ background: stops }}
    />
  );
}
