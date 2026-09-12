# Launchable Quotes Live

Free one-page tool for [StonkFun](https://www.stonkfun.xyz) by **@jenovatech** / **jenovatech1**.

It shows **live launchable quote pairs** from the StonkFun public API and calls out the UI↔API mismatch: the launch screen can claim no xStocks are available while `GET /api/public/v1/pairs?launchable=true` already returns launchable quotes.

## Features (MVP)

- Mobile-first single page (works on phone and desktop)
- Live fetch from StonkFun public API (no API key)
- List with symbol, name, mint, category, launchable / lab-ready / ambiguous badges
- Search/filter by symbol, name, mint; category filter
- Clear mismatch callout
- No auth, wallet, websockets, sniper, alerts, history, or portfolio

Future features (e.g. **Custom Pairs Radar**) should be added as routes in **this repo only**.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build → dist/
npm run preview  # serve dist locally
```

## API

| Item | Value |
|------|--------|
| Endpoint | `https://www.stonkfun.xyz/api/public/v1/pairs?launchable=true` |
| Auth | None |
| CORS | `access-control-allow-origin: *` (browser fetch works) |
| Cache | ~30s (`cache-control: public, max-age=30`) |
| Shape | `{ data: { pairs: [...] }, meta: { generatedAt } }` |

### Quirks observed

- Prefer **`www.stonkfun.xyz`** — bare `stonkfun.xyz` may 308-redirect.
- Response is wrapped in `data.pairs`, not a bare array.
- `launchable=true` still returns many categories (`custom`, `backpack`, `xstock`, …), not only xStocks.
- Some pairs have `launchLabReady: false` while still `launchable: true`.
- `symbolAmbiguous: true` appears on a subset of symbols.
- `logoUrl` is often a site-relative path (`/api/asset/quote-logo/...`); this app prefixes `https://www.stonkfun.xyz`.
- Rate limit headers are exposed (`X-RateLimit-*`). The UI refreshes about every 30s to stay near the CDN cache window.
- If the API is down or the shape changes, the UI shows a clear failure — it never invents fake pairs.

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

The workflow sets `VITE_BASE=/launchable-quotes/` so asset paths match the project site.

## Project layout

```
src/
  api/stonkfun.ts          # public API client
  pages/LaunchableQuotesPage.tsx
  components/              # shell, mismatch callout, quote row
  types/pairs.ts
```

Add new tools as additional routes under `src/pages/` and wire them in `src/App.tsx`.
