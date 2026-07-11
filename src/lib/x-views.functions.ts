import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/x";

function extractTweetId(url: string): string | null {
  const m = url.match(/status\/(\d+)/);
  return m ? m[1] : null;
}

export const fetchXViews = createServerFn({ method: "POST" })
  .inputValidator((data: { pinnedPostUrl: string | null }) => data)
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const xKey = process.env.X_API_KEY;

    if (!lovableKey || !xKey) {
      return {
        ok: false as const,
        configured: false as const,
        error:
          "Automatic refresh unavailable — X API is not connected. Connect the X connector to enable refreshes.",
      };
    }

    if (!data.pinnedPostUrl) {
      return {
        ok: false as const,
        configured: true as const,
        error: "No pinned post URL set for this account.",
      };
    }

    const tweetId = extractTweetId(data.pinnedPostUrl);
    if (!tweetId) {
      return {
        ok: false as const,
        configured: true as const,
        error: "Could not parse tweet ID from pinned post URL.",
      };
    }

    try {
      const res = await fetch(
        `${GATEWAY_URL}/2/tweets/${tweetId}?tweet.fields=public_metrics,non_public_metrics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": xKey,
          },
        },
      );
      const body = await res.text();
      if (!res.ok) {
        return {
          ok: false as const,
          configured: true as const,
          error: `X API ${res.status}: ${body.slice(0, 200)}`,
        };
      }
      const json = JSON.parse(body) as {
        data?: {
          public_metrics?: { impression_count?: number };
          non_public_metrics?: { impression_count?: number };
        };
      };
      const views =
        json.data?.non_public_metrics?.impression_count ??
        json.data?.public_metrics?.impression_count;
      if (typeof views !== "number") {
        return {
          ok: false as const,
          configured: true as const,
          error:
            "X API returned no impression_count. Views are only available for tweets authored by the connected account.",
        };
      }
      return { ok: true as const, configured: true as const, views };
    } catch (e) {
      return {
        ok: false as const,
        configured: true as const,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });
