import express from "express";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const PORT = process.env.PORT || 8787;
const SECRET = process.env.SCRAPER_SECRET;
const SESSION_PATH = process.env.SESSION_PATH || "/data/x-session.json";
const NAV_TIMEOUT_MS = Number(process.env.NAV_TIMEOUT_MS || 45000);

if (!SECRET) {
  console.error("Missing SCRAPER_SECRET env var. Refusing to start.");
  process.exit(1);
}

if (!fs.existsSync(SESSION_PATH)) {
  console.warn(
    `[warn] No stored session at ${SESSION_PATH}. Run \`npm run login\` first, or mount an existing storageState file there.`,
  );
}

// Serialise scrape jobs — one browser context at a time keeps memory low and
// avoids parallel X rate limits.
let queue = Promise.resolve();
function enqueue(job) {
  const run = queue.then(job, job);
  queue = run.catch(() => {});
  return run;
}

/**
 * Parse counts X displays like "1,234", "1.2K", "3.4M".
 */
function parseCount(raw) {
  if (!raw) return null;
  const s = raw.trim().replace(/,/g, "");
  const m = s.match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const mult = m[2]?.toUpperCase();
  if (mult === "K") return Math.round(n * 1_000);
  if (mult === "M") return Math.round(n * 1_000_000);
  if (mult === "B") return Math.round(n * 1_000_000_000);
  return Math.round(n);
}

/**
 * Open a single tweet page and read the public "Views" count.
 * X shows this on the tweet detail page for any public post — no analytics
 * page or authorship needed. Login state still helps to bypass the anonymous
 * login wall X now shows for many pages.
 */
async function scrapePostViews(context, postUrl) {
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT_MS);
  try {
    await page.goto(postUrl, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });

    // Wait for the tweet article to render
    await page
      .waitForSelector('article[data-testid="tweet"], article[role="article"]', {
        timeout: NAV_TIMEOUT_MS,
      })
      .catch(() => {});

    // Strategy 1: analytics link "1,234 Views"
    const viewsLink = page
      .locator('a[href$="/analytics"]')
      .filter({ hasText: /view/i })
      .first();
    if (await viewsLink.count()) {
      const txt = (await viewsLink.innerText().catch(() => "")).trim();
      const m = txt.match(/([\d.,]+\s*[KMB]?)\s*view/i);
      const n = parseCount(m?.[1] ?? txt);
      if (typeof n === "number") return n;
    }

    // Strategy 2: aria-label "N Views"
    const ariaMatch = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("*"));
      for (const el of all) {
        const label = el.getAttribute && el.getAttribute("aria-label");
        if (!label) continue;
        const m = label.match(/([\d.,]+)\s*(?:K|M|B)?\s*view/i);
        if (m) return m[0];
      }
      return null;
    });
    if (ariaMatch) {
      const m = ariaMatch.match(/([\d.,]+\s*[KMB]?)/i);
      const n = parseCount(m?.[1] ?? ariaMatch);
      if (typeof n === "number") return n;
    }

    throw new Error(
      "Could not locate view count on the page. The account may be private, the post may be deleted, or X may be showing a login wall (refresh the stored session).",
    );
  } finally {
    await page.close().catch(() => {});
  }
}

const app = express();
app.use(express.json({ limit: "128kb" }));

app.use((req, res, next) => {
  if (req.path === "/health") return next();
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== SECRET) return res.status(401).json({ ok: false, error: "unauthorized" });
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    hasSession: fs.existsSync(SESSION_PATH),
    sessionPath: SESSION_PATH,
  });
});

app.post("/scrape", async (req, res) => {
  const postUrl = String(req.body?.postUrl || "").trim();
  if (!/^https?:\/\/(www\.)?(x|twitter)\.com\/.+\/status\/\d+/i.test(postUrl)) {
    return res.status(400).json({ ok: false, error: "postUrl must be a full X status URL" });
  }

  try {
    const views = await enqueue(async () => {
      const browser = await chromium.launch({ headless: true });
      try {
        const contextOptions = {
          viewport: { width: 1280, height: 1800 },
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        };
        if (fs.existsSync(SESSION_PATH)) contextOptions.storageState = SESSION_PATH;
        const context = await browser.newContext(contextOptions);
        try {
          return await scrapePostViews(context, postUrl);
        } finally {
          await context.close();
        }
      } finally {
        await browser.close();
      }
    });

    res.json({ ok: true, views, scrapedAt: new Date().toISOString() });
  } catch (e) {
    console.error("[scrape] failed:", e?.message || e);
    res.status(500).json({ ok: false, error: e?.message || "scrape failed" });
  }
});

app.listen(PORT, () => {
  const dir = path.dirname(SESSION_PATH);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  console.log(`X scraper worker listening on :${PORT}`);
});
