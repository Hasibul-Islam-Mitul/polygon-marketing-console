import { formatCount } from "../lib/format.js";

export default function StatCard({ label, value, sub, index = 0, accent = false }) {
  return (
    <div
      className="animate-fade-up rounded-xl border border-line bg-canvas-raised p-4 transition-colors duration-300 hover:border-line-strong"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <p className="eyebrow">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tnum tracking-tight ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {typeof value === "number" ? formatCount(value) : value}
      </p>
      {sub && <p className="mt-0.5 text-[12px] text-ink-muted">{sub}</p>}
    </div>
  );
}
