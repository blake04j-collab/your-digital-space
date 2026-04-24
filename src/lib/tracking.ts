import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "b1_ref";
const CLICK_SENT_KEY = "b1_ref_click_sent";
const VIEW_SENT_KEY = "b1_view_sent";

/** Read the current attribution ref code (if any) from sessionStorage. */
export function getStoredRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * On landing: if ?ref= is present, persist it and record a click (once per session per code).
 * Safe to call multiple times — guarded against double inserts.
 */
export async function captureRefFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref");
  if (!ref) return;

  const code = ref.trim().slice(0, 100);
  if (!code) return;

  try {
    sessionStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore
  }

  // Only record one click per browser session per code
  const sentKey = `${CLICK_SENT_KEY}:${code}`;
  let alreadySent = false;
  try {
    alreadySent = sessionStorage.getItem(sentKey) === "1";
  } catch {
    // ignore
  }
  if (alreadySent) return;

  try {
    sessionStorage.setItem(sentKey, "1");
  } catch {
    // ignore
  }

  await supabase.from("link_clicks").insert({
    code,
    referrer: document.referrer ? document.referrer.slice(0, 2000) : null,
    user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 1000) : null,
  });
}

/**
 * Record a single page view for the current path.
 * Deduped per path within the same browser session.
 */
export async function trackPageView(path?: string) {
  if (typeof window === "undefined") return;
  const p = (path ?? window.location.pathname ?? "/").slice(0, 500);
  const sentKey = `${VIEW_SENT_KEY}:${p}`;
  try {
    if (sessionStorage.getItem(sentKey) === "1") return;
    sessionStorage.setItem(sentKey, "1");
  } catch {
    // ignore
  }
  try {
    await supabase.from("page_views").insert({
      path: p,
      referrer: document.referrer ? document.referrer.slice(0, 2000) : null,
      user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 1000) : null,
    });
  } catch {
    // ignore
  }
}
