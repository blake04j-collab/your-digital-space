import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStoredRef } from "@/lib/tracking";

const schema = z.object({
  fname: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  social: z.string().trim().min(1, "Social handle or website required").max(255),
});

const inputCls =
  "w-full rounded-xl border border-hairline bg-background px-4 py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-lime";

const labelCls = "mb-2 block text-xs font-light uppercase tracking-[0.2em] text-muted-foreground";

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
      email: String(fd.get("email") ?? ""),
      social: String(fd.get("social") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    setSubmitting(true);
    const ref_code = getStoredRef();
    const { error } = await supabase.from("applications").insert({
      fname: parsed.data.fname,
      email: parsed.data.email,
      bio: parsed.data.social,
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
      <div className="rounded-3xl border border-lime/40 bg-lime-soft p-12 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-lime text-3xl text-primary-foreground">
          ✓
        </div>
        <h3 className="font-display text-4xl text-lime">Application received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
          Expect a private response within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className={labelCls}>Name</label>
        <input name="fname" required className={inputCls} placeholder="Your name" autoComplete="name" />
      </div>
      <div>
        <label className={labelCls}>Email</label>
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
        <label className={labelCls}>Social handle or website</label>
        <input
          name="social"
          required
          className={inputCls}
          placeholder="@yourhandle or yoursite.com"
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
        className="w-full rounded-xl bg-lime py-4 font-display text-xl tracking-[0.2em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Request Access ›"}
      </button>
      <p className="text-center text-xs font-light text-muted-foreground">
        Private intake. Response within 24 hours.
      </p>
    </form>
  );
}
