import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { trackPageView } from "@/lib/tracking";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Become a Social Media Virtual Assistant · Cloud Agency" },
      {
        name: "description",
        content:
          "Apply to join Cloud Agency as a remote social media virtual assistant. Flexible hours, ~2–3 hours/day, work from anywhere.",
      },
      { property: "og:title", content: "Virtual Assistant Careers · Cloud Agency" },
      {
        property: "og:description",
        content:
          "Remote virtual assistant roles supporting creator outreach and community engagement. Apply in minutes.",
      },
    ],
  }),
  component: CareersPage,
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Required").max(120),
  country: z.string().trim().min(1, "Required").max(80),
  discord_username: z.string().trim().min(1, "Required").max(80),
  availability: z.string().min(1, "Select your availability"),
  reddit_account_available: z.enum(["yes", "no"], { required_error: "Required" }),
  reddit_username: z.string().trim().max(80).optional().or(z.literal("")),
  washington_community_answer: z.string().trim().max(2000),
  caption_examples: z.string().trim().max(2000),
  reason_for_fit: z.string().trim().min(5, "Required").max(2000),
});

type FormValues = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const initial: FormValues = {
  full_name: "",
  country: "",
  discord_username: "",
  availability: "",
  reddit_account_available: "no",
  reddit_username: "",
  washington_community_answer: "",
  caption_examples: "",
  reason_for_fit: "",
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

function CareersPage() {
  useEffect(() => {
    trackPageView("/careers");
  }, []);

  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  function set<K extends keyof FormValues>(key: K, v: FormValues[K]) {
    setValues((p) => ({ ...p, [key]: v }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function scrollToForm() {
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const { error } = await supabase.from("va_applications").insert({
      full_name: d.full_name,
      country: d.country,
      discord_username: d.discord_username,
      availability: d.availability,
      reddit_account_available: d.reddit_account_available === "yes",
      reddit_username: d.reddit_username || null,
      washington_community_answer: d.washington_community_answer,
      caption_examples: d.caption_examples,
      reason_for_fit: d.reason_for_fit,
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

  return (
    <div className="relative min-h-screen text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,color-mix(in_oklab,var(--lime)_20%,transparent),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 md:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Now Hiring · Remote
          </div>
          <h1 className="font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-wide text-foreground">
            Become a Social Media<br />
            <span className="text-lime">Virtual Assistant</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">
            We're hiring remote virtual assistants to help with social media engagement and
            community outreach for online creators. Flexible schedule, approximately 2–3 hours
            per day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={scrollToForm}
              className="group rounded-full bg-lime px-7 py-3.5 font-semibold text-primary-foreground shadow-lime transition-transform hover:scale-[1.03]"
            >
              Apply Now <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#role"
              className="rounded-full border border-hairline px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-1"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Role overview */}
      <section id="role" className="border-b border-hairline">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-2 md:py-20">
          <div className="rounded-3xl border border-hairline bg-surface-1 p-7">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              The Role
            </div>
            <h2 className="mt-3 font-display text-3xl text-foreground">What You'll Do</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {[
                "Assist with social media engagement tasks",
                "Research relevant online communities",
                "Create engaging post ideas and captions",
                "Support outreach campaigns across platforms",
                "Track and report activity",
                "Work remotely with flexible hours",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-lime/15 text-[10px] text-lime">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-hairline bg-surface-1 p-7">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              You Bring
            </div>
            <h2 className="mt-3 font-display text-3xl text-foreground">Requirements</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {[
                "Strong written English",
                "Reliable internet connection",
                "Ability to work independently",
                "Familiarity with online communities (Reddit preferred)",
                "Discord account required",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-lime/15 text-[10px] text-lime">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="relative">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
          {done ? (
            <div className="relative overflow-hidden rounded-3xl border border-lime/40 bg-lime-soft p-10 text-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--lime)_25%,transparent),transparent_60%)]" />
              <div className="relative">
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-lime text-3xl text-primary-foreground shadow-lime">
                  ✓
                </div>
                <h3 className="font-display text-3xl text-lime">Thank you for applying.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Our team will review your application and reach out if you are selected.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Application
                </p>
                <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
                  Apply for the role
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                  Fill out the form below. We review every application individually.
                </p>
              </div>

              <form onSubmit={onSubmit} noValidate className="space-y-6">
                {/* Basic info */}
                <SectionCard index={1} title="Basic Information">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input
                      name="full_name"
                      value={values.full_name}
                      onChange={(e) => set("full_name", e.target.value)}
                      className={inputCls(errors.full_name)}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                    <FieldError msg={errors.full_name} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
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
                  </div>
                </SectionCard>

                {/* Availability */}
                <SectionCard index={2} title="Availability">
                  <div>
                    <label className={labelCls}>
                      How many days per week can you work?
                      <span className="normal-case tracking-normal text-muted-foreground/60">
                        &nbsp;· 2–3 hrs/day, flexible
                      </span>
                    </label>
                    <select
                      name="availability"
                      value={values.availability}
                      onChange={(e) => set("availability", e.target.value)}
                      className={inputCls(errors.availability)}
                    >
                      <option value="">Select…</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={`${n} day${n > 1 ? "s" : ""}`}>
                          {n} Day{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    <FieldError msg={errors.availability} />
                  </div>
                </SectionCard>

                {/* Reddit account */}
                <SectionCard index={3} title="Account Availability">
                  <div>
                    <p className="mb-4 text-sm leading-relaxed text-foreground/90">
                      Do you have an aged Reddit account with little to no karma that you can use for this role?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["yes", "no"] as const).map((opt) => {
                        const active = values.reddit_account_available === opt;
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
                              name="reddit_account_available"
                              value={opt}
                              checked={active}
                              onChange={() => set("reddit_account_available", opt)}
                              className="sr-only"
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                    <FieldError msg={errors.reddit_account_available} />
                  </div>
                  {values.reddit_account_available === "yes" && (
                    <div className="border-t border-hairline pt-5">
                      <label className={labelCls}>
                        Reddit Username
                        <span className="normal-case tracking-normal text-muted-foreground/60">
                          (optional)
                        </span>
                      </label>
                      <input
                        name="reddit_username"
                        value={values.reddit_username ?? ""}
                        onChange={(e) => set("reddit_username", e.target.value)}
                        className={inputCls(errors.reddit_username)}
                        placeholder="u/username"
                      />
                      <FieldError msg={errors.reddit_username} />
                    </div>
                  )}
                </SectionCard>

                {/* Community task */}
                <SectionCard index={4} title="Community Knowledge Task">
                  <div>
                    <p className="mb-3 text-sm leading-relaxed text-foreground/90">
                      Given the location{" "}
                      <span className="text-lime">Washington State, USA</span>, list 3 online
                      communities (subreddits) you would engage with.
                    </p>
                    <textarea
                      name="washington_community_answer"
                      value={values.washington_community_answer}
                      onChange={(e) =>
                        set("washington_community_answer", e.target.value.slice(0, 2000))
                      }
                      rows={5}
                      className={`${inputCls(errors.washington_community_answer)} min-h-[140px] resize-y leading-relaxed`}
                      placeholder=""
                    />
                    <FieldError msg={errors.washington_community_answer} />
                  </div>
                </SectionCard>

                {/* Caption examples */}
                <SectionCard index={5} title="Content Creation Task">
                  <div>
                    <p className="mb-3 text-sm leading-relaxed text-foreground/90">
                      Share two example post captions you would write to encourage engagement.
                    </p>
                    <textarea
                      name="caption_examples"
                      value={values.caption_examples}
                      onChange={(e) => set("caption_examples", e.target.value.slice(0, 2000))}
                      rows={5}
                      className={`${inputCls(errors.caption_examples)} min-h-[140px] resize-y leading-relaxed`}
                      placeholder=""
                    />
                    <FieldError msg={errors.caption_examples} />
                  </div>
                </SectionCard>

                {/* Fit */}
                <SectionCard index={6} title="Why You're a Fit">
                  <div>
                    <p className="mb-3 text-sm leading-relaxed text-foreground/90">
                      Why do you think you're a good fit for this role?
                    </p>
                    <textarea
                      name="reason_for_fit"
                      value={values.reason_for_fit}
                      onChange={(e) => set("reason_for_fit", e.target.value.slice(0, 2000))}
                      rows={5}
                      className={`${inputCls(errors.reason_for_fit)} min-h-[140px] resize-y leading-relaxed`}
                      placeholder="Tell us about your experience, work style, and what motivates you."
                    />
                    <FieldError msg={errors.reason_for_fit} />
                  </div>
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
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

