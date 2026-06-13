const { bearerToken, json, readJson, supabaseAdmin, supabasePublic } = require("./_supabase");

const EVENT_TYPES = new Set([
  "app_opened",
  "category_selected",
  "difficulty_selected",
  "puzzle_viewed",
  "puzzle_started",
  "puzzle_completed",
  "scratch_started",
  "scratch_completed",
  "locked_puzzle_clicked",
  "pricing_opened",
  "checkout_started",
  "checkout_completed",
  "profile_opened"
]);

function trimText(value, limit) {
  return String(value || "").trim().slice(0, limit);
}

function cleanMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const safe = {};
  Object.entries(value).slice(0, 20).forEach(([key, item]) => {
    const cleanKey = trimText(key, 60);
    if (!cleanKey) return;
    if (item === null || ["string", "number", "boolean"].includes(typeof item)) {
      safe[cleanKey] = typeof item === "string" ? item.slice(0, 300) : item;
    }
  });
  return safe;
}

async function profileIdFromToken(req) {
  const token = bearerToken(req);
  if (!token) return null;

  const publicClient = supabasePublic();
  const admin = supabaseAdmin();
  if (!publicClient || !admin) return null;

  const { data } = await publicClient.auth.getUser(token);
  const userId = data?.user?.id;
  if (!userId) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  return profile?.id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const eventType = trimText(body.eventType || body.type, 80);
    if (!EVENT_TYPES.has(eventType)) {
      json(res, 400, { ok: false, message: "Unknown event type." });
      return;
    }

    const supabase = supabaseAdmin();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase is not configured." });
      return;
    }

    const payload = {
      profile_id: await profileIdFromToken(req),
      anonymous_id: trimText(body.anonymousId, 80) || null,
      session_id: trimText(body.sessionId, 80) || null,
      event_type: eventType,
      puzzle_id: trimText(body.puzzleId, 100) || null,
      category: trimText(body.category, 80) || null,
      difficulty: trimText(body.difficulty, 50) || null,
      tier: trimText(body.tier, 50) || null,
      source: trimText(body.source, 100) || "app",
      metadata: cleanMetadata(body.metadata),
      user_agent: trimText(req.headers["user-agent"], 500) || null,
      referrer: trimText(req.headers.referer, 500) || null
    };

    const { error } = await supabase.from("puzzle_events").insert(payload);
    if (error) throw error;

    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not save event."
    });
  }
};
