import { FacebookGlyph, InstagramGlyph, ArrowUpRight } from "./icons.jsx";
import { formatCount, relativeTime } from "../lib/format.js";

function PlatformTag({ platform }) {
  const isIg = platform === "instagram";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${
        isIg ? "bg-[#E1306C1a] text-[#f06595]" : "bg-[#1877F21a] text-[#5b9cff]"
      }`}
    >
      {isIg ? <InstagramGlyph className="h-3 w-3" /> : <FacebookGlyph className="h-3 w-3" />}
      {isIg ? "Instagram" : "Facebook"}
    </span>
  );
}

export default function MetricsTable({ items, maxEngagement }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-canvas-inset px-6 py-16 text-center">
        <p className="text-[14px] text-ink">Nothing to show for this filter.</p>
        <p className="mt-1 text-[12px] text-ink-muted">
          Switch platforms or wait for the next refresh to pull new posts.
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-quiet overflow-x-auto rounded-xl border border-line bg-canvas-raised">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {["Post", "Platform", "Likes", "Comments", "Shares", "Engagement", "Posted"].map(
              (h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-[11px] uppercase tracking-eyebrow text-ink-muted font-medium ${
                    i >= 2 && i <= 5 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const pct = maxEngagement > 0 ? Math.max(4, (item.engagement / maxEngagement) * 100) : 0;
            return (
              <tr
                key={item.id}
                className="group animate-fade-up border-b border-line/60 transition-colors duration-200 last:border-0 hover:bg-canvas-inset"
                style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}
              >
                <td className="max-w-[280px] px-4 py-3">
                  <div className="flex items-start gap-2">
                    <p className="line-clamp-2 text-[13px] text-ink">{item.message}</p>
                    {item.permalink && (
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 shrink-0 text-ink-muted opacity-0 transition-opacity duration-200 hover:text-accent group-hover:opacity-100"
                        aria-label="Open original post"
                      >
                        <ArrowUpRight />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PlatformTag platform={item.platform} />
                </td>
                <td className="px-4 py-3 text-right tnum text-[13px] text-ink">
                  {formatCount(item.likes)}
                </td>
                <td className="px-4 py-3 text-right tnum text-[13px] text-ink">
                  {formatCount(item.comments)}
                </td>
                <td className="px-4 py-3 text-right tnum text-[13px] text-ink">
                  {formatCount(item.shares)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2.5">
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-line sm:block">
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="tnum text-[13px] font-medium text-accent">
                      {formatCount(item.engagement)}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-[12px] text-ink-muted">
                  {relativeTime(item.createdTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
