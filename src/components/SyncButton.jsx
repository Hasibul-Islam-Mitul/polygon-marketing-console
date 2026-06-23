import { useState } from "react";
import { SyncGlyph } from "./icons.jsx";
import { syncToNotion } from "../lib/api.js";

export default function SyncButton({ items, disabled }) {
  const [state, setState] = useState("idle"); // idle | syncing | done | error
  const [message, setMessage] = useState("");

  async function handleSync() {
    if (!items.length || state === "syncing") return;
    setState("syncing");
    setMessage("");
    try {
      const result = await syncToNotion(items);
      setState("done");
      setMessage(`${result.created} added · ${result.updated} updated`);
      setTimeout(() => setState("idle"), 4000);
    } catch (err) {
      setState("error");
      setMessage(err.message);
    }
  }

  const labels = {
    idle: "Sync to Notion",
    syncing: "Syncing…",
    done: "Synced",
    error: "Retry sync",
  };

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={`text-[12px] tnum ${state === "error" ? "text-amber-400" : "text-ink-muted"}`}
        >
          {message}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={disabled || state === "syncing"}
        className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas-raised px-4 py-1.5 text-[13px] font-medium text-ink transition-all duration-200 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <SyncGlyph className={`h-3.5 w-3.5 ${state === "syncing" ? "animate-spin" : ""}`} />
        {labels[state]}
      </button>
    </div>
  );
}
