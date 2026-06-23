import StatusIndicator from "./StatusIndicator.jsx";
import { FacebookGlyph } from "./icons.jsx";

function MetaGlyph() {
  return <FacebookGlyph className="h-3.5 w-3.5" />;
}

function NotionGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M8 8.5v7M8 8.5l5 7M13 8.5v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar({ health }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line-strong bg-canvas-raised">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <polygon points="12,3 20,8 17,18 7,18 4,8" fill="none" stroke="#6EDC82" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-ink">Polygon</p>
            <p className="text-[10px] uppercase tracking-eyebrow text-ink-muted">Marketing Console</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusIndicator icon={<MetaGlyph />} name="Meta" service={health?.meta} />
          <StatusIndicator icon={<NotionGlyph />} name="Notion" service={health?.notion} />
        </div>
      </div>
    </header>
  );
}
