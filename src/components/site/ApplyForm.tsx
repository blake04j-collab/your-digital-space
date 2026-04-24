import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStoredRef } from "@/lib/tracking";

const schema = z.object({
  fname: z.string().trim().min(1, "First name required").max(100),
  lname: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional(),
  tiktok: z.string().trim().max(80).optional(),
  instagram: z.string().trim().max(80).optional(),
  tiktok_followers: z.number().int().min(0).max(100_000_000).optional(),
  ig_followers: z.number().int().min(0).max(100_000_000).optional(),
  niche: z.string().max(80).optional(),
  bio: z.string().trim().max(2000).optional(),
  plan: z.enum(["free", "partner"]),
});

type Plan = "free" | "partner";

const inputCls =
  "w-full rounded-lg border border-hairline bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-lime";

const labelCls = "mb-1.5 block text-xs font-light text-muted-foreground";

export function ApplyForm() {
  const [plan, setPlan] = useState<Plan>("partner");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      fname: String(fd.get("fname") ?? ""),
      lname: String(fd.get("lname") ?? "") || undefined,
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      tiktok: String(fd.get("tiktok") ?? "").replace("@", "") || undefined,
      instagram: String(fd.get("instagram") ?? "").replace("@", "") || undefined,
      tiktok_followers: Number(fd.get("tiktok_followers") || 0),
      ig_followers: Number(fd.get("ig_followers") || 0),
      niche: String(fd.get("niche") ?? "") || undefined,
      bio: String(fd.get("bio") ?? "") || undefined,
      plan,
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    setSubmitting(true);
    const ref_code = getStoredRef();
    const { error } = await supabase
      .from("applications")
      .insert({ ...parsed.data, ref_code });
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
          {plan === "partner"
            ? "You're on the Partner track. Expect a call within 24 hours to lock in your brand connection."
            : "You've been added to the creator pool. We'll reach out soon with more information to get you connected."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Your info */}
      <div className="rounded-2xl border border-hairline bg-surface-1 p-6">
        <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Your info
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>First name *</label>
            <input name="fname" required className={inputCls} placeholder="Jordan" />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input name="lname" className={inputCls} placeholder="Smith" />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input name="email" type="email" required className={inputCls} placeholder="you@email.com" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input name="phone" type="tel" className={inputCls} placeholder="+1 (604) 000-0000" />
          </div>
        </div>
      </div>

      {/* Socials */}
      <div className="rounded-2xl border border-hairline bg-surface-1 p-6">
        <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Your socials
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>TikTok username</label>
            <input name="tiktok" className={inputCls} placeholder="@yourhandle" />
          </div>
          <div>
            <label className={labelCls}>Instagram username</label>
            <input name="instagram" className={inputCls} placeholder="@yourhandle" />
          </div>
          <div>
            <label className={labelCls}>TikTok followers</label>
            <input name="tiktok_followers" type="number" min={0} className={inputCls} placeholder="25000" />
          </div>
          <div>
            <label className={labelCls}>Instagram followers</label>
            <input name="ig_followers" type="number" min={0} className={inputCls} placeholder="12000" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Primary niche</label>
            <select name="niche" className={inputCls} defaultValue="">
              <option value="" disabled>Select your niche...</option>
              <option>Gym / Fitness</option>
              <option>Looksmaxxing</option>
              <option>Lifestyle</option>
              <option>Nutrition / Supplements</option>
              <option>Fashion / Style</option>
              <option>Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Brief description of your content</label>
            <textarea
              name="bio"
              rows={3}
              className={inputCls + " resize-y"}
              placeholder="What do you post about? What's your style?"
            />
          </div>
        </div>
      </div>

      {/* Plan select */}
      <div className="px-1 pt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/60">
        Choose your path
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setPlan("free")}
          className={`rounded-2xl border p-5 text-left transition-all ${
            plan === "free"
              ? "border-muted-foreground bg-surface-2 opacity-100"
              : "border-hairline bg-surface-1 opacity-70"
          }`}
        >
          <div className="mb-2 inline-block rounded-full border border-hairline bg-surface-2 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Basic
          </div>
          <div className="font-display text-2xl tracking-wider text-muted-foreground">Free</div>
          <p className="mt-1 text-xs text-muted-foreground/70">No upfront cost · No guarantees</p>
        </button>
        <button
          type="button"
          onClick={() => setPlan("partner")}
          className={`relative rounded-2xl border p-5 text-left transition-all ${
            plan === "partner"
              ? "border-lime bg-lime-soft shadow-lime"
              : "border-lime/40 bg-lime-soft/40"
          }`}
        >
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-0.5 font-display text-[9px] tracking-[0.25em] text-primary-foreground">
            Recommended
          </div>
          <div className="mb-2 inline-block rounded-full bg-lime px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
            Premium
          </div>
          <div className="font-display text-2xl tracking-wider text-lime">Partner</div>
          <p className="mt-1 text-xs text-muted-foreground">Direct brand intro guaranteed</p>
        </button>
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
        {submitting ? "Submitting…" : "Submit Application ›"}
      </button>
    </form>
  );
}
