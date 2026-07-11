/**
 * One-time login helper.
 * Run locally: `npm install && npm run login`
 * A Chromium window opens — log in to x.com manually (2FA, captcha, whatever),
 * then press Enter in this terminal. The session is saved to ./x-session.json.
 *
 * Upload x-session.json to the deployed worker's persistent volume at
 * SESSION_PATH (default /data/x-session.json). Re-run this monthly or when the
 * scraper starts failing with "login wall" errors.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import readline from "node:readline";

const OUT = process.env.SESSION_OUT || "./x-session.json";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto("https://x.com/login");
console.log("\nLog in to X in the opened browser window (username, password, 2FA).");
console.log("Once you're on your home timeline, come back here.\n");
await ask("Press Enter to save the session and quit… ");

await context.storageState({ path: OUT });
console.log(`\nSaved session to ${OUT} (${fs.statSync(OUT).size} bytes)`);

await browser.close();
rl.close();
