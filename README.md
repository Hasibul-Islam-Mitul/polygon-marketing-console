# Polygon Marketing Console

A high-performance social media monitoring hub that bridges the **Meta Graph API**
(Facebook + Instagram) and a **Notion database**. It polls live engagement every
30 seconds, renders an interactive fintech-style dashboard, and syncs the data
into Notion on demand.

- **Frontend** — React 18 + Vite + Tailwind CSS
- **Backend** — Vercel serverless functions in `/api` (the serverless data bridge)
- **Pipeline** — Client polls `/api/meta` every 30s → renders → `/api/notion` upserts into Notion

> Tokens live only in server-side environment variables. The browser bundle
> never sees a Meta or Notion secret — it only calls your own `/api/*` routes.

---

## 1. Project structure

```
polygon-marketing-console/
├── api/                  # Vercel serverless functions (the data bridge)
│   ├── _lib.js           # shared helpers
│   ├── meta.js           # GET  /api/meta    → live FB + IG engagement
│   ├── notion.js         # POST /api/notion  → upsert rows into Notion
│   └── health.js         # GET  /api/health  → Meta/Notion status probe
├── src/
│   ├── components/       # Navbar, FilterControls, MetricsTable, StatCard, …
│   ├── hooks/usePolling.js
│   ├── lib/              # api client + formatters
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

---

## 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` (gitignored):

| Variable | Description |
| --- | --- |
| `NOTION_TOKEN` | Notion internal integration secret |
| `NOTION_INTEGRATION_TOKEN` | Optional; falls back to `NOTION_TOKEN` |
| `NOTION_DATABASE_ID` | Target database (must be shared with the integration) |
| `META_PAGE_ACCESS_TOKEN` | Long-lived Page token with engagement + insights scopes |
| `PAGE_ID` | The Facebook Page ID to read from |
| `META_GRAPH_VERSION` | Optional, defaults to `v21.0` |

**Meta token scopes:** `pages_read_engagement`, `read_insights`, and for
Instagram `instagram_basic`, `instagram_manage_insights`. The IG account must be
a Business/Creator account linked to the Page.

---

## 3. Notion database schema

Create the database properties below (names are case-sensitive) and **share the
database with your integration** (•••  → Connections → add your integration):

| Property | Type |
| --- | --- |
| `Name` | Title |
| `Post ID` | Text |
| `Platform` | Select (`Facebook`, `Instagram`) |
| `Likes` | Number |
| `Comments` | Number |
| `Shares` | Number |
| `Engagement` | Number |
| `URL` | URL |
| `Created` | Date |

Sync upserts on `Post ID`: existing rows are updated, new posts are created.

---

## 4. Run locally

The serverless functions run on the Vercel runtime, so the simplest local setup
runs everything through the Vercel CLI:

```bash
npm install
npm i -g vercel        # if you don't have it
vercel dev             # serves /api AND the Vite app together
```

Prefer the raw Vite dev server? Run `vercel dev` (functions on :3000) in one
terminal and `npm run dev` (UI on :5173) in another — `vite.config.js` proxies
`/api` to :3000.

---

## 5. Deploy to Vercel

1. Push the repo to GitHub/GitLab and **Import Project** in Vercel (or run `vercel`).
2. In **Project → Settings → Environment Variables**, add every variable from
   `.env.example` with real values.
3. Deploy. Vercel builds the static app (`npm run build` → `dist/`) and deploys
   each file in `/api` as a serverless function automatically.

`vercel.json` already pins the build output, function runtime, and SPA rewrites.

---

## Notes

- **No dummy fallbacks.** If credentials are missing or Meta/Notion errors, the
  endpoints return the real error and the UI surfaces it — nothing is faked.
- **Quota-friendly polling.** Polling pauses while the browser tab is hidden and
  resumes on focus.
- **Rate limits.** Notion sync runs sequentially to stay under ~3 req/s.
