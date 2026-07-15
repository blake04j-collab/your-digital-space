import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import XTrackerPanel from "@/components/admin/XTrackerPanel";

export const Route = createFileRoute("/employee/")({
  head: () => ({
    meta: [
      { title: "Employee Dashboard · Cloud Agency" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) { navigate({ to: "/employee/login" }); return; }
      setEmail(user.email ?? null);
      const { data: isEmployee } = await supabase.rpc("has_role" as never, {
        _user_id: user.id,
        _role: "employee",
      } as never);
      if (!isEmployee) { setDenied(true); return; }
      setReady(true);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/employee/login" });
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-background grid place-items-center px-5">
        <div className="max-w-md rounded-2xl border border-hairline bg-surface-1 p-8 text-center">
          <h1 className="font-display text-2xl text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account isn't registered as an employee. Sign up with your invite code, or sign in with the right account.
          </p>
          <button
            onClick={signOut}
            className="mt-6 rounded-full border border-hairline bg-surface-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-hairline bg-surface-1">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Cloud Agency</p>
            <h1 className="font-display text-xl text-foreground">Employee Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
            <button
              onClick={signOut}
              className="rounded-full border border-hairline bg-surface-2 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <XTrackerPanel role="employee" />
      </main>
    </div>
  );
}
