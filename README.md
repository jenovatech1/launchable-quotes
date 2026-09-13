# Launchable Quotes Live

Free tools for [StonkFun](https://www.stonkfun.xyz) by **@jenovatech** / **jenovatech1**.

1. **Launchable Quotes** (`/`) — live launchable quote pairs from the public API, and a callout for the UI↔API mismatch (launch screen can claim no xStocks while the API already returns them).
2. **Graduated Tokens** (`/graduated`) — just-graduated list sorted by `graduatedAt` (newest first), with quote/pair filters and pagination. StonkFun’s native UI has Newest/mcap/volume but no Graduated tab.

## Features (MVP)

- Mobile-first pages (phone and desktop)
- Live fetch from StonkFun public API (no API key)
- Launchable list: symbol, name, mint, category, launchable / lab-ready / ambiguous badges
- Graduated list: token info, quote badge, mcap/vol, graduated time, StonkFun / Dex / Raydium links
- Search and category/quote filters; graduated page paginates (does not dump 1800+ rows)
- Clear empty/error states — never invents fake data
- No auth, wallet, websockets, sniper, alerts, history, or portfolio

## Routes

| Path | Page |
|------|------|
| `/` | Launchable Quotes Live |
| `/graduated` | Just graduated tokens |

On GitHub Pages the app is served under `/launchable-quotes/`, so the live graduated URL is:

`https://jenovatech1.github.io/launchable-quotes/graduated`

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build → dist/ (+ 404.html for GH Pages SPA)
npm run preview  # serve dist locally
```

## API

Base: `https://www.stonkfun.xyz/api/public/v1` (prefer **www** — bare host can hang/redirect).

| Item | Value |
|------|--------|
| Launchable pairs | `GET /pairs?launchable=true` |
| Graduated tokens | `GET /tokens?status=graduated&sort=newest&page=1&pageSize=25` |
| Quote filter | `quoteMint=<mint>` and/or `category=xstock` (etc.) |
| Token search | `q=<name\|symbol\|mint>` |
| Auth | None |
| CORS | `access-control-allow-origin: *` |

### Quirks observed

- Prefer **`www.stonkfun.xyz`** — bare `stonkfun.xyz` may 308-redirect or hang.
- Responses are wrapped (`data.pairs` / `data.tokens` + `data.pagination`), not bare arrays.
- `launchable=true` still returns many categories (`custom`, `backpack`, `xstock`, …), not only xStocks.
- Some pairs have `launchLabReady: false` while still `launchable: true`.
- `logoUrl` / `imageUrl` may be site-relative; this app prefixes `https://www.stonkfun.xyz`.
- Graduated default sort on the API without `sort=newest` is marketCap; this app always requests `sort=newest`.
- Rate limit headers are exposed (`X-RateLimit-*`). Launchable page refreshes ~30s; graduated loads on filter/page change.
- If the API is down or the shape changes, the UI shows a clear failure — it never invents fake rows.

## Deploy

### Option A — Vercel (recommended, one click)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **`jenovatech1/launchable-quotes`**
3. Framework preset: **Vite** (defaults are fine: `npm run build`, output `dist`)
4. Deploy → you get a public URL like `https://launchable-quotes.vercel.app`

`vercel.json` is already in the repo for SPA routing.

### Option B — Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
2. Select this repo
3. Build command: `npm run build` · Output directory: `dist`
4. Deploy

### Option C — GitHub Pages

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` (workflow: `.github/workflows/deploy-pages.yml`)
3. Site URL: `https://jenovatech1.github.io/launchable-quotes/`
4. Graduated: `https://jenovatech1.github.io/launchable-quotes/graduated`

The workflow sets `VITE_BASE=/launchable-quotes/` so asset paths match the project site. Build also emits `404.html` (copy of `index.html`) so deep links work on Pages.

## Project layout

```
src/
  api/stonkfun.ts              # public API client
  pages/LaunchableQuotesPage.tsx
  pages/GraduatedTokensPage.tsx
  components/                  # shell, rows, mismatch callout
  types/
  lib/format.ts
```

Add new tools as additional routes under `src/pages/` and wire them in `src/App.tsx`.
