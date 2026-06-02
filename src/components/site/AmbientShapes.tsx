export function AmbientShapes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="animate-float-glow absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.68 0.31 340 / 0.12), transparent 70%)",
        }}
      />
      <div
        className="animate-float-glow absolute top-1/3 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.78 0.22 320 / 0.10), transparent 70%)",
          animationDelay: "-3s",
        }}
      />
      <div
        className="animate-float-glow absolute bottom-0 right-1/4 h-[560px] w-[560px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(1 0 0 / 0.05), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
    </div>
  );
}
