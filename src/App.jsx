import { useCallback, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import FilterControls from "./components/FilterControls.jsx";
import StatCard from "./components/StatCard.jsx";
import MetricsTable from "./components/MetricsTable.jsx";
import SyncButton from "./components/SyncButton.jsx";
import { RefreshGlyph } from "./components/icons.jsx";
import { usePolling } from "./hooks/usePolling.js";
import { fetchMeta, fetchHealth } from "./lib/api.js";
import { clockTime } from "./lib/format.js";

const POLL_MS = 30_000;

export default function App() {
  const [filter, setFilter] = useState("all");

  const metaFetcher = useCallback(() => fetchMeta(25), []);
  const healthFetcher = useCallback(() => fetchHealth(), []);

  const { data, error, status, lastUpdated, refresh } = usePolling(metaFetcher, POLL_MS);
  const { data: health } = usePolling(healthFetcher, POLL_MS);

  const items = data?.items ?? [];

  const counts = useMemo(
    () => ({
      all: items.length,
      facebook: items.filter((i) => i.platform === "facebook").length,
      instagram: items.filter((i) => i.platform === "instagram").length,
    }),
    [items]
  );

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.platform === filter)),
    [items, filter]
  );

  const summary = useMemo(() => {
    const base = { likes: 0, comments: 0, shares: 0, engagement: 0 };
    const totals = filtered.reduce((acc, i) => {
      acc.likes += i.likes || 0;
      acc.comments += i.comments || 0;
      acc.shares += i.shares || 0;
      acc.engagement += i.engagement || 0;
      return acc;
    }, base);
    const top = filtered.reduce(
      (best, i) => (i.engagement > (best?.engagement ?? -1) ? i : best),
      null
    );
    return { totals, top };
  }, [filtered]);

  const maxEngagement = useMemo(
    () => filtered.reduce((m, i) => Math.max(m, i.engagement || 0), 0),
    [filtered]
  );

  const isInitialLoad = status === "loading" && !data;

  return (
    <div className="min-h-full">
      <Navbar health={health} />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        {/* Title row + live controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Performance Monitor</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Engagement Overview
            </h1>
            <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-muted">
              {status === "live" && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse-ring" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  Live
                </span>
              )}
              <span>
                {lastUpdated ? `Updated ${clockTime(lastUpdated.toISOString())}` : "Connecting…"}
                {" · auto-refresh 30s"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas-raised px-3.5 py-1.5 text-[13px] font-medium text-ink-muted transition-all duration-200 hover:border-line-strong hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <RefreshGlyph className={`h-3.5 w-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <SyncButton items={filtered} disabled={!filtered.length} />
          </div>
        </div>

        {/* Error banner — surfaces the real failure, no silent dummy data */}
        {error && (
          <div className="mt-6 animate-fade-up rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <p className="text-[13px] font-medium text-amber-300">Couldn’t reach the Meta Graph API</p>
            <p className="mt-0.5 text-[12px] text-ink-muted">{error.message}</p>
          </div>
        )}

        {/* Summary cards */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard index={0} label="Total Engagement" value={summary.totals.engagement} accent sub={`${filtered.length} posts`} />
          <StatCard index={1} label="Likes" value={summary.totals.likes} />
          <StatCard index={2} label="Comments" value={summary.totals.comments} />
          <StatCard index={3} label="Shares" value={summary.totals.shares} />
        </section>

        {/* Filter + table */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <FilterControls active={filter} onChange={setFilter} counts={counts} />
            {summary.top && (
              <p className="hidden text-[12px] text-ink-muted sm:block">
                Top post:{" "}
                <span className="text-ink">{summary.top.engagement.toLocaleString()}</span> engagement
              </p>
            )}
          </div>

          {isInitialLoad ? (
            <div className="rounded-xl border border-line bg-canvas-raised px-6 py-16 text-center">
              <p className="text-[13px] text-ink-muted">Pulling live engagement from Meta…</p>
            </div>
          ) : (
            <MetricsTable items={filtered} maxEngagement={maxEngagement} />
          )}
        </section>

        <footer className="mt-12 flex items-center justify-between border-t border-line pt-5 text-[11px] text-ink-muted">
          <span>Polygon Marketing Console</span>
          <span className="tnum">
            {data?.pageId ? `Page ${data.pageId}` : "—"}
            {data && !data.instagramLinked ? " · IG not linked" : ""}
          </span>
        </footer>
      </main>
    </div>
  );
}
