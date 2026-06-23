// The signature element: a status dot whose ring quietly pulses only when the
// service is live. Configured-but-down reads amber; unconfigured reads muted.

const STATE = {
  live: { dot: "bg-accent", text: "text-ink", label: "Live", pulse: true },
  down: { dot: "bg-amber-400", text: "text-ink-muted", label: "Error", pulse: false },
  off: { dot: "bg-line-strong", text: "text-ink-muted", label: "Not set", pulse: false },
};

export default function StatusIndicator({ icon, name, service }) {
  let key = "off";
  if (service?.configured && service?.connected) key = "live";
  else if (service?.configured && !service?.connected) key = "down";

  const s = STATE[key];

  return (
    <div
      className="group flex items-center gap-2.5 rounded-full border border-line bg-canvas-raised px-3 py-1.5 transition-colors duration-300 hover:border-line-strong"
      title={service?.detail || ""}
    >
      <span className="text-ink-muted">{icon}</span>
      <span className="text-[13px] font-medium text-ink">{name}</span>
      <span className="relative flex h-2 w-2 items-center justify-center">
        {s.pulse && (
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-accent animate-pulse-ring" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      <span className={`text-[11px] tnum ${s.text}`}>{s.label}</span>
    </div>
  );
}
