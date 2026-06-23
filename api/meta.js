// GET /api/meta
// Fetches live engagement for the configured Page (Facebook posts + connected
// Instagram media) directly from the Meta Graph API. Tokens never leave the
// server. Returns a normalized, unified list. There is NO dummy fallback:
// if credentials are missing or Meta errors, the endpoint surfaces the error.

import { GRAPH_BASE, requireEnv, json, engagementOf } from "./_lib.js";

const PAGE_FIELDS = [
  "id",
  "message",
  "story",
  "created_time",
  "permalink_url",
  "shares",
  "likes.summary(true).limit(0)",
  "comments.summary(true).limit(0)",
  "reactions.summary(true).limit(0)",
].join(",");

const IG_FIELDS = [
  "id",
  "caption",
  "media_type",
  "timestamp",
  "permalink",
  "like_count",
  "comments_count",
].join(",");

async function graph(path, token, params = {}) {
  const url = new URL(`${GRAPH_BASE}/${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || `Graph request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.meta = data.error || null;
    throw err;
  }
  return data;
}

async function fetchFacebookPosts(pageId, token, limit) {
  const data = await graph(`${pageId}/posts`, token, {
    fields: PAGE_FIELDS,
    limit: String(limit),
  });
  return (data.data || []).map((p) => ({
    id: p.id,
    platform: "facebook",
    message: p.message || p.story || "(no caption)",
    createdTime: p.created_time,
    permalink: p.permalink_url || null,
    likes: p.likes?.summary?.total_count ?? p.reactions?.summary?.total_count ?? 0,
    comments: p.comments?.summary?.total_count ?? 0,
    shares: p.shares?.count ?? 0,
  }));
}

async function resolveInstagramId(pageId, token) {
  const data = await graph(pageId, token, { fields: "instagram_business_account" });
  return data.instagram_business_account?.id || null;
}

async function fetchInstagramMedia(igId, token, limit) {
  const data = await graph(`${igId}/media`, token, {
    fields: IG_FIELDS,
    limit: String(limit),
  });
  return (data.data || []).map((m) => ({
    id: m.id,
    platform: "instagram",
    message: m.caption || `(${m.media_type?.toLowerCase() || "media"})`,
    createdTime: m.timestamp,
    permalink: m.permalink || null,
    likes: m.like_count ?? 0,
    comments: m.comments_count ?? 0,
    shares: 0,
  }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed. Use GET." });
  }

  const missing = requireEnv(["META_PAGE_ACCESS_TOKEN", "PAGE_ID"]);
  if (missing.length) {
    return json(res, 500, {
      error: "Server is not configured.",
      detail: `Missing environment variables: ${missing.join(", ")}`,
    });
  }

  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.PAGE_ID;
  const limit = Math.min(Number(req.query?.limit) || 25, 50);

  try {
    const items = [];

    // Facebook is the source of truth for the configured Page.
    items.push(...(await fetchFacebookPosts(pageId, token, limit)));

    // Instagram is best-effort: a Page may not have a linked IG business account.
    let instagramLinked = false;
    try {
      const igId = await resolveInstagramId(pageId, token);
      if (igId) {
        items.push(...(await fetchInstagramMedia(igId, token, limit)));
        instagramLinked = true;
      }
    } catch (igErr) {
      // Do not fail the whole request if only IG is unavailable.
      console.warn("Instagram fetch skipped:", igErr.message);
    }

    const normalized = items
      .map((it) => ({ ...it, engagement: engagementOf(it) }))
      .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    return json(res, 200, {
      pageId,
      instagramLinked,
      count: normalized.length,
      fetchedAt: new Date().toISOString(),
      items: normalized,
    });
  } catch (err) {
    return json(res, err.status && err.status < 500 ? 502 : 500, {
      error: "Meta Graph API request failed.",
      detail: err.message,
      meta: err.meta || null,
    });
  }
}
