import { ApplyForm } from "./ApplyForm";

export function Apply() {
  return (
    <section id="apply" className="border-b border-hairline">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="eyebrow mb-4">Apply</div>
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
            Ready to <em className="not-italic text-lime">stop waiting?</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm font-light text-muted-foreground">
            Fill out the form. We'll review your profile and reach out within 24 hours. Limited priority spots.
          </p>
        </div>
        <ApplyForm />
      </div>
    </section>
  );
}
