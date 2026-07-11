import { createServerFn } from "@tanstack/react-start";

/**
 * Calls the external Playwright scraper worker (self-hosted service, see /worker).
 * Requires two env vars on the server:
 *   - X_SCRAPER_URL     e.g. https://x-scraper.fly.dev
 *   - X_SCRAPER_SECRET  shared secret matching the worker's SCRAPER_SECRET
 */
export const fetchXViews = createServerFn({ method: "POST" })
  .inputValidator((data: { pinnedPostUrl: string | null }) => data)
  .handler(async ({ data }) => {
    const url = process.env.X_SCRAPER_URL;
    const secret = process.env.X_SCRAPER_SECRET;

    if (!url || !secret) {
      return {
        ok: false as const,
        configured: false as const,
        error:
          "Automatic refresh unavailable — Playwright scraper worker is not configured. Deploy the /worker service and set X_SCRAPER_URL and X_SCRAPER_SECRET.",
      };
    }

    if (!data.pinnedPostUrl) {
      return {
        ok: false as const,
        configured: true as const,
        error: "No pinned post URL set for this account.",
      };
    }

    try {
      const res = await fetch(`${url.replace(/\/$/, "")}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ postUrl: data.pinnedPostUrl }),
        // Playwright scrape can take a while; server fn has no built-in timeout,
        // rely on the worker to enforce its own.
      });

      const text = await res.text();
      if (!res.ok) {
        return {
          ok: false as const,
          configured: true as const,
          error: `Scraper ${res.status}: ${text.slice(0, 300)}`,
        };
      }

      const json = JSON.parse(text) as { ok: boolean; views?: number; error?: string };
      if (!json.ok || typeof json.views !== "number") {
        return {
          ok: false as const,
          configured: true as const,
          error: json.error ?? "Scraper returned no view count.",
        };
      }

      return { ok: true as const, configured: true as const, views: json.views };
    } catch (e) {
      return {
        ok: false as const,
        configured: true as const,
        error: e instanceof Error ? e.message : "Unknown scraper error",
      };
    }
  });
