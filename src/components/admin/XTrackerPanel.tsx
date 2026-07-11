import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { fetchXViews } from "@/lib/x-views.functions";

type RefreshProgress = {
  total: number;
  completed: number;
  success: number;
  failed: number;
  currentUsername: string | null;
  errors: { username: string; error: string }[];
  done: boolean;
  unavailable: boolean;
};

export type XAccount = {
  id: string;
  x_username: string;
  employee_name: string;
  notes: string | null;
  profile_url: string;
  pinned_post_url: string | null;
  current_views: number;
  weekly_starting_views: number;
  rate_cents_per_1k: number;
  status: string;
  status_message: string | null;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
};

export type XHistory = {
  id: string;
  account_id: string | null;
  x_username: string;
  employee_name: string;
  week_start: string;
  week_end: string;
  starting_views: number;
  ending_views: number;
  weekly_views: number;
  weekly_pay_cents: number;
  created_at: string;
};

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}
function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
function payFromViews(views: number, ratePer1k: number) {
  return Math.round((views / 1000) * ratePer1k);
}
function startOfWeekDate(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - diff);
  return x;
}
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

type ViewMode = "accounts" | "history" | "earnings";

export default function XTrackerPanel() {
  const [accounts, setAccounts] = useState<XAccount[]>([]);
  const [history, setHistory] = useState<XHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("accounts");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<XAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<RefreshProgress | null>(null);
  const refreshView = useServerFn(fetchXViews);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    const [a, h] = await Promise.all([
      supabase.from("x_tracker_accounts").select("*").order("created_at", { ascending: false }),
      supabase
        .from("x_tracker_history")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(500),
    ]);
    setAccounts((a.data as XAccount[]) ?? []);
    setHistory((h.data as XHistory[]) ?? []);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const totalWeekly = accounts.reduce(
      (s, a) => s + Math.max(0, a.current_views - a.weekly_starting_views),
      0,
    );
    const totalWeeklyPay = accounts.reduce(
      (s, a) =>
        s + payFromViews(Math.max(0, a.current_views - a.weekly_starting_views), a.rate_cents_per_1k),
      0,
    );
    const active = accounts.length;
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthPay =
      history
        .filter((h) => new Date(h.week_start) >= monthAgo)
        .reduce((s, h) => s + h.weekly_pay_cents, 0) + totalWeeklyPay;
    return { totalWeekly, totalWeeklyPay, active, monthPay };
  }, [accounts, history]);

  const employeeEarnings = useMemo(() => {
    const map = new Map<
      string,
      { name: string; weeklyPay: number; monthPay: number; lifetimePay: number; weeklyViews: number }
    >();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    for (const a of accounts) {
      const key = a.employee_name || "Unassigned";
      const wViews = Math.max(0, a.current_views - a.weekly_starting_views);
      const wPay = payFromViews(wViews, a.rate_cents_per_1k);
      const e = map.get(key) ?? { name: key, weeklyPay: 0, monthPay: 0, lifetimePay: 0, weeklyViews: 0 };
      e.weeklyPay += wPay;
      e.weeklyViews += wViews;
      e.monthPay += wPay;
      e.lifetimePay += wPay;
      map.set(key, e);
    }
    for (const h of history) {
      const key = h.employee_name || "Unassigned";
      const e = map.get(key) ?? { name: key, weeklyPay: 0, monthPay: 0, lifetimePay: 0, weeklyViews: 0 };
      e.lifetimePay += h.weekly_pay_cents;
      if (new Date(h.week_start) >= monthAgo) e.monthPay += h.weekly_pay_cents;
      map.set(key, e);
    }
    return Array.from(map.values()).sort((a, b) => b.lifetimePay - a.lifetimePay);
  }, [accounts, history]);

  async function persistViews(id: string, newViews: number, statusMessage: string | null = null) {
    const { error } = await supabase
      .from("x_tracker_accounts")
      .update({
        current_views: newViews,
        last_updated: new Date().toISOString(),
        status: "updated",
        status_message: statusMessage,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async function markError(id: string, message: string) {
    await supabase
      .from("x_tracker_accounts")
      .update({ status: "error", status_message: message })
      .eq("id", id);
  }

  async function refreshOneAccount(a: XAccount): Promise<{ ok: boolean; error?: string; unavailable?: boolean }> {
    const res = await refreshView({ data: { pinnedPostUrl: a.pinned_post_url } });
    if (!res.ok) {
      await markError(a.id, res.error);
      return { ok: false, error: res.error, unavailable: !res.configured };
    }
    await persistViews(a.id, res.views);
    return { ok: true };
  }

  async function refreshSingle(a: XAccount) {
    setBusy(true);
    const r = await refreshOneAccount(a);
    setBusy(false);
    await refresh();
    if (!r.ok) alert(r.error ?? "Refresh failed");
  }

  async function refreshAll() {
    if (accounts.length === 0) return;
    setProgress({
      total: accounts.length,
      completed: 0,
      success: 0,
      failed: 0,
      currentUsername: accounts[0]?.x_username ?? null,
      errors: [],
      done: false,
      unavailable: false,
    });
    let unavailable = false;
    for (let i = 0; i < accounts.length; i++) {
      const a = accounts[i];
      setProgress((p) => (p ? { ...p, currentUsername: a.x_username } : p));
      const r = await refreshOneAccount(a);
      setProgress((p) => {
        if (!p) return p;
        const next = { ...p, completed: p.completed + 1, currentUsername: null };
        if (r.ok) next.success += 1;
        else {
          next.failed += 1;
          next.errors = [...p.errors, { username: a.x_username, error: r.error ?? "Unknown" }];
          if (r.unavailable) next.unavailable = true;
        }
        return next;
      });
      if (r.unavailable) unavailable = true;
      if (unavailable) {
        // If X API isn't configured, no point continuing — mark rest as failed with same reason.
        for (let j = i + 1; j < accounts.length; j++) {
          const b = accounts[j];
          await markError(b.id, "Automatic refresh unavailable — X API not connected.");
          setProgress((p) =>
            p
              ? {
                  ...p,
                  completed: p.completed + 1,
                  failed: p.failed + 1,
                  errors: [
                    ...p.errors,
                    { username: b.x_username, error: "Automatic refresh unavailable — X API not connected." },
                  ],
                }
              : p,
          );
        }
        break;
      }
    }
    setProgress((p) => (p ? { ...p, done: true, currentUsername: null } : p));
    await refresh();
  }

  async function deleteAccount(id: string) {
    if (!confirm("Remove this account from tracking?")) return;
    const { error } = await supabase.from("x_tracker_accounts").delete().eq("id", id);
    if (error) return alert(error.message);
    setAccounts((p) => p.filter((a) => a.id !== id));
  }

  async function closeWeek() {
    if (
      !confirm(
        "Close the current week for ALL accounts?\n\nThis snapshots each account's weekly views + pay into history, then resets the weekly counter. Do this every Monday.",
      )
    )
      return;
    setBusy(true);
    const now = new Date();
    const weekStart = startOfWeekDate();
    // Previous week's Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() - 1);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const rows = accounts.map((a) => {
      const weekly = Math.max(0, a.current_views - a.weekly_starting_views);
      return {
        account_id: a.id,
        x_username: a.x_username,
        employee_name: a.employee_name,
        week_start: ymd(prevWeekStart),
        week_end: ymd(weekEnd),
        starting_views: a.weekly_starting_views,
        ending_views: a.current_views,
        weekly_views: weekly,
        weekly_pay_cents: payFromViews(weekly, a.rate_cents_per_1k),
      };
    });

    if (rows.length > 0) {
      const { error: hErr } = await supabase.from("x_tracker_history").insert(rows);
      if (hErr) {
        setBusy(false);
        return alert(hErr.message);
      }
    }

    for (const a of accounts) {
      await supabase
        .from("x_tracker_accounts")
        .update({ weekly_starting_views: a.current_views, last_updated: now.toISOString() })
        .eq("id", a.id);
    }
    setBusy(false);
    await refresh();
    alert("Week closed. Weekly counters reset.");
  }

  function exportPayrollCsv() {
    const header = ["Employee", "X Username", "Weekly Views", "Rate /1k", "Weekly Pay", "Last Updated"];
    const lines = [header.join(",")];
    for (const a of accounts) {
      const w = Math.max(0, a.current_views - a.weekly_starting_views);
      lines.push(
        [
          `"${a.employee_name}"`,
          a.x_username,
          w,
          money(a.rate_cents_per_1k),
          money(payFromViews(w, a.rate_cents_per_1k)),
          a.last_updated ?? "",
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `x-tracker-payroll-${ymd(new Date())}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading X Tracker…</div>;
  }

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">X View Tracker</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Views only refresh when you click Refresh. $3 per 1,000 weekly views. No background syncing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void refreshAll()}
            disabled={busy || (progress !== null && !progress.done) || accounts.length === 0}
            className="rounded-full bg-lime px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {progress && !progress.done ? "Refreshing…" : "Refresh all accounts"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            + Add account
          </button>
          <button
            onClick={exportPayrollCsv}
            className="rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Export payroll
          </button>
          <button
            onClick={closeWeek}
            disabled={busy}
            className="rounded-full border border-lime bg-lime-soft px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-lime disabled:opacity-50"
          >
            {busy ? "Working…" : "Close week & reset"}
          </button>
        </div>
      </div>

      {progress && (
        <div className="mt-4 rounded-2xl border border-hairline bg-surface-1 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-foreground">
              {progress.done ? (
                progress.unavailable ? (
                  <span className="text-destructive">
                    Automatic refresh unavailable — X API is not connected.
                  </span>
                ) : progress.failed === 0 ? (
                  <span className="text-lime">✓ Refresh complete — all {progress.success} accounts updated.</span>
                ) : (
                  <span>
                    Refresh complete — <span className="text-lime">{progress.success} updated</span>,{" "}
                    <span className="text-destructive">{progress.failed} failed</span>.
                  </span>
                )
              ) : (
                <span>
                  Refreshing {progress.currentUsername ? `@${progress.currentUsername}` : "…"}
                </span>
              )}
            </div>
            {progress.done && (
              <button
                onClick={() => setProgress(null)}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            )}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-lime transition-all"
              style={{ width: `${(progress.completed / Math.max(1, progress.total)) * 100}%` }}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-5">
            <div>Total: <span className="text-foreground">{progress.total}</span></div>
            <div>Done: <span className="text-foreground">{progress.completed}</span></div>
            <div>Remaining: <span className="text-foreground">{progress.total - progress.completed}</span></div>
            <div>Success: <span className="text-lime">{progress.success}</span></div>
            <div>Failed: <span className="text-destructive">{progress.failed}</span></div>
          </div>
          {progress.errors.length > 0 && (
            <details className="mt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">View {progress.errors.length} error(s)</summary>
              <ul className="mt-2 space-y-1">
                {progress.errors.map((e, i) => (
                  <li key={i}>
                    <span className="text-foreground">@{e.username}</span>: {e.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <TinyStat label="Accounts tracked" value={String(stats.active)} />
        <TinyStat label="Weekly views" value={fmt(stats.totalWeekly)} />
        <TinyStat label="Weekly pay" value={money(stats.totalWeeklyPay)} accent />
        <TinyStat label="Last 30 days pay" value={money(stats.monthPay)} />
      </div>

      <div className="mt-5 flex gap-1 rounded-full border border-hairline bg-surface-1 p-1 w-fit">
        {(["accounts", "earnings", "history"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
              view === v ? "bg-lime text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "accounts" && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
          {accounts.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No accounts yet. Click <span className="text-foreground">+ Add account</span> to start tracking.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Baseline</th>
                    <th className="px-4 py-3">Current</th>
                    <th className="px-4 py-3">Weekly views</th>
                    <th className="px-4 py-3">Weekly pay</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => {
                    const w = Math.max(0, a.current_views - a.weekly_starting_views);
                    const pay = payFromViews(w, a.rate_cents_per_1k);
                    return (
                      <tr key={a.id} className="border-b border-hairline/60 last:border-0 hover:bg-surface-2">
                        <td className="px-4 py-3">
                          <a
                            href={a.profile_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground hover:text-lime"
                          >
                            @{a.x_username}
                          </a>
                          {a.pinned_post_url && (
                            <a
                              href={a.pinned_post_url}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-lime"
                            >
                              post ›
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.employee_name || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{fmt(a.weekly_starting_views)}</td>
                        <td className="px-4 py-3 text-foreground">{fmt(a.current_views)}</td>
                        <td className="px-4 py-3 text-foreground">{fmt(w)}</td>
                        <td className="px-4 py-3 font-medium text-lime">{money(pay)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {a.last_updated ? new Date(a.last_updated).toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const v = prompt(
                                  `Update total views for @${a.x_username}`,
                                  String(a.current_views),
                                );
                                if (v == null) return;
                                const n = Number(v.replace(/[,\s]/g, ""));
                                if (!Number.isFinite(n) || n < 0) return alert("Invalid number");
                                void updateViews(a.id, Math.floor(n));
                              }}
                              className="rounded-full bg-lime px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground"
                            >
                              Update views
                            </button>
                            <button
                              onClick={() => setEditing(a)}
                              className="rounded-full border border-hairline px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteAccount(a.id)}
                              className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-destructive"
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "earnings" && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
          {employeeEarnings.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No earnings yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">This week views</th>
                  <th className="px-4 py-3">This week pay</th>
                  <th className="px-4 py-3">Last 30 days</th>
                  <th className="px-4 py-3">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {employeeEarnings.map((e) => (
                  <tr key={e.name} className="border-b border-hairline/60 last:border-0">
                    <td className="px-4 py-3 text-foreground">{e.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(e.weeklyViews)}</td>
                    <td className="px-4 py-3 text-lime">{money(e.weeklyPay)}</td>
                    <td className="px-4 py-3 text-foreground">{money(e.monthPay)}</td>
                    <td className="px-4 py-3 text-foreground">{money(e.lifetimePay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
          {history.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No history yet. Close a week to snapshot payouts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Week</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">End</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-hairline/60 last:border-0">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {h.week_start} → {h.week_end}
                      </td>
                      <td className="px-4 py-3 text-foreground">@{h.x_username}</td>
                      <td className="px-4 py-3 text-muted-foreground">{h.employee_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(h.starting_views)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(h.ending_views)}</td>
                      <td className="px-4 py-3 text-foreground">{fmt(h.weekly_views)}</td>
                      <td className="px-4 py-3 text-lime">{money(h.weekly_pay_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(showAdd || editing) && (
        <AccountForm
          account={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowAdd(false);
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function TinyStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? "border-lime/40 bg-lime-soft" : "border-hairline bg-surface-1"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl ${accent ? "text-lime" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function AccountForm({
  account,
  onClose,
  onSaved,
}: {
  account: XAccount | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [xUsername, setX] = useState(account?.x_username ?? "");
  const [employee, setEmployee] = useState(account?.employee_name ?? "");
  const [profile, setProfile] = useState(account?.profile_url ?? "");
  const [pinned, setPinned] = useState(account?.pinned_post_url ?? "");
  const [notes, setNotes] = useState(account?.notes ?? "");
  const [currentViews, setCurrentViews] = useState(String(account?.current_views ?? 0));
  const [baseline, setBaseline] = useState(String(account?.weekly_starting_views ?? 0));
  const [rate, setRate] = useState(String((account?.rate_cents_per_1k ?? 300) / 100));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!xUsername.trim()) return alert("X username required");
    const u = xUsername.replace(/^@/, "").trim();
    const p = profile.trim() || `https://x.com/${u}`;
    setSaving(true);
    const payload = {
      x_username: u,
      employee_name: employee.trim(),
      profile_url: p,
      pinned_post_url: pinned.trim() || null,
      notes: notes.trim() || null,
      current_views: Math.max(0, Math.floor(Number(currentViews) || 0)),
      weekly_starting_views: Math.max(0, Math.floor(Number(baseline) || 0)),
      rate_cents_per_1k: Math.max(0, Math.round(Number(rate) * 100)),
      last_updated: new Date().toISOString(),
      status: "updated" as const,
    };
    const { error } = account
      ? await supabase.from("x_tracker_accounts").update(payload).eq("id", account.id)
      : await supabase.from("x_tracker_accounts").insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    onSaved();
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-hairline bg-background p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">
            {account ? "Edit account" : "Add X account"}
          </h3>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <Input label="X username" value={xUsername} onChange={setX} placeholder="username (no @)" />
          <Input label="Employee name" value={employee} onChange={setEmployee} />
          <Input label="Profile URL" value={profile} onChange={setProfile} placeholder="auto if blank" />
          <Input label="Pinned post URL (optional)" value={pinned} onChange={setPinned} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Current views" value={currentViews} onChange={setCurrentViews} type="number" />
            <Input
              label="Baseline (week start)"
              value={baseline}
              onChange={setBaseline}
              type="number"
            />
          </div>
          <Input label="Rate ($/1k views)" value={rate} onChange={setRate} type="number" />
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-hairline bg-surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-lime"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-lime py-3 font-display text-sm tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving…" : account ? "Save changes" : "Add account"}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-hairline px-4 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-lg border border-hairline bg-surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-lime"
      />
    </div>
  );
}
