import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  telegram_username: z
    .string()
    .trim()
    .min(1, { message: "Telegram username is required — this is how we will contact you." })
    .max(80),
  discord_username: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  twitter_account_available: z.enum(["yes", "no"]).optional(),
  twitter_username: z.string().trim().max(80).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const initial: FormValues = {
  telegram_username: "",
  discord_username: "",
  country: "",
  twitter_account_available: "no",
  twitter_username: "",
};

const labelCls =
  "mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

const inputCls = (err?: string) =>
  [
    "w-full rounded-xl border bg-background/60 px-4 py-3.5 text-base text-foreground outline-none transition-all",
    "placeholder:text-muted-foreground/40",
    err
      ? "border-destructive/60 focus:border-destructive"
      : "border-hairline focus:border-lime focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--lime)_18%,transparent)]",
  ].join(" ");

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
      <span aria-hidden>⚠</span>
      {msg}
    </p>
  );
}

function SectionCard({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 rounded-2xl border border-hairline bg-surface-1 p-6 sm:p-8">
      <header className="flex items-center gap-4">
        <span className="font-display text-sm font-bold uppercase tracking-[0.25em] text-lime">
          {String(index).padStart(2, "0")}
        </span>
        <h3 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground sm:text-xl">
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}

export function TwitterApplyForm() {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  function set<K extends keyof FormValues>(key: K, v: FormValues[K]) {
    setValues((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerErr(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormValues;
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      const firstKey = Object.keys(next)[0];
      if (firstKey) {
        const el = document.querySelector<HTMLElement>(`[name="${firstKey}"]`);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitting(true);
    const d = parsed.data;
    const { error } = await (supabase as any).from("twitter_va_applications").insert({
      telegram_username: d.telegram_username,
      discord_username: d.discord_username || "",
      country: d.country || "",
      twitter_account_available: d.twitter_account_available === "yes",
      twitter_username: d.twitter_username || null,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      setServerErr("Submission failed. Please try again in a moment.");
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-lime/40 bg-lime-soft p-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--lime)_25%,transparent),transparent_60%)]" />
        <div className="relative">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-lime text-3xl text-primary-foreground shadow-lime">
            ✓
          </div>
          <h3 className="font-display text-3xl text-lime">Thank you for applying.</h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Our team will review your application and reach out to you on Telegram if you are
            selected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <SectionCard index={1} title="Telegram Contact">
        <div>
          <label className={labelCls}>
            Telegram Username
            <span className="ml-1.5 normal-case tracking-normal text-lime">*required</span>
          </label>
          <p className="mb-3 text-sm leading-relaxed text-foreground/90">
            This is how we will contact you if you are selected. Please make sure your username
            is correct.
          </p>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <input
              name="telegram_username"
              value={values.telegram_username}
              onChange={(e) => set("telegram_username", e.target.value)}
              className={`${inputCls(errors.telegram_username)} pl-9`}
              placeholder="your_username"
              autoComplete="off"
            />
          </div>
          <FieldError msg={errors.telegram_username} />
        </div>
      </SectionCard>

      <SectionCard index={2} title="Basic Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Discord Username</label>
            <input
              name="discord_username"
              value={values.discord_username}
              onChange={(e) => set("discord_username", e.target.value)}
              className={inputCls(errors.discord_username)}
              placeholder="username"
            />
            <FieldError msg={errors.discord_username} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              name="country"
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
              className={inputCls(errors.country)}
              placeholder="United States"
              autoComplete="country-name"
            />
            <FieldError msg={errors.country} />
          </div>
        </div>
      </SectionCard>

      <SectionCard index={3} title="Twitter / X Account">
        <div>
          <p className="mb-4 text-sm leading-relaxed text-foreground/90">
            Do you have a Twitter / X account you can use for this role? It doesn't matter if the
            account already has posts or not.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["yes", "no"] as const).map((opt) => {
              const active = values.twitter_account_available === opt;
              return (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3.5 text-sm font-medium capitalize transition-all ${
                    active
                      ? "border-lime bg-lime text-primary-foreground shadow-lime"
                      : "border-hairline bg-background/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="twitter_account_available"
                    value={opt}
                    checked={active}
                    onChange={() => set("twitter_account_available", opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
          <FieldError msg={errors.twitter_account_available} />
        </div>
        {values.twitter_account_available === "yes" && (
          <div className="border-t border-hairline pt-5">
            <label className={labelCls}>Twitter / X Username</label>
            <p className="mb-3 text-sm leading-relaxed text-foreground/90">
              Please type the username of the Twitter / X account you would use.
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <input
                name="twitter_username"
                value={values.twitter_username ?? ""}
                onChange={(e) => set("twitter_username", e.target.value)}
                className={`${inputCls(errors.twitter_username)} pl-9`}
                placeholder="username"
              />
            </div>
            <FieldError msg={errors.twitter_username} />
          </div>
        )}
      </SectionCard>

      {serverErr && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverErr}
        </p>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-lime py-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-lime transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Submitting…
            </>
          ) : (
            <>
              Submit Application
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Your information stays private. We respond to selected applicants only.
        </p>
      </div>
    </form>
  );
}
