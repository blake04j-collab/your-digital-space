import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Reserved top-level paths that must NOT be treated as ref codes.
// Keep this in sync with real routes under src/routes/.
const RESERVED = new Set(["admin", "api", "assets", "favicon.ico", "robots.txt", "sitemap.xml"]);

const STORAGE_KEY = "b1_ref";
const CLICK_SENT_KEY = "b1_ref_click_sent";

export const Route = createFileRoute("/$ref")({
  beforeLoad: ({ params }) => {
    const code = (params.ref ?? "").trim();
    // If it's reserved or empty/invalid, send to home (TanStack will already
    // match real routes first, but this is a safety net).
    if (!code || RESERVED.has(code.toLowerCase()) || code.length > 100) {
      throw redirect({ to: "/" });
    }
  },
  component: RefRedirect,
});

function RefRedirect() {
  const { ref } = Route.useParams();

  useEffect(() => {
    const code = (ref ?? "").trim().slice(0, 100);
    if (!code) {
      window.location.replace("/");
      return;
    }

    let destination = "/";

    (async () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, code);
      } catch {
        // ignore
      }

      // Look up tracking link to honor a custom destination if set
      try {
        const { data } = await supabase
          .from("tracking_links")
          .select("destination, archived")
          .eq("code", code)
          .maybeSingle();
        if (data && !data.archived && data.destination && /^https?:\/\//.test(data.destination)) {
          destination = data.destination;
        }
      } catch {
        // ignore — fall back to home
      }

      // Record one click per session per code
      const sentKey = `${CLICK_SENT_KEY}:${code}`;
      let alreadySent = false;
      try {
        alreadySent = sessionStorage.getItem(sentKey) === "1";
      } catch {
        // ignore
      }
      if (!alreadySent) {
        try {
          sessionStorage.setItem(sentKey, "1");
        } catch {
          // ignore
        }
        try {
          await supabase.from("link_clicks").insert({
            code,
            referrer: document.referrer ? document.referrer.slice(0, 2000) : null,
            user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 1000) : null,
          });
        } catch {
          // ignore
        }
      }

      window.location.replace(destination);
    })();
  }, [ref]);

  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <p className="text-sm">Redirecting…</p>
    </div>
  );
}
