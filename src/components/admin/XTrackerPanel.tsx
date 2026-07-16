import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { extractViewsFromScreenshot } from "@/lib/x-views.functions";
import { deleteEmployee as deleteEmployeeFn } from "@/lib/admin-employees.functions";

export type XAccount = {
  id: string;
  x_username: string;
  employee_name: string;
  notes: string | null;
  profile_url: string;
  pinned_post_url: string | null;
  pinned_post_date: string | null;
  current_views: number;
  previous_views: number | null;
  views_gained_since_last: number | null;
  payout_owed_cents: number | null;
  weekly_starting_views: number;
  rate_cents_per_1k: number;
  status: string;
  status_message: string | null;
  last_updated: string | null;
  last_refresh_at: string | null;
  last_screenshot_upload_at: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
  added_by_user_id: string | null;
};

export type XPayment = {
  id: string;
  account_id: string | null;
  employee_name: string;
  x_username: string;
  period_start: string | null;
  period_end: string | null;
  views_paid: number;
  amount_cents: number;
  manager_commission_cents: number;
  paid_at: string;
};

export type ManagerRow = {
  user_id: string;
  email: string;
  paid_baseline_cents: number;
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

export type XScreenshot = {
  id: string;
  account_id: string | null;
  x_username: string;
  employee_name: string;
  previous_views: number;
  new_views: number;
  views_gained: number;
  payout_cents: number;
  rate_cents_per_1k: number;
  screenshot_url: string;
  detected_views: number | null;
  uploaded_at: string;
};

const BUCKET = "x-screenshots";

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

async function signedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? null;
}

type ViewMode = "accounts" | "team" | "overview" | "employees" | "screenshots" | "payroll";

