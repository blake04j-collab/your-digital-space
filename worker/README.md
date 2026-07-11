# X Scraper Worker

Standalone Playwright service that opens tweet URLs, reads the public "Views"
count, and returns it as JSON. The Cloud Agency admin dashboard calls this
service manually when you click **Refresh views**. No automatic scheduling.

> ⚠️ Reading counts by driving a real browser is not endorsed by X's Terms of
> Service. Use it on accounts you control, keep request volume low, and
> assume the login session may be flagged and require re-login.

---

## Endpoints

All routes except `/health` require `Authorization: Bearer $SCRAPER_SECRET`.

- `GET  /health` → `{ ok, hasSession, sessionPath }`
- `POST /scrape` body `{ "postUrl": "https://x.com/handle/status/1234" }`
  → `{ ok: true, views: 12345, scrapedAt }` on success,
  `{ ok: false, error }` on failure.

Scrape jobs are serialised — one browser context at a time.

---

## Local dev

```bash
cd worker
npm install
export SCRAPER_SECRET=devsecret
export SESSION_PATH=./x-session.json
npm run login          # opens Chromium, log into X, press Enter to save
npm start              # listens on :8787
```

Test:

```bash
curl -X POST http://localhost:8787/scrape \
  -H "Authorization: Bearer devsecret" \
  -H "Content-Type: application/json" \
  -d '{"postUrl":"https://x.com/xdevelopers/status/1798670820343771617"}'
```

---

## Deployment (Fly.io recommended — has persistent volumes for the session file)

```bash
cd worker
fly launch --no-deploy --name x-scraper --dockerfile Dockerfile
fly volumes create x_session --size 1
fly secrets set SCRAPER_SECRET=$(openssl rand -hex 32)
fly deploy
```

Add this to your `fly.toml`:

```toml
[mounts]
source = "x_session"
destination = "/data"

[[services]]
internal_port = 8787
protocol = "tcp"
[[services.ports]]
handlers = ["http", "tls"]
port = 443
```

Upload the session file you created locally:

```bash
fly ssh sftp shell
> put x-session.json /data/x-session.json
```

Then in **Lovable → Project Settings → Secrets** set:

- `X_SCRAPER_URL` = `https://x-scraper.fly.dev`
- `X_SCRAPER_SECRET` = the same value you passed to `fly secrets set`

Any host that runs Docker with a persistent volume works: Railway, Render,
a small VPS, etc. The two env vars the app needs are the same everywhere.

---

## Refreshing the session

X logs sessions out periodically. When `/scrape` starts failing with
"login wall" errors, re-run `npm run login` locally and re-upload
`x-session.json` to `/data/x-session.json`.
