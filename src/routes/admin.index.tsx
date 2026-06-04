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

type Status = "new" | "contacted" | "qualified" | "rejected";

type Application = {
  id: string;
  fname: string;
  lname: string | null;
  email: string;
  phone: string | null;
  tiktok: string | null;
  instagram: string | null;
  x_handle: string | null;
  notes: string | null;
  tiktok_followers: number | null;
  ig_followers: number | null;
  niche: string | null;
  bio: string | null;
  plan: string;
  status: Status | null;
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

type PageView = {
  id: string;
  path: string;
  created_at: string;
};

type Tab = "applications" | "analytics" | "links";


function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // Mon as start
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

function startOfMonth() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const STATUS_STYLES: Record<Status, string> = {
  new: "bg-lime text-primary-foreground",
  contacted: "border border-hairline bg-surface-2 text-foreground",
  qualified: "bg-lime-soft text-lime border border-lime/40",
  rejected: "border border-destructive/40 bg-destructive/10 text-destructive",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<Tab>("applications");

  const [apps, setApps] = useState<Application[]>([]);
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [clicks, setClicks] = useState<LinkClick[]>([]);
  const [views, setViews] = useState<PageView[]>([]);

  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"newest" | "oldest">("newest");
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
      const [appsRes, linksRes, clicksRes, viewsRes] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("tracking_links").select("*").order("created_at", { ascending: false }),
        supabase
          .from("link_clicks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("page_views")
          .select("id,path,created_at")
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);
      setApps((appsRes.data as Application[]) ?? []);
      setLinks((linksRes.data as TrackingLink[]) ?? []);
      setClicks((clicksRes.data as LinkClick[]) ?? []);
      setViews((viewsRes.data as PageView[]) ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    const list = apps.filter((a) => {
      if (statusFilter !== "all" && (a.status ?? "new") !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          a.fname.toLowerCase().includes(q) ||
          (a.lname ?? "").toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.phone ?? "").toLowerCase().includes(q) ||
          (a.tiktok ?? "").toLowerCase().includes(q) ||
          (a.instagram ?? "").toLowerCase().includes(q) ||
          (a.x_handle ?? "").toLowerCase().includes(q) ||
          (a.notes ?? "").toLowerCase().includes(q) ||
          (a.ref_code ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortDir === "newest" ? db - da : da - db;
    });
    return list;
  }, [apps, statusFilter, query, sortDir]);

  const stats = useMemo(() => {
    const week = startOfWeek();
    const month = startOfMonth();
    return {
      total: apps.length,
      week: apps.filter((a) => new Date(a.created_at).getTime() >= week).length,
      month: apps.filter((a) => new Date(a.created_at).getTime() >= month).length,
      awaiting: apps.filter((a) => (a.status ?? "new") === "new").length,
    };
  }, [apps]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (!error) {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    }
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
          <p className="mt-2 text-sm text-muted-foreground">
            This account does not have admin access.
          </p>
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
                Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden gap-1 rounded-full border border-hairline bg-surface-1 p-1 sm:flex">
              {(["applications", "analytics", "links"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    tab === t
                      ? "bg-lime text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
        <div className="flex gap-1 border-t border-hairline px-5 py-2 sm:hidden">
          {(["applications", "analytics", "links"] as const).map((t) => (
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
        {tab === "applications" && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Total" value={stats.total} />
              <StatCard label="This week" value={stats.week} />
              <StatCard label="This month" value={stats.month} />
              <StatCard label="Awaiting review" value={stats.awaiting} accent />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone, handle…"
                className="min-w-[260px] flex-1 rounded-lg border border-hairline bg-surface-1 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-lime"
              />
              <div className="flex flex-wrap gap-1.5 rounded-full border border-hairline bg-surface-1 p-1">
                {(["all", "new", "contacted", "qualified", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                      statusFilter === f
                        ? "bg-lime text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSortDir((s) => (s === "newest" ? "oldest" : "newest"))}
                className="rounded-full border border-hairline bg-surface-1 px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Sort: {sortDir}
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No applications match your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">First</th>
                        <th className="px-4 py-3">Last</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Instagram</th>
                        <th className="px-4 py-3">TikTok</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a) => {
                        const status = (a.status ?? "new") as Status;
                        return (
                          <tr
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className="cursor-pointer border-b border-hairline/60 last:border-0 hover:bg-surface-2"
                          >
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-foreground">{a.fname}</td>
                            <td className="px-4 py-3 text-foreground">{a.lname ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                            <td className="px-4 py-3 text-muted-foreground">{a.phone ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {a.instagram ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{a.tiktok ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {a.onlyfans ? (
                                <span className="text-lime">link</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] ${STATUS_STYLES[status]}`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "analytics" && <AnalyticsPanel views={views} apps={apps} />}

        {tab === "links" && (
          <LinksPanel links={links} setLinks={setLinks} clicks={clicks} apps={apps} />
        )}
      </main>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 grid place-items-end bg-black/60 backdrop-blur-sm md:place-items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-hairline bg-background p-7 md:rounded-3xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Application
                </div>
                <h2 className="mt-1 font-display text-3xl text-foreground">
                  {selected.fname} {selected.lname ?? ""}
                </h2>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                    STATUS_STYLES[(selected.status ?? "new") as Status]
                  }`}
                >
                  {selected.status ?? "new"}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {(["new", "contacted", "qualified", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    (selected.status ?? "new") === s
                      ? STATUS_STYLES[s]
                      : "border border-hairline bg-surface-1 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mark {s}
                </button>
              ))}
            </div>

            <div className="space-y-3 text-sm">
              <Field label="Email" value={selected.email} link={`mailto:${selected.email}`} />
              {selected.phone && (
                <Field label="Phone" value={selected.phone} link={`tel:${selected.phone}`} />
              )}
              {selected.onlyfans && (
                <Field
                  label="OnlyFans"
                  value={selected.onlyfans}
                  link={
                    selected.onlyfans.startsWith("http")
                      ? selected.onlyfans
                      : `https://${selected.onlyfans}`
                  }
                />
              )}
              {selected.instagram && (
                <Field
                  label="Instagram"
                  value={selected.instagram}
                  link={`https://instagram.com/${selected.instagram.replace(/^@/, "")}`}
                />
              )}
              {selected.tiktok && (
                <Field
                  label="TikTok"
                  value={selected.tiktok}
                  link={`https://tiktok.com/@${selected.tiktok.replace(/^@/, "")}`}
                />
              )}
              {selected.x_handle && (
                <Field
                  label="X / Twitter"
                  value={selected.x_handle}
                  link={`https://x.com/${selected.x_handle.replace(/^@/, "")}`}
                />
              )}
              {selected.notes && <Field label="Additional notes" value={selected.notes} multiline />}
              {selected.bio && !selected.notes && (
                <Field label="Notes" value={selected.bio} multiline />
              )}
              <Field
                label="Source link"
                value={selected.ref_code ?? "Direct / unattributed"}
              />
              <Field
                label="Submitted"
                value={new Date(selected.created_at).toLocaleString()}
              />
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-lime/40 bg-lime-soft" : "border-hairline bg-surface-1"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div
        className={`mt-2 font-display text-4xl ${accent ? "text-lime" : "text-foreground"}`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function AnalyticsPanel({ views, apps }: { views: PageView[]; apps: Application[] }) {
  const today = startOfDay();
  const week = startOfWeek();
  const month = startOfMonth();

  const viewsDay = views.filter((v) => new Date(v.created_at).getTime() >= today).length;
  const viewsWeek = views.filter((v) => new Date(v.created_at).getTime() >= week).length;
  const viewsMonth = views.filter((v) => new Date(v.created_at).getTime() >= month).length;

  const appsDay = apps.filter((a) => new Date(a.created_at).getTime() >= today).length;
  const appsWeek = apps.filter((a) => new Date(a.created_at).getTime() >= week).length;
  const appsMonth = apps.filter((a) => new Date(a.created_at).getTime() >= month).length;

  const conv = viewsMonth > 0 ? ((appsMonth / viewsMonth) * 100).toFixed(2) + "%" : "—";

  // 14-day series
  const series = useMemo(() => {
    const days: { date: Date; views: number; apps: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({ date: d, views: 0, apps: 0 });
    }
    const idxFor = (iso: string) => {
      const t = new Date(iso);
      t.setHours(0, 0, 0, 0);
      return days.findIndex((d) => d.date.getTime() === t.getTime());
    };
    for (const v of views) {
      const i = idxFor(v.created_at);
      if (i >= 0) days[i].views++;
    }
    for (const a of apps) {
      const i = idxFor(a.created_at);
      if (i >= 0) days[i].apps++;
    }
    return days;
  }, [views, apps]);

  const maxV = Math.max(1, ...series.map((d) => d.views));
  const maxA = Math.max(1, ...series.map((d) => d.apps));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Visitors today" value={viewsDay} />
        <StatCard label="Visitors / week" value={viewsWeek} />
        <StatCard label="Visitors / month" value={viewsMonth} />
        <StatCard label="Conversion" value={conv} accent />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Applications today" value={appsDay} />
        <StatCard label="Applications / week" value={appsWeek} />
        <StatCard label="Applications / month" value={appsMonth} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <BarChart title="Visitors — last 14 days" data={series} field="views" max={maxV} />
        <BarChart title="Applications — last 14 days" data={series} field="apps" max={maxA} />
      </div>
    </>
  );
}

function BarChart({
  title,
  data,
  field,
  max,
}: {
  title: string;
  data: { date: Date; views: number; apps: number }[];
  field: "views" | "apps";
  max: number;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{title}</div>
      <div className="mt-4 flex h-40 items-end gap-1.5">
        {data.map((d) => {
          const v = d[field];
          const h = Math.max(2, (v / max) * 100);
          return (
            <div key={d.date.toISOString()} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full text-center text-[9px] text-muted-foreground/70">{v || ""}</div>
              <div
                className="w-full rounded-t bg-lime/80"
                style={{ height: `${h}%` }}
                title={`${d.date.toLocaleDateString()}: ${v}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-muted-foreground/60">
        <span>{data[0].date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span>
          {data[data.length - 1].date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
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
    if (
      !confirm(
        `Delete link "${link.code}"? Click history will be kept but the link will be removed.`,
      )
    )
      return;
    const { error } = await supabase.from("tracking_links").delete().eq("id", link.id);
    if (!error) setLinks((prev) => prev.filter((l) => l.id !== link.id));
  }

  function buildUrl(code: string) {
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active links" value={totals.activeLinks} />
        <StatCard label="Total clicks" value={totals.totalClicks} />
        <StatCard label="Attributed signups" value={totals.attributedSignups} accent />
        <StatCard label="Conversion" value={`${totals.conv}%`} />
      </div>

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
            Codes can contain letters, numbers, dashes, and underscores.
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