function extractXUsername(input: string): string | null {
  const raw = input.trim().replace(/^@/, "");
  if (!raw) return null;
  const looksLikeUrl = /^https?:\/\//i.test(raw) || /^(www\.)?(x|twitter)\.com\//i.test(raw);
  if (!looksLikeUrl) {
    // treat as bare username
    const clean = raw.split(/[/?#]/)[0];
    return /^[A-Za-z0-9_]{1,20}$/.test(clean) ? clean : null;
  }
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (!/(^|\.)(x|twitter)\.com$/i.test(u.hostname)) return null;
    const seg = u.pathname.split("/").filter(Boolean)[0];
    if (!seg) return null;
    return /^[A-Za-z0-9_]{1,20}$/.test(seg) ? seg : null;
  } catch {
    return null;
  }
}

type EmployeeRow = {
  user_id: string;
  email: string;
  account_count: number;
  weekly_views: number;
  usdt_address: string;
  usdt_network: string;
  manager_user_id?: string | null;
  manager_email?: string | null;
};

type InviteCodeRow = { code: string; label: string | null; active: boolean; created_at: string };

type WalletRow = { user_id: string; usdt_address: string; network: string };

const MANAGER_COMMISSION_PCT = 0.10;

export default function XTrackerPanel({ role = "admin" }: { role?: "admin" | "manager" | "employee" }) {
  const isManager = role === "manager";
  const isEmployee = role === "employee";
  const isRestricted = isManager || isEmployee; // own-scope, hide money
  const isAdmin = role === "admin";
  const [accounts, setAccounts] = useState<XAccount[]>([]);
  const [history, setHistory] = useState<XHistory[]>([]);
  const [screenshots, setScreenshots] = useState<XScreenshot[]>([]);
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [payments, setPayments] = useState<XPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>(role === "admin" ? "overview" : "accounts");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<XAccount | null>(null);
  const [uploading, setUploading] = useState<XAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [myUnpaidCommissionCents, setMyUnpaidCommissionCents] = useState<number>(0);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [myEmployees, setMyEmployees] = useState<EmployeeRow[]>([]);
  const [myInviteCodes, setMyInviteCodes] = useState<InviteCodeRow[]>([]);
  const [myWallet, setMyWallet] = useState<WalletRow | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  // Filters
  const [filterManager, setFilterManager] = useState<string>("");
  const [filterEmployee, setFilterEmployee] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("employee");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      await refresh();
    })();
  }, []);

  async function refresh() {
    setLoading(true);
    const promises: Array<PromiseLike<{ data: unknown }>> = [
      supabase.from("x_tracker_accounts").select("*").order("created_at", { ascending: false }),
      supabase
        .from("x_tracker_history")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(500),
      supabase
        .from("x_tracker_screenshots" as never)
        .select("*")
        .order("uploaded_at", { ascending: false })
        .limit(500) as unknown as PromiseLike<{ data: unknown }>,
    ];
    if (role === "admin") {
      promises.push(supabase.rpc("list_managers" as never) as unknown as PromiseLike<{ data: unknown }>);
    } else if (isManager) {
      promises.push(
        supabase.rpc("get_my_manager_commission" as never) as unknown as PromiseLike<{ data: unknown }>,
      );
    } else {
      promises.push(Promise.resolve({ data: null }));
    }
    const results = await Promise.all(promises);
    const [a, h, s, extra] = results;
    setAccounts((a.data as XAccount[]) ?? []);
    setHistory((h.data as XHistory[]) ?? []);
    setScreenshots((s.data as XScreenshot[]) ?? []);
    if (role === "admin") {
      setManagers((extra?.data as ManagerRow[]) ?? []);
      const [{ data: emps }, { data: pays }] = await Promise.all([
        supabase.rpc("list_employees" as never),
        supabase
          .from("x_payments" as never)
          .select("*")
          .order("paid_at", { ascending: false })
          .limit(2000) as unknown as Promise<{ data: unknown }>,
      ]);
      setEmployees(((emps as unknown) as EmployeeRow[]) ?? []);
      setPayments(((pays as unknown) as XPayment[]) ?? []);
    } else if (isManager) {
      const row = Array.isArray(extra?.data) ? (extra.data[0] as { unpaid_commission_cents?: number } | undefined) : undefined;
      setMyUnpaidCommissionCents(Number(row?.unpaid_commission_cents ?? 0));
      const [{ data: myEmps }, { data: codes }] = await Promise.all([
        supabase.rpc("list_my_employees" as never),
        supabase.rpc("list_my_invite_codes" as never),
      ]);
      setMyEmployees(((myEmps as unknown) as EmployeeRow[]) ?? []);
      setMyInviteCodes(((codes as unknown) as InviteCodeRow[]) ?? []);
    }
    if (isRestricted) {
      const { data: w } = await supabase
        .from("payout_wallets" as never)
        .select("*")
        .maybeSingle();
      setMyWallet((w as WalletRow | null) ?? null);
    }
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

  const managerStats = useMemo(() => {
    // Map account_id -> manager user_id for history lookup
    const accountManager = new Map<string, string>();
    for (const a of accounts) {
      if (a.added_by_user_id) accountManager.set(a.id, a.added_by_user_id);
    }
    // Build per-manager tallies keyed by user_id
    const map = new Map<string, { accountsCount: number; weeklyViews: number; lifetimePayCents: number }>();
    for (const m of managers) {
      map.set(m.user_id, { accountsCount: 0, weeklyViews: 0, lifetimePayCents: 0 });
    }
    for (const a of accounts) {
      const mgr = a.added_by_user_id;
      if (!mgr || !map.has(mgr)) continue;
      const entry = map.get(mgr)!;
      const wViews = Math.max(0, a.current_views - a.weekly_starting_views);
      const wPay = payFromViews(wViews, a.rate_cents_per_1k);
      entry.accountsCount += 1;
      entry.weeklyViews += wViews;
      entry.lifetimePayCents += wPay;
    }
    for (const h of history) {
      if (!h.account_id) continue;
      const mgr = accountManager.get(h.account_id);
      if (!mgr || !map.has(mgr)) continue;
      map.get(mgr)!.lifetimePayCents += h.weekly_pay_cents;
    }
    return managers.map((m) => {
      const s = map.get(m.user_id) ?? { accountsCount: 0, weeklyViews: 0, lifetimePayCents: 0 };
      const lifetimeCommissionCents = Math.round(s.lifetimePayCents * MANAGER_COMMISSION_PCT);
      const unpaidCommissionCents = Math.max(0, lifetimeCommissionCents - m.paid_baseline_cents);
      return {
        ...m,
        accountsCount: s.accountsCount,
        weeklyViews: s.weeklyViews,
        lifetimeCommissionCents,
        unpaidCommissionCents,
      };
    });
  }, [accounts, history, managers]);

  const managerEmailById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of managers) m.set(r.user_id, r.email);
    return m;
  }, [managers]);

  const employeeManagerById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of employees) if (e.manager_user_id) m.set(e.user_id, e.manager_user_id);
    return m;
  }, [employees]);

  const managerLabelByEmail: Record<string, string> = {
    "agncy.cloud@gmail.com": "LUCAS",
    "alynedel@outlook.com": "ALY",
    "managements.cloud@gmail.com": "BLAKE",
  };

  function managerLabelForAccount(addedBy: string | null): string | null {
    if (!addedBy) return null;
    let mgrId: string | undefined = managerEmailById.has(addedBy) ? addedBy : employeeManagerById.get(addedBy);
    if (!mgrId) return null;
    const email = managerEmailById.get(mgrId);
    if (!email) return null;
    return managerLabelByEmail[email] ?? email;
  }

  async function resetManagerCommission(m: (typeof managerStats)[number]) {
    if (
      !confirm(
        `Mark ${m.email}'s commission as fully paid?\n\nUnpaid balance will reset to $0.00 (currently ${money(m.unpaidCommissionCents)}). Future views will start accruing from zero.`,
      )
    )
      return;
    const { error } = await supabase.rpc("reset_manager_commission" as never, {
      _manager: m.user_id,
      _lifetime_cents: m.lifetimeCommissionCents,
    } as never);
    if (error) return alert(error.message);
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

  // Manager commission: 10% of what their added accounts would pay at $3/1k
  const managerCommissionCents = myUnpaidCommissionCents;

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">
            {isRestricted ? "Your X Accounts" : "X View Tracker"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isEmployee
              ? "Add the X accounts you're running and upload weekly screenshots of your pinned post."
              : isManager
              ? "Add X accounts you're managing and upload weekly screenshots. You earn 10% commission on the views your accounts generate."
              : "Upload a screenshot of each account's post — OCR reads the view count, you confirm, payroll updates. $3 per 1,000 weekly views."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-full border border-hairline bg-surface-1 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            + Add account
          </button>
          {!isRestricted && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <TinyStat label={isRestricted ? "Your accounts" : "Accounts tracked"} value={String(stats.active)} />
        <TinyStat label="Weekly views" value={fmt(stats.totalWeekly)} />
        {isManager && (
          <TinyStat label="Your commission (10%)" value={money(managerCommissionCents)} accent />
        )}
        {!isRestricted && (
          <>
            <TinyStat label="Weekly pay" value={money(stats.totalWeeklyPay)} accent />
            <TinyStat label="Last 30 days pay" value={money(stats.monthPay)} />
          </>
        )}
      </div>

      {isRestricted && (
        <WalletCard
          userId={userId}
          wallet={myWallet}
          onSaved={(w) => setMyWallet(w)}
        />
      )}



      <div className="mt-5 flex gap-1 rounded-full border border-hairline bg-surface-1 p-1 w-fit flex-wrap">
        {(isAdmin
          ? ([
              ["overview", "Overview"],
              ["employees", "Employees"],
              ["screenshots", "Screenshot history"],
              ["payroll", "Payroll"],
            ] as const)
          : isEmployee
          ? ([["accounts", "Accounts"]] as const)
          : ([
              ["accounts", "Accounts"],
              ["team", isManager ? "My team" : "Team & history"],
            ] as const)
        ).map(([v, lbl]) => (
          <button
            key={v}
            onClick={() => { setView(v as ViewMode); setSelectedEmployee(null); }}
            className={`rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
              view === v ? "bg-lime text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {isAdmin && view === "overview" && (
        <AdminOverview
          accounts={accounts}
          payments={payments}
          employees={employees}
          managerLabelForAccount={managerLabelForAccount}
          filterManager={filterManager}
          setFilterManager={setFilterManager}
          filterEmployee={filterEmployee}
          setFilterEmployee={setFilterEmployee}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortKey={sortKey}
          setSortKey={setSortKey}
          onOpenEmployee={(name) => { setSelectedEmployee(name); setView("employees"); }}
          onUpload={(a) => setUploading(a)}
        />
      )}

      {isAdmin && view === "employees" && (
        <AdminEmployees
          accounts={accounts}
          employees={employees}
          screenshots={screenshots}
          managers={managers}
          managerLabelForAccount={managerLabelForAccount}
          selected={selectedEmployee}
          setSelected={setSelectedEmployee}
          onUpload={(a) => setUploading(a)}
          onEdit={(a) => setEditing(a)}
          onRefresh={refresh}
        />
      )}

      {isAdmin && view === "screenshots" && (
        <div className="mt-4">
          <ScreenshotHistory rows={screenshots} />
        </div>
      )}

      {isAdmin && view === "payroll" && (
        <AdminPayroll
          accounts={accounts}
          payments={payments}
          employees={employees}
          managerLabelForAccount={managerLabelForAccount}
          onChanged={refresh}
          userId={userId}
        />
      )}


      {!isAdmin && view === "accounts" && (
        <div className="mt-4 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
            {accounts.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No accounts yet. Click <span className="text-foreground">+ Add account</span> to start tracking.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">{isRestricted ? "Contact" : "Employee"}</th>
                      <th className="px-4 py-3">Previous</th>
                      <th className="px-4 py-3">Current</th>
                      <th className="px-4 py-3">Gained</th>
                      {!isRestricted && <th className="px-4 py-3">Owed</th>}
                      <th className="px-4 py-3">Last upload</th>
                      {!isRestricted && <th className="px-4 py-3">Added by</th>}
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((a) => {
                      const gained = a.views_gained_since_last ?? 0;
                      const owed = a.payout_owed_cents ?? 0;
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
                          <td className="px-4 py-3 text-muted-foreground">{fmt(a.previous_views ?? 0)}</td>
                          <td className="px-4 py-3 text-foreground">{fmt(a.current_views)}</td>
                          <td className="px-4 py-3 text-foreground">{fmt(gained)}</td>
                          {!isRestricted && (
                            <td className="px-4 py-3 font-medium text-lime">{money(owed)}</td>
                          )}
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {a.last_screenshot_upload_at
                              ? new Date(a.last_screenshot_upload_at).toLocaleString()
                              : "—"}
                          </td>
                          {!isRestricted && (
                            <td className="px-4 py-3 text-xs">
                              {(() => {
                                const label = managerLabelForAccount(a.added_by_user_id);
                                if (label) {
                                  return (
                                    <span className="rounded-full border border-lime/40 bg-lime-soft px-2 py-0.5 text-lime">
                                      {label}
                                    </span>
                                  );
                                }
                                return a.added_by_user_id ? (
                                  <span className="text-muted-foreground">Admin</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                );
                              })()}
                            </td>
                          )}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setUploading(a)}
                                className="rounded-full bg-lime px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground"
                              >
                                Upload screenshot
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

          <div>
            <h3 className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {isRestricted ? "Your uploads" : "Recent screenshots"}
            </h3>
            <ScreenshotHistory rows={screenshots} hideMoney={isRestricted} />
          </div>
        </div>
      )}

      {!isAdmin && view === "team" && !isRestricted && (
        <div className="mt-4 space-y-8">
          <section>
            <h3 className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Employee earnings
            </h3>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
              {employeeEarnings.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No earnings yet.</div>
              ) : (
                <div className="overflow-x-auto">
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
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Managers & commissions
            </h3>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
              {managerStats.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No managers yet. Grant a user the manager role to see their commissions here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Manager</th>
                        <th className="px-4 py-3">Accounts</th>
                        <th className="px-4 py-3">Weekly views</th>
                        <th className="px-4 py-3">Lifetime commission (10%)</th>
                        <th className="px-4 py-3">Already paid</th>
                        <th className="px-4 py-3">Unpaid balance</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managerStats.map((m) => (
                        <tr key={m.user_id} className="border-b border-hairline/60 last:border-0">
                          <td className="px-4 py-3 text-foreground">{m.email}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.accountsCount}</td>
                          <td className="px-4 py-3 text-muted-foreground">{fmt(m.weeklyViews)}</td>
                          <td className="px-4 py-3 text-foreground">{money(m.lifetimeCommissionCents)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{money(m.paid_baseline_cents)}</td>
                          <td className="px-4 py-3 font-medium text-lime">{money(m.unpaidCommissionCents)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => resetManagerCommission(m)}
                              disabled={m.unpaidCommissionCents === 0}
                              className="rounded-full border border-lime bg-lime-soft px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-lime disabled:opacity-40"
                            >
                              Mark paid & reset
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Employees
            </h3>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
              {employees.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No employees yet. Share the invite code with your team so they can sign up at /employee/login.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Manager</th>
                        <th className="px-4 py-3">Accounts</th>
                        <th className="px-4 py-3">Weekly views</th>
                        <th className="px-4 py-3">USDT address</th>
                        <th className="px-4 py-3">Network</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((e) => (
                        <tr key={e.user_id} className="border-b border-hairline/60 last:border-0">
                          <td className="px-4 py-3 text-foreground">{e.email}</td>
                          <td className="px-4 py-3">
                            <select
                              value={e.manager_user_id ?? ""}
                              onChange={async (ev) => {
                                const mgr = ev.target.value || null;
                                const { error } = await supabase.rpc("assign_employee_manager" as never, {
                                  _employee: e.user_id, _manager: mgr,
                                } as never);
                                if (error) { alert(error.message); return; }
                                await refresh();
                              }}
                              className="rounded-lg border border-hairline bg-background px-2 py-1 text-xs text-foreground"
                            >
                              <option value="">Unassigned</option>
                              {managers.map((m) => (
                                <option key={m.user_id} value={m.user_id}>{m.email}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{e.account_count}</td>
                          <td className="px-4 py-3 text-muted-foreground">{fmt(e.weekly_views)}</td>
                          <td className="px-4 py-3">
                            {e.usdt_address ? (
                              <button
                                onClick={() => { navigator.clipboard.writeText(e.usdt_address); }}
                                title="Click to copy"
                                className="font-mono text-xs text-foreground hover:text-lime break-all text-left"
                              >
                                {e.usdt_address}
                              </button>
                            ) : (
                              <span className="text-muted-foreground italic">Not set</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{e.usdt_network || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Weekly history
            </h3>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
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
                          <td className="px-4 py-3 text-foreground"><a className="hover:underline" href={`https://x.com/${h.x_username}`} target="_blank" rel="noreferrer">@{h.x_username}</a></td>
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
          </section>
        </div>
      )}

      {view === "team" && isManager && (
        <ManagerTeamPanel
          employees={myEmployees}
          codes={myInviteCodes}
          onChanged={refresh}
        />
      )}






      {(showAdd || editing) && (
        <AccountForm
          account={editing}
          userId={userId}
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

      {uploading && (
        <ScreenshotUploadModal
          account={uploading}
          userId={userId}
          onClose={() => setUploading(null)}
          onSaved={async () => {
            setUploading(null);
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

function WalletCard({
  userId,
  wallet,
  onSaved,
}: {
  userId: string | null;
  wallet: WalletRow | null;
  onSaved: (w: WalletRow) => void;
}) {
  const [address, setAddress] = useState(wallet?.usdt_address ?? "");
  const network = "ERC20";
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAddress(wallet?.usdt_address ?? "");
  }, [wallet]);

  const isValidEthAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());

  async function save() {
    if (!userId) return;
    const trimmed = address.trim();
    if (!isValidEthAddress(trimmed)) {
      setError("Enter a valid Ethereum (ERC20) address — starts with 0x and 42 characters long.");
      return;
    }
    setError(null);
    setSaving(true);
    const { data, error: err } = await (supabase
      .from("payout_wallets" as never) as unknown as {
        upsert: (v: unknown) => { select: (s: string) => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } };
      })
      .upsert({ user_id: userId, usdt_address: trimmed, network })
      .select("*")
      .single();
    setSaving(false);
    if (err) return alert(err.message);
    onSaved(data as unknown as WalletRow);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  return (
    <div className="mt-5 rounded-2xl border border-hairline bg-surface-1 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Payout wallet
          </div>
          <div className="mt-1 text-sm text-foreground">
            USDT address (Ethereum / ERC20 only)
          </div>
        </div>
        {savedFlash && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-lime">Saved</span>
        )}
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_160px_auto]">
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); if (error) setError(null); }}
          placeholder="0x… USDT (ERC20) address"
          className="rounded-lg border border-hairline bg-background px-3 py-2 font-mono text-xs text-foreground"
        />
        <div className="rounded-lg border border-hairline bg-background px-3 py-2 text-xs text-muted-foreground flex items-center">
          ERC20 (Ethereum)
        </div>
        <button
          onClick={save}
          disabled={saving || !address.trim() || address.trim() === (wallet?.usdt_address ?? "")}
          className="rounded-full border border-lime bg-lime-soft px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-lime disabled:opacity-40"
        >
          {saving ? "Saving…" : wallet?.usdt_address ? "Update" : "Save"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[11px] text-red-400">{error}</p>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Only USDT on the Ethereum (ERC20) network is supported. Payments sent on any other network cannot be recovered.
      </p>
    </div>
  );
}

/* ------------------------------ Screenshot upload ----------------------------- */

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function ScreenshotUploadModal({
  account,
  userId,
  onClose,
  onSaved,
}: {
  account: XAccount;
  userId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const runOcr = useServerFn(extractViewsFromScreenshot);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [detected, setDetected] = useState<number | null>(null);
  const [override, setOverride] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previousViews = account.current_views ?? 0;
  const finalViews = Math.max(0, Math.floor(Number(override) || 0));
  const gained = Math.max(0, finalViews - previousViews);
  const payout = payFromViews(gained, account.rate_cents_per_1k);

  async function handleFile(f: File) {
    setError(null);
    setFile(f);
    const dataUrl = await readAsDataUrl(f);
    setPreview(dataUrl);
    setOcrBusy(true);
    const res = await runOcr({ data: { imageDataUrl: dataUrl } });
    setOcrBusy(false);
    if (!res.ok) {
      setError(res.error);
      setDetected(null);
      return;
    }
    setDetected(res.views);
    setOverride(String(res.views));
  }

  async function confirm() {
    if (!file) return setError("Choose a screenshot first.");
    if (!override.trim()) return setError("Enter or confirm the view count.");
    if (finalViews < previousViews) {
      if (
        !confirm_(
          `New views (${fmt(finalViews)}) is lower than previous (${fmt(previousViews)}). Save anyway?`,
        )
      )
        return;
    }
    setSaving(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${account.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (up.error) throw new Error(up.error.message);
      const signed = await signedUrl(path);
      if (!signed) throw new Error("Could not sign uploaded screenshot URL.");

      const now = new Date().toISOString();
      const { error: accErr } = await supabase
        .from("x_tracker_accounts")
        .update({
          previous_views: previousViews,
          current_views: finalViews,
          views_gained_since_last: gained,
          payout_owed_cents: payout,
          last_refresh_at: now,
          last_updated: now,
          last_screenshot_upload_at: now,
          screenshot_url: path,
          status: "updated",
          status_message: null,
        })
        .eq("id", account.id);
      if (accErr) throw new Error(accErr.message);

      const { error: sErr } = await supabase.from("x_tracker_screenshots" as never).insert({
        account_id: account.id,
        x_username: account.x_username,
        employee_name: account.employee_name,
        previous_views: previousViews,
        new_views: finalViews,
        views_gained: gained,
        payout_cents: payout,
        rate_cents_per_1k: account.rate_cents_per_1k,
        screenshot_url: path,
        detected_views: detected,
        uploaded_at: now,
        added_by_user_id: userId,
      } as never);
      if (sErr) throw new Error(sErr.message);

      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function confirm_(msg: string) {
    return window.confirm(msg);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border border-hairline bg-background p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl text-foreground">
              Upload view screenshot — @{account.x_username}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Screenshot must show the total views/impressions of the pinned post. OCR will auto-fill the count — verify and edit before saving.
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border border-dashed border-hairline bg-surface-1 p-8 text-center hover:border-lime hover:text-lime"
            >
              {preview ? (
                <img src={preview} alt="preview" className="mx-auto max-h-64 rounded-xl object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">Click to choose a screenshot</span>
              )}
            </button>
            {file && (
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 w-full text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Replace image
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Detected by OCR
              </div>
              <div className="mt-1 font-display text-2xl text-foreground">
                {ocrBusy ? "Reading…" : detected !== null ? fmt(detected) : "—"}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Final view count (editable)
              </label>
              <input
                type="number"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-surface-1 px-3 py-2 text-lg text-foreground outline-none focus:border-lime"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Previous" value={fmt(previousViews)} />
              <MiniStat label="Gained" value={fmt(gained)} />
              <MiniStat label="Owed" value={money(payout)} accent />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={confirm}
            disabled={saving || ocrBusy || !file}
            className="flex-1 rounded-xl bg-lime py-3 font-display text-sm tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving…" : "Confirm & update payroll"}
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

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent ? "border-lime/40 bg-lime-soft" : "border-hairline bg-surface-1"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm ${accent ? "text-lime" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

/* -------------------------- Screenshot history view --------------------------- */

function ScreenshotHistory({ rows, hideMoney = false }: { rows: XScreenshot[]; hideMoney?: boolean }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paths = rows.map((r) => r.screenshot_url).filter(Boolean);
      const entries: [string, string][] = [];
      for (const p of paths) {
        if (urls[p]) continue;
        const u = await signedUrl(p);
        if (u) entries.push([p, u]);
      }
      if (!cancelled && entries.length) setUrls((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-hairline bg-surface-1 p-10 text-center text-sm text-muted-foreground">
        No screenshots uploaded yet. Upload one from the accounts tab.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-hairline bg-surface-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Previous</th>
                <th className="px-4 py-3">New</th>
                <th className="px-4 py-3">Gained</th>
                {!hideMoney && <th className="px-4 py-3">Owed</th>}

                <th className="px-4 py-3">Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const u = urls[r.screenshot_url];
                return (
                  <tr key={r.id} className="border-b border-hairline/60 last:border-0">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-foreground">@{r.x_username}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.employee_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(r.previous_views)}</td>
                    <td className="px-4 py-3 text-foreground">{fmt(r.new_views)}</td>
                    <td className="px-4 py-3 text-foreground">{fmt(r.views_gained)}</td>
                    {!hideMoney && <td className="px-4 py-3 text-lime">{money(r.payout_cents)}</td>}
                    <td className="px-4 py-3">
                      {u ? (
                        <button
                          onClick={() => setLightbox(u)}
                          className="block h-14 w-20 overflow-hidden rounded-md border border-hairline"
                        >
                          <img src={u} alt="screenshot" className="h-full w-full object-cover" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">loading…</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6"
        >
          <img src={lightbox} alt="screenshot" className="max-h-[90vh] max-w-[90vw] rounded-xl" />
        </div>
      )}
    </>
  );
}

/* -------------------------------- Account form -------------------------------- */

function AccountForm({
  account,
  userId,
  onClose,
  onSaved,
}: {
  account: XAccount | null;
  userId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!account;
  const runOcr = useServerFn(extractViewsFromScreenshot);
  const [profileUrl, setProfileUrl] = useState(account?.profile_url ?? "");
  const [contact, setContact] = useState(account?.employee_name ?? "");
  const [rate, setRate] = useState(String((account?.rate_cents_per_1k ?? 300) / 100));
  const [pinnedDate, setPinnedDate] = useState<string>(account?.pinned_post_date ?? "");
  const [pinnedUrl, setPinnedUrl] = useState<string>(account?.pinned_post_url ?? "");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(account?.screenshot_url ? null : null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [detected, setDetected] = useState<number | null>(null);
  const [views, setViews] = useState<string>(isEdit ? String(account?.current_views ?? 0) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setError(null);
    setFile(f);
    const dataUrl = await readAsDataUrl(f);
    setPreview(dataUrl);
    setOcrBusy(true);
    const res = await runOcr({ data: { imageDataUrl: dataUrl } });
    setOcrBusy(false);
    if (!res.ok) {
      setError(res.error);
      setDetected(null);
      return;
    }
    setDetected(res.views);
    setViews(String(res.views));
  }

  async function save() {
    setError(null);
    if (!profileUrl.trim()) return setError("X profile link required");
    const u = extractXUsername(profileUrl);
    if (!u) return setError("Enter a valid X profile link, e.g. https://x.com/username");
    if (!contact.trim()) return setError("Discord or Telegram username required");
    if (!pinnedDate) return setError("Pinned post date required — when did you pin the post?");
    if (!isEdit && !file) return setError("Upload a screenshot of the pinned post");
    const finalViews = Math.max(0, Math.floor(Number(views) || 0));

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const rateCents = Math.max(0, Math.round(Number(rate) * 100));

      let screenshotPath: string | null = account?.screenshot_url ?? null;
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const accountId = account?.id ?? crypto.randomUUID();
        const path = `${accountId}/${Date.now()}.${ext}`;
        const up = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type || undefined });
        if (up.error) throw new Error(up.error.message);
        screenshotPath = path;
      }

      if (isEdit && account) {
        const previous = account.current_views ?? 0;
        const gained = Math.max(0, finalViews - previous);
        const payout = payFromViews(gained, rateCents);
        const { error: uErr } = await supabase
          .from("x_tracker_accounts")
          .update({
            x_username: u,
            employee_name: contact.trim(),
            profile_url: `https://x.com/${u}`,
            pinned_post_date: pinnedDate || null,
            pinned_post_url: pinnedUrl.trim() || null,
            rate_cents_per_1k: rateCents,
            current_views: finalViews,
            previous_views: previous,
            views_gained_since_last: gained,
            payout_owed_cents: payout,
            screenshot_url: screenshotPath,
            last_updated: now,
            last_refresh_at: file ? now : account.last_refresh_at,
            last_screenshot_upload_at: file ? now : account.last_screenshot_upload_at,
            status: "updated",
            status_message: null,
          })
          .eq("id", account.id);
        if (uErr) throw new Error(uErr.message);
        if (file) {
          await supabase.from("x_tracker_screenshots" as never).insert({
            account_id: account.id,
            x_username: u,
            employee_name: contact.trim(),
            previous_views: previous,
            new_views: finalViews,
            views_gained: gained,
            payout_cents: payout,
            rate_cents_per_1k: rateCents,
            screenshot_url: screenshotPath!,
            detected_views: detected,
            uploaded_at: now,
            added_by_user_id: userId,
          } as never);
        }
      } else {
        const { data: inserted, error: iErr } = await supabase
          .from("x_tracker_accounts")
          .insert({
            x_username: u,
            employee_name: contact.trim(),
            profile_url: `https://x.com/${u}`,
            pinned_post_date: pinnedDate || null,
            pinned_post_url: pinnedUrl.trim() || null,
            rate_cents_per_1k: rateCents,
            current_views: finalViews,
            previous_views: 0,
            views_gained_since_last: 0,
            payout_owed_cents: 0,
            weekly_starting_views: 0,
            screenshot_url: screenshotPath,
            last_updated: now,
            last_refresh_at: now,
            last_screenshot_upload_at: now,
            status: "updated",
            added_by_user_id: userId,
          } as never)
          .select()
          .single();
        if (iErr) throw new Error(iErr.message);
        if (inserted && screenshotPath) {
          await supabase.from("x_tracker_screenshots" as never).insert({
            account_id: inserted.id,
            x_username: u,
            employee_name: contact.trim(),
            previous_views: 0,
            new_views: finalViews,
            views_gained: 0,
            payout_cents: 0,
            rate_cents_per_1k: rateCents,
            screenshot_url: screenshotPath,
            detected_views: detected,
            uploaded_at: now,
            added_by_user_id: userId,
          } as never);
        }
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
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
            {isEdit ? "Edit account" : "Add X account"}
          </h3>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <Input
            label="Discord or Telegram username"
            value={contact}
            onChange={setContact}
            placeholder="@handle"
          />
          <Input
            label="X profile link"
            value={profileUrl}
            onChange={setProfileUrl}
            placeholder="https://x.com/username"
          />
          <Input
            label="Pinned post link (optional)"
            value={pinnedUrl}
            onChange={setPinnedUrl}
            placeholder="https://x.com/username/status/..."
          />
          <Input
            label="Pinned post date (required)"
            value={pinnedDate}
            onChange={setPinnedDate}
            type="date"
          />
          <Input label="Rate ($/1k views)" value={rate} onChange={setRate} type="number" />

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pinned post screenshot {isEdit && "(optional — replaces current)"}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border border-dashed border-hairline bg-surface-1 p-6 text-center hover:border-lime hover:text-lime"
            >
              {preview ? (
                <img src={preview} alt="preview" className="mx-auto max-h-44 rounded-xl object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {isEdit ? "Click to upload a new screenshot" : "Click to upload screenshot"}
                </span>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-hairline bg-surface-1 p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              View count {ocrBusy ? "(reading…)" : detected !== null ? `(OCR detected ${fmt(detected)})` : ""}
            </div>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-hairline bg-background px-3 py-2 text-lg text-foreground outline-none focus:border-lime"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={save}
            disabled={saving || ocrBusy}
            className="flex-1 rounded-xl bg-lime py-3 font-display text-sm tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add account"}
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

function ManagerTeamPanel({
  employees,
  codes,
  onChanged,
}: {
  employees: EmployeeRow[];
  codes: InviteCodeRow[];
  onChanged: () => Promise<void> | void;
}) {
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  async function createCode() {
    setBusy(true);
    const { data, error } = await supabase.rpc("create_manager_invite_code" as never, { _label: label || null } as never);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setNewCode((data as unknown as string) ?? null);
    setLabel("");
    await onChanged();
  }

  async function deactivate(code: string) {
    if (!confirm(`Deactivate invite code ${code}?`)) return;
    const { error } = await supabase.rpc("deactivate_manager_invite_code" as never, { _code: code } as never);
    if (error) { alert(error.message); return; }
    await onChanged();
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
        <h3 className="font-display text-lg text-foreground">Invite codes</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Share a code with someone you want on your team. When they sign up at
          <span className="text-foreground"> /employee/login</span> and enter it, they'll be added to your roster automatically.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Label (optional)
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Batch A"
              className="w-full rounded-lg border border-hairline bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-lime"
            />
          </div>
          <button
            onClick={createCode}
            disabled={busy}
            className="rounded-full bg-lime px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {busy ? "…" : "Generate code"}
          </button>
        </div>

        {newCode && (
          <div className="mt-3 rounded-lg border border-lime/40 bg-lime-soft p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-lime">New code</div>
            <button
              onClick={() => navigator.clipboard.writeText(newCode)}
              className="mt-1 font-mono text-lg tracking-widest text-foreground hover:text-lime"
              title="Click to copy"
            >
              {newCode}
            </button>
          </div>
        )}

        {codes.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="py-2">Code</th>
                  <th className="py-2">Label</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code} className="border-b border-hairline/60 last:border-0">
                    <td className="py-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(c.code)}
                        className="font-mono text-xs text-foreground hover:text-lime"
                        title="Click to copy"
                      >
                        {c.code}
                      </button>
                    </td>
                    <td className="py-2 text-muted-foreground">{c.label || "—"}</td>
                    <td className="py-2 text-xs">
                      {c.active ? (
                        <span className="text-lime">Active</span>
                      ) : (
                        <span className="text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {c.active && (
                        <button
                          onClick={() => deactivate(c.code)}
                          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-hairline bg-surface-1 p-5">
        <h3 className="font-display text-lg text-foreground">Your team</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Employees who signed up with one of your codes. You see their tracked accounts under
          <span className="text-foreground"> Accounts</span>.
        </p>
        {employees.length === 0 ? (
          <div className="mt-4 rounded-lg border border-hairline bg-background p-6 text-center text-sm text-muted-foreground">
            No team members yet. Generate a code above and share it.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-hairline text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="py-2">Employee</th>
                  <th className="py-2">Accounts</th>
                  <th className="py-2">Weekly views</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.user_id} className="border-b border-hairline/60 last:border-0">
                    <td className="py-2 text-foreground">{e.email}</td>
                    <td className="py-2 text-muted-foreground">{e.account_count}</td>
                    <td className="py-2 text-muted-foreground">{fmt(e.weekly_views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// Admin sub-views: Overview / Employees / Payroll
// ============================================================

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

function isPaidForAccount(payments: XPayment[], accountId: string, currentViews: number): boolean {
  const last = payments
    .filter((p) => p.account_id === accountId)
    .sort((a, b) => (b.paid_at || "").localeCompare(a.paid_at || ""))[0];
  if (!last) return false;
  return last.views_paid >= currentViews;
}

function shortAddr(a: string | null | undefined): string {
  if (!a) return "";
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

function AddrCell({ address, network }: { address?: string | null; network?: string | null }) {
  if (!address) return <span className="text-muted-foreground italic">Not set</span>;
  return (
    <button
      type="button"
      title={`${address}${network ? ` (${network})` : ""} — click to copy`}
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(address); }}
      className="font-mono text-[11px] text-foreground hover:text-lime"
    >
      {shortAddr(address)}
    </button>
  );
}

type OverviewProps = {
  accounts: XAccount[];
  payments: XPayment[];
  employees: EmployeeRow[];
  managerLabelForAccount: (addedBy: string | null) => string | null;
  filterManager: string;
  setFilterManager: (v: string) => void;
  filterEmployee: string;
  setFilterEmployee: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  sortKey: string;
  setSortKey: (v: string) => void;
  onOpenEmployee: (name: string) => void;
  onUpload: (a: XAccount) => void;
};

function AdminOverview(props: OverviewProps) {
  const {
    accounts, payments, employees, managerLabelForAccount,
    filterManager, setFilterManager, filterEmployee, setFilterEmployee,
    filterStatus, setFilterStatus, sortKey, setSortKey, onOpenEmployee, onUpload,
  } = props;

  const walletByUid = new Map(employees.map((e) => [e.user_id, e] as const));

  const managerOptions = Array.from(
    new Set(accounts.map((a) => managerLabelForAccount(a.added_by_user_id)).filter(Boolean) as string[]),
  );
  const employeeOptions = Array.from(new Set(accounts.map((a) => a.employee_name).filter(Boolean)));

  let rows = accounts.filter((a) => {
    if (filterManager && managerLabelForAccount(a.added_by_user_id) !== filterManager) return false;
    if (filterEmployee && a.employee_name !== filterEmployee) return false;
    const paid = isPaidForAccount(payments, a.id, a.current_views);
    if (filterStatus === "paid" && !paid) return false;
    if (filterStatus === "unpaid" && paid) return false;
    return true;
  });

  rows = [...rows].sort((a, b) => {
    if (sortKey === "views") return b.current_views - a.current_views;
    if (sortKey === "gained") return (b.views_gained_since_last ?? 0) - (a.views_gained_since_last ?? 0);
    if (sortKey === "manager") {
      return (managerLabelForAccount(a.added_by_user_id) ?? "").localeCompare(
        managerLabelForAccount(b.added_by_user_id) ?? "",
      );
    }
    return a.employee_name.localeCompare(b.employee_name);
  });

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <select value={filterManager} onChange={(e) => setFilterManager(e.target.value)} className="rounded-lg border border-hairline bg-surface-1 px-3 py-1.5 text-xs">
          <option value="">All managers</option>
          {managerOptions.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className="rounded-lg border border-hairline bg-surface-1 px-3 py-1.5 text-xs">
          <option value="">All employees</option>
          {employeeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-hairline bg-surface-1 px-3 py-1.5 text-xs">
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="rounded-lg border border-hairline bg-surface-1 px-3 py-1.5 text-xs">
          <option value="employee">Sort: Employee</option>
          <option value="manager">Sort: Manager</option>
          <option value="views">Sort: Current views</option>
          <option value="gained">Sort: Views gained</option>
        </select>
      </div>

      <p className="text-[11px] text-muted-foreground">Quick monitoring view. Money details live in Payroll; profile &amp; screenshots live in Employees.</p>
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="min-w-full text-xs">
          <thead className="bg-surface-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Manager</th>
              <th className="px-3 py-2 text-left">X username</th>
              <th className="px-3 py-2 text-right">Current</th>
              <th className="px-3 py-2 text-right">Gained</th>
              <th className="px-3 py-2 text-left">Last upload</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const paid = isPaidForAccount(payments, a.id, a.current_views);
              const gained = a.views_gained_since_last ?? Math.max(0, a.current_views - (a.previous_views ?? 0));
              return (
                <tr key={a.id} className="border-t border-hairline">
                  <td className="px-3 py-2">
                    <button className="text-left underline-offset-2 hover:underline" onClick={() => onOpenEmployee(a.employee_name)}>{a.employee_name}</button>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{managerLabelForAccount(a.added_by_user_id) ?? "—"}</td>
                  <td className="px-3 py-2"><a className="hover:underline" href={a.profile_url} target="_blank" rel="noreferrer">@{a.x_username}</a></td>
                  <td className="px-3 py-2 text-right">{fmt(a.current_views)}</td>
                  <td className="px-3 py-2 text-right">{fmt(gained)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.last_screenshot_upload_at ? new Date(a.last_screenshot_upload_at).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${paid ? "bg-green-500/15 text-green-500" : "bg-yellow-500/15 text-yellow-600"}`}>
                      {paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="rounded-md border border-hairline px-2 py-1 text-[10px] hover:bg-surface-1" onClick={() => onUpload(a)}>Upload</button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No accounts match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type EmployeesProps = {
  accounts: XAccount[];
  employees: EmployeeRow[];
  screenshots: XScreenshot[];
  managers: ManagerRow[];
  managerLabelForAccount: (addedBy: string | null) => string | null;
  selected: string | null;
  setSelected: (v: string | null) => void;
  onUpload: (a: XAccount) => void;
  onEdit: (a: XAccount) => void;
};

function AdminEmployees(props: EmployeesProps) {
  const { accounts, employees, screenshots, managerLabelForAccount, selected, setSelected, onUpload, onEdit } = props;

  const walletByUid = new Map(employees.map((e) => [e.user_id, e] as const));

  // Group accounts by employee_name (contact label on the account)
  const names = Array.from(new Set(accounts.map((a) => a.employee_name))).sort();

  if (!selected) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-[11px] text-muted-foreground">Click an employee to see their profile, wallet, accounts &amp; screenshot history.</p>
        <div className="overflow-x-auto rounded-xl border border-hairline">
          <table className="min-w-full text-xs">
            <thead className="bg-surface-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-left">Manager</th>
                <th className="px-3 py-2 text-right">Accounts</th>
                <th className="px-3 py-2 text-right">Total views</th>
              </tr>
            </thead>
            <tbody>
              {names.map((n) => {
                const list = accounts.filter((a) => a.employee_name === n);
                const totalViews = list.reduce((s, a) => s + a.current_views, 0);
                const mgr = managerLabelForAccount(list[0]?.added_by_user_id ?? null);
                return (
                  <tr key={n} className="cursor-pointer border-t border-hairline hover:bg-surface-1" onClick={() => setSelected(n)}>
                    <td className="px-3 py-2 underline-offset-2 hover:underline">{n}</td>
                    <td className="px-3 py-2 text-muted-foreground">{mgr ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{list.length}</td>
                    <td className="px-3 py-2 text-right">{fmt(totalViews)}</td>
                  </tr>
                );
              })}
              {names.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No employees yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const list = accounts.filter((a) => a.employee_name === selected);
  // Lookup wallet by any added_by_user_id in this group (accounts added by the employee themselves)
  const uidForSelected = list.map((a) => a.added_by_user_id).find((u) => u && walletByUid.has(u)) ?? null;
  const empRow = (uidForSelected && walletByUid.get(uidForSelected)) || employees.find((e) => e.email === selected) || null;
  const shots = screenshots.filter((s) => s.employee_name === selected);

  return (
    <div className="mt-4 space-y-4">
      <button className="text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => setSelected(null)}>← Back to employees</button>

      <div className="rounded-xl border border-hairline p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Employee</div>
        <div className="mt-1 text-lg font-medium">{selected}</div>
        {empRow && (
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            <div>Auth email: {empRow.email}</div>
            <div>Manager: {empRow.manager_email ?? "—"}</div>
            <div>USDT address: {empRow.usdt_address || "—"}</div>
            <div>Network: {empRow.usdt_network || "—"}</div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-hairline">
        <div className="border-b border-hairline px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">X accounts</div>
        <table className="min-w-full text-xs">
          <thead className="bg-surface-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Pinned</th>
              <th className="px-3 py-2 text-left">Pinned date</th>
              <th className="px-3 py-2 text-right">Previous</th>
              <th className="px-3 py-2 text-right">Current</th>
              <th className="px-3 py-2 text-right">Gained</th>
              <th className="px-3 py-2 text-left">Starting</th>
              <th className="px-3 py-2 text-left">Last upload</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const gained = a.views_gained_since_last ?? Math.max(0, a.current_views - (a.previous_views ?? 0));
              return (
                <tr key={a.id} className="border-t border-hairline">
                  <td className="px-3 py-2"><a className="hover:underline" href={a.profile_url} target="_blank" rel="noreferrer">@{a.x_username}</a></td>
                  <td className="px-3 py-2">{a.pinned_post_url ? <a className="hover:underline" href={a.pinned_post_url} target="_blank" rel="noreferrer">Link</a> : "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.pinned_post_date ?? "—"}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{fmt(a.previous_views ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{fmt(a.current_views)}</td>
                  <td className="px-3 py-2 text-right">{fmt(gained)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{fmt(a.weekly_starting_views)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.last_screenshot_upload_at ? new Date(a.last_screenshot_upload_at).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button className="rounded-md border border-hairline px-2 py-1 text-[10px] hover:bg-surface-1" onClick={() => onUpload(a)}>Upload</button>
                    <button className="rounded-md border border-hairline px-2 py-1 text-[10px] hover:bg-surface-1" onClick={() => onEdit(a)}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-hairline">
        <div className="border-b border-hairline px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Screenshot history ({shots.length})</div>
        <ScreenshotHistory rows={shots} />
      </div>
    </div>
  );
}

type PayrollProps = {
  accounts: XAccount[];
  payments: XPayment[];
  employees: EmployeeRow[];
  managerLabelForAccount: (addedBy: string | null) => string | null;
  onChanged: () => void | Promise<void>;
  userId: string | null;
};

function AdminPayroll({ accounts, payments, employees, managerLabelForAccount, onChanged, userId }: PayrollProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const walletByUid = new Map(employees.map((e) => [e.user_id, e] as const));

  async function markPaid(a: XAccount) {
    setBusy(a.id);
    try {
      const lastPaid = payments
        .filter((p) => p.account_id === a.id)
        .sort((a2, b2) => (b2.paid_at || "").localeCompare(a2.paid_at || ""))[0];
      const periodStart = lastPaid?.paid_at ?? a.created_at;
      const viewsPaid = Math.max(0, a.current_views - (lastPaid?.views_paid ?? a.weekly_starting_views));
      const amount = payFromViews(viewsPaid, a.rate_cents_per_1k);
      const commission = Math.round(amount * MANAGER_COMMISSION_PCT);
      const { error } = await supabase.from("x_payments" as never).insert({
        account_id: a.id,
        employee_name: a.employee_name,
        x_username: a.x_username,
        period_start: periodStart ? new Date(periodStart).toISOString().slice(0, 10) : null,
        period_end: new Date().toISOString().slice(0, 10),
        views_paid: a.current_views,
        amount_cents: amount,
        manager_commission_cents: commission,
        marked_by: userId,
      } as never);
      if (error) throw new Error(error.message);
      await onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to mark paid");
    } finally {
      setBusy(null);
    }
  }

  const rows = accounts.map((a) => {
    const lastPaid = payments
      .filter((p) => p.account_id === a.id)
      .sort((a2, b2) => (b2.paid_at || "").localeCompare(a2.paid_at || ""))[0];
    const baseline = lastPaid?.views_paid ?? a.weekly_starting_views;
    const periodViews = Math.max(0, a.current_views - baseline);
    const amount = payFromViews(periodViews, a.rate_cents_per_1k);
    const commission = Math.round(amount * MANAGER_COMMISSION_PCT);
    return { a, periodViews, amount, commission, paid: periodViews === 0 && !!lastPaid };
  });

  return (
    <div className="mt-4 space-y-4">
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="min-w-full text-xs">
          <thead className="bg-surface-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Manager</th>
              <th className="px-3 py-2 text-left">X username</th>
              <th className="px-3 py-2 text-right">Views this period</th>
              <th className="px-3 py-2 text-right">Amount owed</th>
              <th className="px-3 py-2 text-right">Manager 10%</th>
              <th className="px-3 py-2 text-left">USDT (ERC20)</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ a, periodViews, amount, commission, paid }) => (
              <tr key={a.id} className="border-t border-hairline">
                <td className="px-3 py-2">{a.employee_name}</td>
                <td className="px-3 py-2 text-muted-foreground">{managerLabelForAccount(a.added_by_user_id) ?? "—"}</td>
                <td className="px-3 py-2"><a className="hover:underline" href={a.profile_url} target="_blank" rel="noreferrer">@{a.x_username}</a></td>
                <td className="px-3 py-2 text-right">{fmt(periodViews)}</td>
                <td className="px-3 py-2 text-right">{money(amount)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{money(commission)}</td>
                <td className="px-3 py-2"><AddrCell address={walletByUid.get(a.added_by_user_id ?? "")?.usdt_address} network={walletByUid.get(a.added_by_user_id ?? "")?.usdt_network} /></td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${paid ? "bg-green-500/15 text-green-500" : "bg-yellow-500/15 text-yellow-600"}`}>
                    {paid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    disabled={busy === a.id || periodViews === 0}
                    className="rounded-md border border-hairline px-2 py-1 text-[10px] hover:bg-surface-1 disabled:opacity-40"
                    onClick={() => markPaid(a)}
                  >
                    {busy === a.id ? "Saving…" : "Mark paid"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No accounts.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-hairline">
        <div className="border-b border-hairline px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Payment history ({payments.length})</div>
        <table className="min-w-full text-xs">
          <thead className="bg-surface-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Paid at</th>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">X username</th>
              <th className="px-3 py-2 text-right">Views @ payment</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-right">Manager 10%</th>
            </tr>
          </thead>
          <tbody>
            {[...payments].sort((a, b) => (b.paid_at || "").localeCompare(a.paid_at || "")).map((p) => (
              <tr key={p.id} className="border-t border-hairline">
                <td className="px-3 py-2 text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}</td>
                <td className="px-3 py-2">{p.employee_name}</td>
                <td className="px-3 py-2"><a className="hover:underline" href={`https://x.com/${p.x_username}`} target="_blank" rel="noreferrer">@{p.x_username}</a></td>
                <td className="px-3 py-2 text-right">{fmt(p.views_paid)}</td>
                <td className="px-3 py-2 text-right">{money(p.amount_cents)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{money(p.manager_commission_cents)}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No payments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
