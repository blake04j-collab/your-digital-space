import { createServerFn } from "@tanstack/react-start";

/**
 * OCR a screenshot of an X (Twitter) post to extract the "Views"/impressions
 * count. Uses the Lovable AI Gateway with a Gemini vision model — no API keys
 * from the user, no third-party workers.
 *
 * Input: a data URL (data:image/...;base64,...) or an https URL to an image.
 * Output: the detected integer view count, or an error.
 */
export const extractViewsFromScreenshot = createServerFn({ method: "POST" })
  .inputValidator((data: { imageDataUrl: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        ok: false as const,
        error:
          "AI OCR is not configured on this project. Enter the view count manually.",
      };
    }

    const url = data.imageDataUrl?.trim();
    if (!url || !(url.startsWith("data:image/") || /^https?:\/\//i.test(url))) {
      return { ok: false as const, error: "Invalid image data provided." };
    }

    const prompt = [
      "You are reading a screenshot of an X (Twitter) post.",
      "Find the total VIEWS / IMPRESSIONS count for the post (the number labelled 'Views', 'Impressions', or shown next to the eye/📊 icon on the post — NOT likes, reposts, replies, or bookmarks).",
      "The number may be formatted like '12,345' or abbreviated like '1.2K', '3.4M', '2.1B'. Convert abbreviations to the full integer.",
      "Reply with ONLY a compact JSON object of the form: {\"views\": <integer>} — no prose, no code fences.",
      "If you truly cannot find a views/impressions figure, reply with {\"views\": null}.",
    ].join("\n");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      const bodyText = await res.text();
      if (res.status === 429) {
        return {
          ok: false as const,
          error: "AI rate limit reached. Try again in a moment or enter the number manually.",
        };
      }
      if (res.status === 402) {
        return {
          ok: false as const,
          error: "AI credits exhausted. Add credits or enter the number manually.",
        };
      }
      if (!res.ok) {
        return {
          ok: false as const,
          error: `OCR request failed (${res.status}). Enter the number manually.`,
        };
      }

      const json = JSON.parse(bodyText) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      let parsed: { views?: number | null } = {};
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const m = cleaned.match(/(-?\d[\d,\.]*)\s*([KMB])?/i);
        if (m) {
          const n = parseFloat(m[1].replace(/,/g, ""));
          const mult = m[2]?.toUpperCase();
          const mv = mult === "K" ? 1_000 : mult === "M" ? 1_000_000 : mult === "B" ? 1_000_000_000 : 1;
          parsed = { views: Math.round(n * mv) };
        }
      }

      const views = parsed?.views;
      if (typeof views !== "number" || !Number.isFinite(views) || views < 0) {
        return {
          ok: false as const,
          error: "Couldn't detect a view count in that screenshot. Enter it manually.",
        };
      }

      return { ok: true as const, views: Math.round(views) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Unknown OCR error",
      };
    }
  });
