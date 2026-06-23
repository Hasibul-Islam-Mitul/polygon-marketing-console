import { FacebookGlyph, InstagramGlyph } from "./icons.jsx";

const OPTIONS = [
  { id: "all", label: "All", glyph: null },
  { id: "facebook", label: "Facebook", glyph: <FacebookGlyph /> },
  { id: "instagram", label: "Instagram", glyph: <InstagramGlyph /> },
];

export default function FilterControls({ active, onChange, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Filter by platform"
      className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas-raised p-1"
    >
      {OPTIONS.map((opt) => {
        const isActive = active === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              isActive
                ? "bg-accent text-canvas shadow-[0_0_0_1px_rgba(110,220,130,0.25)]"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {opt.glyph}
            <span>{opt.label}</span>
            <span className={`tnum text-[11px] ${isActive ? "text-canvas/70" : "text-ink-muted"}`}>
              {counts?.[opt.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
