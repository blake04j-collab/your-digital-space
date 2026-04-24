import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard · B1" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Application = {
  id: string;
  fname: string;
  lname: string | null;
  email: string;
  phone: string | null;
  tiktok: string | null;
  instagram: string | null;
  tiktok_followers: number | null;
  ig_followers: number | null;
  niche: string | null;
  bio: string | null;
  plan: string;
  ref_code: string | null;
  created_at: string;
};

type TrackingLink = {
  id: string;
  code: string;
  label: string;
  destination: string | null;
  archived: boolean;
  created_at: string;
};

type LinkClick = {
  id: string;
  code: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  created_at: string;
};

type Tab = "applications" | "links";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<Tab>("applications");

  const [apps, setApps] = useState<Application[]>([]);
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [clicks, setClicks] = useState<LinkClick[]>([]);

  const [filter, setFilter] = useState<"all" | "partner" | "free">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sessionData.session.user.id);
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (!isAdmin) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      const [appsRes, linksRes, clicksRes] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("tracking_links").select("*").order("created_at", { ascending: false }),
        supabase.from("link_clicks").select("*").order("created_at", { ascending: false }).limit(2000),
      ]);
      setApps((appsRes.data as Application[]) ?? []);
      setLinks((linksRes.data as TrackingLink[]) ?? []);
      setClicks((clicksRes.data as LinkClick[]) ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter !== "all" && a.plan !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          a.fname.toLowerCase().includes(q) ||
          (a.lname ?? "").toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.tiktok ?? "").toLowerCase().includes(q) ||
          (a.instagram ?? "").toLowerCase().includes(q) ||
          (a.niche ?? "").toLowerCase().includes(q) ||
          (a.ref_code ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [apps, filter, query]);

  const stats = useMemo(() => {
    const partner = apps.filter((a) => a.plan === "partner").length;
    const free = apps.filter((a) => a.plan === "free").length;
    const last7 = apps.filter(
      (a) => new Date(a.created_at).getTime() > Date.now() - 7 * 86400_000,
    ).length;
    return { total: apps.length, partner, free, last7 };
  }, [apps]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  async function deleteApp(id: string) {
    if (!confirm("Delete this application?")) return;
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (!error) {
      setApps((prev) => prev.filter((a) => a.id !== id));
      setSelected(null);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-3xl text-foreground">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">This account does not have admin access.</p>
          <button
            onClick={logout}
            className="mt-6 rounded-full bg-lime px-5 py-2 font-display text-sm tracking-wider text-primary-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-lime font-display text-xl text-primary-foreground shadow-lime">
              B1
            </span>
            <div>
              <div className="font-display text-base tracking-wider text-foreground">Admin</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {tab === "applications" ? "Applications" : "Tracking links"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden gap-1 rounded-full border border-hairline bg-surface-1 p-1 sm:flex">
              {(["applications", "links"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    tab === t ? "bg-lime text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-hairline px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
        {/* Mobile tab switcher */}
        <div className="flex gap-1 border-t border-hairline px-5 py-2 sm:hidden">
          {(["applications", "links"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                tab === t ? "bg-lime text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {tab === "applications" ? (
          <>
            {/* stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Total", value: stats.total },
                { label: "Partner", value: stats.partner, accent: true },
                { label: "Free", value: stats.free },
                { label: "Last 7 days", value: stats.last7 },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border p-5 ${
                    s.accent ? "border-lime/40 bg-lime-soft" : "border-hairline bg-surface-1"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
                  <div className={`mt-2 font-display text-4xl ${s.accent ? "text-lime" : "text-foreground"}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* filters */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, handle, niche, ref…"
                className="min-w-[260px] flex-1 rounded-lg border border-hairline bg-surface-1 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-lime"
              />
              <div className="flex gap-1.5 rounded-full border border-hairline bg-surface-1 p-1">
                {(["all", "partner", "free"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                      filter === f ? "bg-lime text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* list */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground">No applications yet.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="hidden px-5 py-3 md:table-cell">Email</th>
                      <th className="hidden px-5 py-3 lg:table-cell">Socials</th>
                      <th className="hidden px-5 py-3 md:table-cell">Source</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="hidden px-5 py-3 sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className="cursor-pointer border-b border-hairline/60 last:border-0 hover:bg-surface-2"
                      >
                        <td className="px-5 py-3.5 text-foreground">
                          {a.fname} {a.lname ?? ""}
                        </td>
                        <td className="hidden px-5 py-3.5 text-muted-foreground md:table-cell">{a.email}</td>
                        <td className="hidden px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">
                          {a.tiktok && <div>TT @{a.tiktok} · {(a.tiktok_followers ?? 0).toLocaleString()}</div>}
                          {a.instagram && <div>IG @{a.instagram} · {(a.ig_followers ?? 0).toLocaleString()}</div>}
                        </td>
                        <td className="hidden px-5 py-3.5 text-xs md:table-cell">
                          {a.ref_code ? (
                            <span className="rounded-full border border-lime/40 bg-lime-soft px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-lime">
                              {a.ref_code}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                              a.plan === "partner"
                                ? "bg-lime text-primary-foreground"
                                : "border border-hairline bg-surface-2 text-muted-foreground"
                            }`}
                          >
                            {a.plan}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3.5 text-xs text-muted-foreground sm:table-cell">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <LinksPanel
            links={links}
            setLinks={setLinks}
            clicks={clicks}
            apps={apps}
          />
        )}
      </main>

      {/* detail drawer */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 grid place-items-end bg-black/60 backdrop-blur-sm md:place-items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-hairline bg-background p-7 md:rounded-3xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Application</div>
                <h2 className="mt-1 font-display text-3xl text-foreground">
                  {selected.fname} {selected.lname ?? ""}
                </h2>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                    selected.plan === "partner"
                      ? "bg-lime text-primary-foreground"
                      : "border border-hairline bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {selected.plan}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <Field label="Email" value={selected.email} link={`mailto:${selected.email}`} />
              {selected.phone && <Field label="Phone" value={selected.phone} link={`tel:${selected.phone}`} />}
              {selected.tiktok && (
                <Field
                  label="TikTok"
                  value={`@${selected.tiktok} · ${(selected.tiktok_followers ?? 0).toLocaleString()} followers`}
                  link={`https://tiktok.com/@${selected.tiktok}`}
                />
              )}
              {selected.instagram && (
                <Field
                  label="Instagram"
                  value={`@${selected.instagram} · ${(selected.ig_followers ?? 0).toLocaleString()} followers`}
                  link={`https://instagram.com/${selected.instagram}`}
                />
              )}
              {selected.niche && <Field label="Niche" value={selected.niche} />}
              {selected.bio && <Field label="Content description" value={selected.bio} multiline />}
              <Field
                label="Source link"
                value={selected.ref_code ?? "Direct / unattributed"}
              />
              <Field label="Submitted" value={new Date(selected.created_at).toLocaleString()} />
            </div>

            <div className="mt-6 flex gap-2">
              <a
                href={`mailto:${selected.email}`}
                className="flex-1 rounded-xl bg-lime py-3 text-center font-display text-sm tracking-[0.2em] text-primary-foreground"
              >
                Reply ›
              </a>
              <button
                onClick={() => deleteApp(selected.id)}
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-destructive hover:bg-destructive/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LinksPanel({
  links,
  setLinks,
  clicks,
  apps,
}: {
  links: TrackingLink[];
  setLinks: React.Dispatch<React.SetStateAction<TrackingLink[]>>;
  clicks: LinkClick[];
  apps: Application[];
}) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const stats = useMemo(() => {
    const map = new Map<string, { clicks: number; signups: number; last_click: string | null }>();
    for (const c of clicks) {
      const cur = map.get(c.code) ?? { clicks: 0, signups: 0, last_click: null };
      cur.clicks += 1;
      if (!cur.last_click || c.created_at > cur.last_click) cur.last_click = c.created_at;
      map.set(c.code, cur);
    }
    for (const a of apps) {
      if (!a.ref_code) continue;
      const cur = map.get(a.ref_code) ?? { clicks: 0, signups: 0, last_click: null };
      cur.signups += 1;
      map.set(a.ref_code, cur);
    }
    return map;
  }, [clicks, apps]);

  const totals = useMemo(() => {
    const totalClicks = clicks.length;
    const attributedSignups = apps.filter((a) => a.ref_code).length;
    const conv = totalClicks > 0 ? (attributedSignups / totalClicks) * 100 : 0;
    return {
      totalClicks,
      attributedSignups,
      conv: conv.toFixed(1),
      activeLinks: links.filter((l) => !l.archived).length,
    };
  }, [clicks, apps, links]);

  const visibleLinks = useMemo(
    () => links.filter((l) => (showArchived ? true : !l.archived)),
    [links, showArchived],
  );

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!cleanCode) return setErr("Code is required.");
    if (!label.trim()) return setErr("Label is required.");
    setCreating(true);
    const { data, error } = await supabase
      .from("tracking_links")
      .insert({
        code: cleanCode,
        label: label.trim(),
        destination: destination.trim() || null,
      })
      .select()
      .single();
    setCreating(false);
    if (error) {
      setErr(error.message.includes("duplicate") ? "That code is already taken." : error.message);
      return;
    }
    setLinks((prev) => [data as TrackingLink, ...prev]);
    setCode("");
    setLabel("");
    setDestination("");
  }

  async function toggleArchive(link: TrackingLink) {
    const { error } = await supabase
      .from("tracking_links")
      .update({ archived: !link.archived })
      .eq("id", link.id);
    if (!error) {
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, archived: !link.archived } : l)),
      );
    }
  }

  async function deleteLink(link: TrackingLink) {
    if (!confirm(`Delete link "${link.code}"? Click history will be kept but the link will be removed.`)) return;
    const { error } = await supabase.from("tracking_links").delete().eq("id", link.id);
    if (!error) setLinks((prev) => prev.filter((l) => l.id !== link.id));
  }

  function buildUrl(code: string) {
    // Always use the live custom domain so copied links are clean and shareable,
    // regardless of which environment the admin is viewed from.
    return `https://b1scale.com/${encodeURIComponent(code)}`;
  }

  async function copyUrl(code: string) {
    try {
      await navigator.clipboard.writeText(buildUrl(code));
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* totals */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Active links", value: totals.activeLinks },
          { label: "Total clicks", value: totals.totalClicks },
          { label: "Attributed signups", value: totals.attributedSignups, accent: true },
          { label: "Conversion", value: `${totals.conv}%` },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-5 ${
              s.accent ? "border-lime/40 bg-lime-soft" : "border-hairline bg-surface-1"
            }`}
          >
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
            <div className={`mt-2 font-display text-4xl ${s.accent ? "text-lime" : "text-foreground"}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* create form */}
      <form
        onSubmit={createLink}
        className="mt-6 rounded-2xl border border-hairline bg-surface-1 p-5"
      >
        <div className="mb-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          New tracking link
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="tiktok-bio"
              className="w-full rounded-lg border border-hairline bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Label *</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="TikTok bio link"
              className="w-full rounded-lg border border-hairline bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Destination (optional)
            </label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={`${origin || "https://b1scale.com"}/`}
              className="w-full rounded-lg border border-hairline bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-lime"
            />
          </div>
        </div>
        {err && (
          <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {err}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/70">
            Codes can contain letters, numbers, dashes, and underscores. Share the generated URL anywhere.
          </p>
          <button
            type="submit"
            disabled={creating}
            className="rounded-full bg-lime px-5 py-2 font-display text-xs tracking-[0.2em] text-primary-foreground disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create link"}
          </button>
        </div>
      </form>

      {/* archive toggle */}
      <div className="mt-5 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Your links
        </div>
        <button
          onClick={() => setShowArchived((s) => !s)}
          className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          {showArchived ? "Hide archived" : "Show archived"}
        </button>
      </div>

      {/* links list */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
        {visibleLinks.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No tracking links yet. Create your first above.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Link</th>
                <th className="hidden px-5 py-3 md:table-cell">Clicks</th>
                <th className="hidden px-5 py-3 md:table-cell">Signups</th>
                <th className="hidden px-5 py-3 lg:table-cell">Conv.</th>
                <th className="hidden px-5 py-3 lg:table-cell">Last click</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleLinks.map((l) => {
                const s = stats.get(l.code) ?? { clicks: 0, signups: 0, last_click: null };
                const conv = s.clicks > 0 ? ((s.signups / s.clicks) * 100).toFixed(1) + "%" : "—";
                return (
                  <tr
                    key={l.id}
                    className={`border-b border-hairline/60 last:border-0 ${
                      l.archived ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{l.label}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-full border border-lime/40 bg-lime-soft px-2 py-0.5 uppercase tracking-[0.15em] text-lime">
                          {l.code}
                        </span>
                        <span className="break-all font-mono">{buildUrl(l.code)}</span>
                      </div>
                      {/* mobile stats */}
                      <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground md:hidden">
                        <span>{s.clicks} clicks</span>
                        <span>{s.signups} signups</span>
                        <span>{conv}</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 font-display text-lg text-foreground md:table-cell">
                      {s.clicks}
                    </td>
                    <td className="hidden px-5 py-3.5 font-display text-lg text-lime md:table-cell">
                      {s.signups}
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">
                      {conv}
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">
                      {s.last_click ? new Date(s.last_click).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => copyUrl(l.code)}
                          className="rounded-full border border-hairline bg-surface-2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground hover:border-lime"
                        >
                          {copiedCode === l.code ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => toggleArchive(l)}
                          className="rounded-full border border-hairline bg-surface-2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                        >
                          {l.archived ? "Restore" : "Archive"}
                        </button>
                        <button
                          onClick={() => deleteLink(l)}
                          className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-destructive hover:bg-destructive/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  link,
  multiline,
}: {
  label: string;
  value: string;
  link?: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-words text-sm text-foreground underline-offset-4 hover:text-lime hover:underline"
        >
          {value}
        </a>
      ) : (
        <div
          className={`mt-1 break-words text-sm text-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}
        >
          {value}
        </div>
      )}
    </div>
  );
}
