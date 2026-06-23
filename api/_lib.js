// Shared utilities for the serverless functions.
// No bundling step runs on /api, so this stays dependency-free.

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k] || !process.env[k].trim());
  return missing;
}

export function json(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(JSON.stringify(body));
}

// Engagement is the single comparable metric across platforms.
export function engagementOf(item) {
  return (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return await new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}
