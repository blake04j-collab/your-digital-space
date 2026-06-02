import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStoredRef } from "@/lib/tracking";

const schema = z.object({
  fname: z.string().trim().min(1, "First name required").max(100),
  lname: z.string().trim().min(1, "Last name required").max(100),
  phone: z.string().trim().min(5, "Valid phone required").max(40),
  social: z.string().trim().max(255).optional(),
});

const inputCls =
  "w-full rounded-xl border border-hairline bg-background/60 px-4 py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-lime";

const labelCls = "mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground";

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
      phone: String(fd.get("phone") ?? ""),
      social: String(fd.get("social") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    setSubmitting(true);
    const ref_code = getStoredRef();
    const digits = parsed.data.phone.replace(/\D/g, "") || "noemail";
    const { error } = await supabase.from("applications").insert({
      fname: parsed.data.fname,
      lname: parsed.data.lname,
      phone: parsed.data.phone,
      email: `${digits}@phone.b1scale.local`,
      bio: parsed.data.social || null,
      plan: "partner",
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
          The B1 Team will reach out within 24 hours.
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
        <label className={labelCls}>Phone Number</label>
        <input
          name="phone"
          type="tel"
          required
          className={inputCls}
          placeholder="+1 555 555 5555"
          autoComplete="tel"
        />
      </div>
      <div>
        <label className={labelCls}>
          Social Handle <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span>
        </label>
        <input name="social" className={inputCls} placeholder="@yourhandle" />
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
