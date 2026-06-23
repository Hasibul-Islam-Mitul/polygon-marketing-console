import { useCallback, useEffect, useRef, useState } from "react";

// Polls `fetcher` every `intervalMs`. Pauses while the tab is hidden so we
// don't burn Graph API quota in the background, and resumes on focus.
export function usePolling(fetcher, intervalMs = 30_000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | live | error
  const [lastUpdated, setLastUpdated] = useState(null);
  const timer = useRef(null);
  const inFlight = useRef(false);

  const run = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus((s) => (s === "idle" ? "loading" : s));
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
      setStatus("live");
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, [fetcher]);

  useEffect(() => {
    run();
    function schedule() {
      clearInterval(timer.current);
      timer.current = setInterval(() => {
        if (!document.hidden) run();
      }, intervalMs);
    }
    schedule();

    function onVisibility() {
      if (!document.hidden) run();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [run, intervalMs]);

  return { data, error, status, lastUpdated, refresh: run };
}
