import { ApplyForm } from "./ApplyForm";

export function Apply() {
  return (
    <section id="apply" className="relative overflow-hidden border-b border-hairline">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, oklch(0.68 0.31 340 / 0.22), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mb-4">Request access</div>
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
            Turn attention into <em className="not-italic text-lime drop-shadow-[0_0_18px_oklch(0.68_0.31_340_/_0.55)]">recurring revenue.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm font-light text-muted-foreground">
            Private intake. We review every application personally and respond within 24 hours. Limited partnerships open at any time.
          </p>
        </div>
        <ApplyForm />
      </div>
    </section>
  );
}
