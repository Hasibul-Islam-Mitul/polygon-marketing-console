// Thin client over the serverless routes. The browser never sees any token;
// it only ever calls our own /api/* endpoints.

async function getJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.detail || data.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.payload = data;
    throw err;
  }
  return data;
}

export function fetchMeta(limit = 25) {
  return getJson(`/api/meta?limit=${limit}`);
}

export function fetchHealth() {
  return getJson(`/api/health`);
}

export function syncToNotion(items) {
  return getJson(`/api/notion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}
