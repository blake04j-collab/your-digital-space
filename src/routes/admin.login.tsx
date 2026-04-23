import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin · B1" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-md bg-lime font-display text-2xl text-primary-foreground shadow-lime">
            B1
          </div>
          <h1 className="font-display text-3xl tracking-wider text-foreground">Admin Access</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-hairline bg-surface-1 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-light text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-background px-3.5 py-3 text-sm text-foreground outline-none focus:border-lime"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-light text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-background px-3.5 py-3 text-sm text-foreground outline-none focus:border-lime"
              placeholder="••••••••"
            />
          </div>

          {err && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime py-3.5 font-display text-base tracking-[0.2em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "…" : mode === "signin" ? "Sign In ›" : "Create Account ›"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Need to create the admin account?" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
