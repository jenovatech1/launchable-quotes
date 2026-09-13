# Graduated · StonkFun board

Unofficial free tool for [StonkFun](https://www.stonkfun.xyz) by **@jenovatech** / **jenovatech1**.

Just-graduated and newly created StonkFun token boards (newest first), with quote/pair filters and a dense card grid. Clicking a card opens the official StonkFun token page.

## Features

- Front page (`/`) = graduated tokens card board
- `/new` = not-yet-graduated tokens with **graduation progress** (% done + % left) from the API
- Mobile-friendly 1 / 2 / 3 column cards (image, symbol, mcap, volume, quote badge, graduated time)
- Quote / pair filter + category pills + pagination
- Card click opens the StonkFun token page (new tab)
- Live fetch from StonkFun public API (no API key)
- Clear empty/error states — never invents fake data
- No auth, wallet, websockets, sniper, alerts, history, portfolio, or in-app token detail

## Routes

| Path | Page |
|------|------|
| `/` | Graduated tokens board |
| `/new` | New tokens + graduation progress |
| `/graduated` | Redirects to `/` (legacy) |
| `/token/:mint` | Redirects to StonkFun token page (legacy) |

On GitHub Pages the app is served under `/launchable-quotes/` (repo path kept for now):

- `https://jenovatech1.github.io/launchable-quotes/`

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
| Graduated tokens | `GET /tokens?status=graduated&sort=newest&page=1&pageSize=24` |
| New (bonding) tokens | `GET /tokens?status=new&sort=newest&page=1&pageSize=24` (includes `graduationProgress` 0–1) |
| Quote pairs (filters) | `GET /pairs` |
| Quote filter | `quoteMint=<mint>` and/or `category=xstock` (etc.) |
| Token search | `q=<name\|symbol\|mint>` |
| Auth | None |
| CORS | `access-control-allow-origin: *` |

### Quirks observed

- Prefer **`www.stonkfun.xyz`** — bare `stonkfun.xyz` may 308-redirect or hang.
- Responses are wrapped (`data.tokens` / `data.pairs` + `data.pagination`), not bare arrays.
- `logoUrl` / `imageUrl` may be site-relative; this app prefixes `https://www.stonkfun.xyz`.
- Graduated default sort on the API without `sort=newest` is marketCap; this app always requests `sort=newest`.
- If the API is down or the shape changes, the UI shows a clear failure — it never invents fake rows.

## Deploy

### Option A — Vercel

1. Import **`jenovatech1/launchable-quotes`**
2. Framework preset: **Vite**
3. Deploy

`vercel.json` is already in the repo for SPA routing.

### Option B — Cloudflare Pages

Build command: `npm run build` · Output directory: `dist`

### Option C — GitHub Pages

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` (workflow: `.github/workflows/deploy-pages.yml`)
3. Site URL: `https://jenovatech1.github.io/launchable-quotes/`

The workflow sets `VITE_BASE=/launchable-quotes/` so asset paths match the project site. Build also emits `404.html` (copy of `index.html`) so deep links work on Pages.

## Project layout

```
src/
  api/stonkfun.ts              # public API client
  pages/GraduatedTokensPage.tsx
  components/                  # shell, token cards
  types/
  lib/format.ts
```

Add new tools as additional routes under `src/pages/` and wire them in `src/App.tsx`.
