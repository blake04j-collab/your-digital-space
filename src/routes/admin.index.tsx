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
  created_at: string;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
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
      const { data } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      setApps((data as Application[]) ?? []);
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
          (a.niche ?? "").toLowerCase().includes(q)
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
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Applications</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-hairline px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
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
            placeholder="Search by name, email, handle, niche…"
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
