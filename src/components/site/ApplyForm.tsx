import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStoredRef } from "@/lib/tracking";

const schema = z.object({
  fname: z.string().trim().min(1, "First name required").max(100),
  lname: z.string().trim().min(1, "Last name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(100).optional(),
  tiktok: z.string().trim().max(100).optional(),
  x_handle: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(5000).optional(),
});

const inputCls =
  "w-full rounded-xl border border-hairline bg-background/60 px-4 py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-lime";

const labelCls =
  "mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground";

const optionalCls = "normal-case tracking-normal text-muted-foreground/60";

export function ApplyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      fname: String(fd.get("fname") ?? ""),
      lname: String(fd.get("lname") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      onlyfans: String(fd.get("onlyfans") ?? ""),
      instagram: String(fd.get("instagram") ?? ""),
      tiktok: String(fd.get("tiktok") ?? ""),
      x_handle: String(fd.get("x_handle") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check your inputs.");
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
      onlyfans: d.onlyfans || null,
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
      setErr("Submission failed. Try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-lime/40 bg-lime-soft p-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-lime text-3xl text-primary-foreground">
          ✓
        </div>
        <h3 className="font-display text-3xl text-lime">You're in.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          The Cloud Agency team will reach out within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>First Name</label>
          <input name="fname" required className={inputCls} placeholder="Jane" autoComplete="given-name" />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input name="lname" required className={inputCls} placeholder="Doe" autoComplete="family-name" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Email Address</label>
        <input
          name="email"
          type="email"
          required
          className={inputCls}
          placeholder="you@email.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label className={labelCls}>
          Phone Number <span className={optionalCls}>(optional)</span>
        </label>
        <input
          name="phone"
          type="tel"
          className={inputCls}
          placeholder="+1 555 555 5555"
          autoComplete="tel"
        />
      </div>

      <div>
        <label className={labelCls}>
          OnlyFans Link <span className={optionalCls}>(optional)</span>
        </label>
        <input
          name="onlyfans"
          type="url"
          className={inputCls}
          placeholder="https://onlyfans.com/yourhandle"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelCls}>
            Instagram <span className={optionalCls}>(opt.)</span>
          </label>
          <input name="instagram" className={inputCls} placeholder="@handle" />
        </div>
        <div>
          <label className={labelCls}>
            TikTok <span className={optionalCls}>(opt.)</span>
          </label>
          <input name="tiktok" className={inputCls} placeholder="@handle" />
        </div>
        <div>
          <label className={labelCls}>
            X / Twitter <span className={optionalCls}>(opt.)</span>
          </label>
          <input name="x_handle" className={inputCls} placeholder="@handle" />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Additional Notes <span className={optionalCls}>(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={5}
          className={`${inputCls} resize-y min-h-[140px]`}
          placeholder="Anything else we should know — content style, current revenue, goals, availability, etc."
        />
      </div>

      {err && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-lime py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lime transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Apply Now →"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Free to apply · Response within 24 hours
      </p>
    </form>
  );
}
