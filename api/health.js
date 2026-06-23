// GET /api/health
// Lightweight connectivity probe for the top-bar status indicators.
// Verifies that each integration is configured AND reachable, without
// pulling heavy data. Returns per-service { configured, connected, detail }.

import { GRAPH_BASE, json } from "./_lib.js";

async function checkMeta() {
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  const pageId = process.env.PAGE_ID?.trim();
  if (!token || !pageId) {
    return { configured: false, connected: false, detail: "Missing token or PAGE_ID." };
  }
  try {
    const url = new URL(`${GRAPH_BASE}/${pageId}`);
    url.searchParams.set("fields", "name");
    url.searchParams.set("access_token", token);
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || data.error) {
      return { configured: true, connected: false, detail: data.error?.message || "Unreachable." };
    }
    return { configured: true, connected: true, detail: data.name || "Connected" };
  } catch (err) {
    return { configured: true, connected: false, detail: err.message };
  }
}

async function checkNotion() {
  const token =
    process.env.NOTION_INTEGRATION_TOKEN?.trim() || process.env.NOTION_TOKEN?.trim();
  const dbId = process.env.NOTION_DATABASE_ID?.trim();
  if (!token || !dbId) {
    return { configured: false, connected: false, detail: "Missing token or database ID." };
  }
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" },
    });
    const data = await res.json();
    if (!res.ok) {
      return { configured: true, connected: false, detail: data.message || "Unreachable." };
    }
    const title = data.title?.[0]?.plain_text || "Connected";
    return { configured: true, connected: true, detail: title };
  } catch (err) {
    return { configured: true, connected: false, detail: err.message };
  }
}

export default async function handler(req, res) {
  const [meta, notion] = await Promise.all([checkMeta(), checkNotion()]);
  return json(res, 200, { checkedAt: new Date().toISOString(), meta, notion });
}
