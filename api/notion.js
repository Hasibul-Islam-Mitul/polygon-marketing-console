// POST /api/notion
// Upserts the provided engagement items into the configured Notion database.
// For each item: query by "Post ID"; update if it exists, otherwise create.
// Body: { items: [{ id, platform, message, createdTime, permalink,
//                    likes, comments, shares, engagement }] }

import { requireEnv, json, readBody } from "./_lib.js";

const NOTION_VERSION = "2022-06-28";
const NOTION_BASE = "https://api.notion.com/v1";

function notionToken() {
  return process.env.NOTION_INTEGRATION_TOKEN?.trim() || process.env.NOTION_TOKEN?.trim();
}

async function notion(path, token, method = "GET", body) {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `Notion request failed (${res.status})`);
    err.status = res.status;
    err.notion = data;
    throw err;
  }
  return data;
}

// Maps a normalized item onto Notion property objects.
// The target database is expected to expose these properties:
//   Name (title) · Post ID (rich_text) · Platform (select) ·
//   Likes/Comments/Shares/Engagement (number) · URL (url) · Created (date)
function toProperties(item) {
  const title = (item.message || "(no caption)").slice(0, 120);
  return {
    Name: { title: [{ text: { content: title } }] },
    "Post ID": { rich_text: [{ text: { content: String(item.id) } }] },
    Platform: { select: { name: item.platform === "instagram" ? "Instagram" : "Facebook" } },
    Likes: { number: item.likes ?? 0 },
    Comments: { number: item.comments ?? 0 },
    Shares: { number: item.shares ?? 0 },
    Engagement: { number: item.engagement ?? 0 },
    ...(item.permalink ? { URL: { url: item.permalink } } : {}),
    ...(item.createdTime ? { Created: { date: { start: item.createdTime } } } : {}),
  };
}

async function findExisting(dbId, token, postId) {
  const data = await notion(`/databases/${dbId}/query`, token, "POST", {
    filter: { property: "Post ID", rich_text: { equals: String(postId) } },
    page_size: 1,
  });
  return data.results?.[0]?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed. Use POST." });
  }

  const missing = requireEnv(["NOTION_DATABASE_ID"]);
  const token = notionToken();
  if (!token) missing.push("NOTION_TOKEN (or NOTION_INTEGRATION_TOKEN)");
  if (missing.length) {
    return json(res, 500, {
      error: "Server is not configured.",
      detail: `Missing environment variables: ${missing.join(", ")}`,
    });
  }

  const dbId = process.env.NOTION_DATABASE_ID;
  const body = await readBody(req);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return json(res, 400, { error: "Request body must include a non-empty `items` array." });
  }

  const results = { created: 0, updated: 0, failed: 0, errors: [] };

  // Sequential to stay within Notion's ~3 req/s rate limit comfortably.
  for (const item of items) {
    try {
      const existingId = await findExisting(dbId, token, item.id);
      const properties = toProperties(item);
      if (existingId) {
        await notion(`/pages/${existingId}`, token, "PATCH", { properties });
        results.updated += 1;
      } else {
        await notion("/pages", token, "POST", {
          parent: { database_id: dbId },
          properties,
        });
        results.created += 1;
      }
    } catch (err) {
      results.failed += 1;
      results.errors.push({ id: item.id, detail: err.message });
    }
  }

  const status = results.failed && !results.created && !results.updated ? 502 : 200;
  return json(res, status, {
    syncedAt: new Date().toISOString(),
    ...results,
  });
}
