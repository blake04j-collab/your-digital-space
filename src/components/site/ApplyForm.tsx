import { useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStoredRef } from "@/lib/tracking";

const schema = z.object({
  fname: z.string().trim().min(1, "First name is required").max(100),
  lname: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  instagram: z.string().trim().max(100).optional().or(z.literal("")),
  tiktok: z.string().trim().max(100).optional().or(z.literal("")),
  x_handle: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const initial: FormValues = {
  fname: "",
  lname: "",
  email: "",
  phone: "",
  instagram: "",
  tiktok: "",
  x_handle: "",
  notes: "",
};

const labelCls =
  "mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground";

const optionalCls =
  "rounded-full border border-hairline px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70";

function inputBase(error?: string) {
  return [
    "w-full rounded-xl border bg-background/60 px-4 py-3.5 text-base text-foreground outline-none transition-all",
    "placeholder:text-muted-foreground/40",
    error
      ? "border-destructive/60 focus:border-destructive"
      : "border-hairline focus:border-lime focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--lime)_18%,transparent)]",
  ].join(" ");
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
      <span aria-hidden>⚠</span>
      {msg}
    </p>
  );
}

function SocialInput({
  name,
  value,
  onChange,
  error,
  placeholder,
}: {
  name: keyof FormValues;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground/60">
        @
      </span>
      <input
        name={name}
        value={value.replace(/^@+/, "")}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase(error)} pl-9`}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

export function ApplyForm() {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const required: (keyof FormValues)[] = ["fname", "lname", "email"];
  const completion = useMemo(() => {
    const filled = required.filter((k) => values[k]?.trim()).length;
    return Math.round((filled / required.length) * 100);
  }, [values]);

  function set<K extends keyof FormValues>(key: K, v: string) {
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
    const ref_code = getStoredRef();
    const d = parsed.data;
    const { error } = await supabase.from("applications").insert({
      fname: d.fname,
      lname: d.lname,
      email: d.email,
      phone: d.phone || null,
      instagram: d.instagram || null,
      tiktok: d.tiktok || null,
      x_handle: d.x_handle || null,
      notes: d.notes || null,
      plan: "partner",
      status: "new",
      ref_code,
    });
    setSubmitting(false);
    if (error) {
      setServerErr("Submission failed. Please try again in a moment.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-lime/40 bg-lime-soft p-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--lime)_25%,transparent),transparent_60%)]" />
        <div className="relative">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-lime text-3xl text-primary-foreground shadow-lime">
            ✓
          </div>
          <h3 className="font-display text-3xl text-lime">You're in.</h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            The Cloud Agency team will review your application and reach out within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  const notesLen = values.notes?.length ?? 0;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Creator Application
          </p>
          <p className="mt-1 font-display text-xl text-foreground">Let's get to know you</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {completion}% complete
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full bg-lime transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section 1 — Contact */}
      <section className="space-y-5">
        <header className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline text-[11px] font-semibold text-muted-foreground">
            1
          </span>
          <h4 className="text-sm font-medium tracking-wide text-foreground">Contact details</h4>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>First Name</label>
            <input
              name="fname"
              value={values.fname}
              onChange={(e) => set("fname", e.target.value)}
              required
              className={inputBase(errors.fname)}
              placeholder="Jane"
              autoComplete="given-name"
            />
            <FieldError msg={errors.fname} />
          </div>
          <div>
            <label className={labelCls}>Last Name</label>
            <input
              name="lname"
              value={values.lname}
              onChange={(e) => set("lname", e.target.value)}
              required
              className={inputBase(errors.lname)}
              placeholder="Doe"
              autoComplete="family-name"
            />
            <FieldError msg={errors.lname} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              required
              className={inputBase(errors.email)}
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
            />
            <FieldError msg={errors.email} />
          </div>
          <div>
            <label className={labelCls}>
              Phone Number <span className={optionalCls}>Optional</span>
            </label>
            <input
              name="phone"
              type="tel"
              value={values.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className={inputBase(errors.phone)}
              placeholder="+1 555 555 5555"
              autoComplete="tel"
              inputMode="tel"
            />
            <FieldError msg={errors.phone} />
          </div>
        </div>
      </section>

      {/* Section 2 — Social */}
      <section className="space-y-5">
        <header className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline text-[11px] font-semibold text-muted-foreground">
            2
          </span>
          <h4 className="text-sm font-medium tracking-wide text-foreground">
            Social presence <span className="text-muted-foreground/60">(optional)</span>
          </h4>
        </header>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Instagram</label>
            <SocialInput
              name="instagram"
              value={values.instagram ?? ""}
              onChange={(v) => set("instagram", v)}
              error={errors.instagram}
              placeholder="handle"
            />
            <FieldError msg={errors.instagram} />
          </div>
          <div>
            <label className={labelCls}>TikTok</label>
            <SocialInput
              name="tiktok"
              value={values.tiktok ?? ""}
              onChange={(v) => set("tiktok", v)}
              error={errors.tiktok}
              placeholder="handle"
            />
            <FieldError msg={errors.tiktok} />
          </div>
          <div>
            <label className={labelCls}>X / Twitter</label>
            <SocialInput
              name="x_handle"
              value={values.x_handle ?? ""}
              onChange={(v) => set("x_handle", v)}
              error={errors.x_handle}
              placeholder="handle"
            />
            <FieldError msg={errors.x_handle} />
          </div>
        </div>
      </section>

      {/* Section 3 — Notes */}
      <section className="space-y-5">
        <header className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline text-[11px] font-semibold text-muted-foreground">
            3
          </span>
          <h4 className="text-sm font-medium tracking-wide text-foreground">
            Tell us more <span className="text-muted-foreground/60">(optional)</span>
          </h4>
        </header>

        <div>
          <label className={labelCls}>
            <span>Additional Notes</span>
            <span className="normal-case tracking-normal text-muted-foreground/60">
              {notesLen.toLocaleString()} / 5,000
            </span>
          </label>
          <textarea
            name="notes"
            value={values.notes ?? ""}
            onChange={(e) => set("notes", e.target.value.slice(0, 5000))}
            rows={6}
            className={`${inputBase(errors.notes)} min-h-[160px] resize-y leading-relaxed`}
            placeholder="Content style, current monthly revenue, audience size, goals, availability — anything that helps us understand the opportunity."
          />
          <FieldError msg={errors.notes} />
        </div>
      </section>

      {serverErr && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverErr}
        </p>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="group relative w-full overflow-hidden rounded-full bg-lime py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lime transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Submitting your application…
              </>
            ) : (
              <>
                Submit Application
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </span>
        </button>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground">
          <span>Free to apply</span>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span>Response within 24 hours</span>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span>Your information stays private</span>
        </p>
      </div>
    </form>
  );
}
