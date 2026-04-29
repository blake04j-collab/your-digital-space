## Goal

Create a private "link in bio" landing page hosted on your own site at an obscure URL, so you can replace your paid Linktree. Only people who get the link from your Instagram bio can find it — it won't be linked from your main site and won't be indexed by Google.

## URL

I'll use a slightly obscured slug so it's not guessable:

- `https://b1scale.com/l/b1btc`

You'd put this in your Instagram bio instead of `linktr.ee/b1btc`. (If you want a different slug like `/bio`, `/b1`, or something custom, tell me and I'll swap it.)

## What the page will contain (mirrors your current Linktree)

- Avatar image (your current IMG-8707.jpeg from Linktree, re-hosted in the project)
- Heading: **B1**
- Tagline: **i ♡ scaling**
- Featured CTA card → **Connecting creators with brands** → links to `/` (your main creator landing page)
- Link buttons:
  - Instagram → https://www.instagram.com/b1btc
  - TikTok → (need URL — see question below)
  - X → https://x.com/b1btc
- Bottom button: **For Creators →** also linking to `/` so visitors can reach the main site

## Privacy / "hidden" measures

1. **No nav links** to this page anywhere on the site (Nav, Footer, Hero — none of them will reference it).
2. **`noindex, nofollow` meta tags** on the page so Google/Bing won't list it in search results.
3. **Add `Disallow: /l/` to `robots.txt`** so well-behaved crawlers skip it.
4. **Excluded from `sitemap.xml`** if/when one exists.

Important honest caveat: anyone who has the URL can visit it (same as Linktree). If you want true gating (password, email login), that's a different feature — let me know and I'll add it. Otherwise the obscure-URL + noindex approach is the standard "unlisted" pattern.

## Design

Match your existing site's dark + lime aesthetic (same tokens as the rest of the site — `bg-background`, `text-foreground`, `bg-lime`, `font-display`) so it feels on-brand instead of generic Linktree. Centered single-column layout, rounded buttons, subtle hover states, mobile-first.

## Technical changes

- **New route file**: `src/routes/l.b1btc.tsx` (TanStack flat-file routing → `/l/b1btc`)
  - Sets `head()` with `<meta name="robots" content="noindex, nofollow">`
  - Renders the link page component
- **New component**: `src/components/site/LinkInBio.tsx` — the visual layout (avatar, name, tagline, link buttons)
- **Avatar asset**: download your current Linktree avatar to `src/assets/b1-avatar.jpg` and import it
- **`public/robots.txt`**: create or update to add `Disallow: /l/`

No backend, no database, no auth — purely static content under an unlisted URL.

## One question before I build

What's your **TikTok URL**? Your Linktree shows a TikTok button but no link was attached. If you don't want TikTok on it, I'll just leave it off.

Also: are there any **other links** you want on this page that aren't on your current Linktree (e.g. YouTube, email, Telegram, a specific offer)?
