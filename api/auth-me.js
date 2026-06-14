const {
  bearerToken,
  json,
  publicProfile,
  readJson,
  supabaseAdmin,
  supabasePublic,
  upsertProfileForUser
} = require("./_supabase");

function sanitizeProfileName(name) {
  return String(name || "").replace(/\s+/g, " ").trim().slice(0, 18) || "Color Maker";
}

function sanitizeAvatar(avatar) {
  const allowed = new Set(["core", "sun", "leaf", "wave", "rose", "violet"]);
  return allowed.has(String(avatar || "")) ? String(avatar) : "core";
}

function normalizeCompletion(row) {
  const plays = Math.max(0, Math.min(9999, Number(row?.plays || 0)));
  const bestTime = Math.max(0, Math.min(24 * 60 * 60 * 1000, Number(row?.bestTime || row?.best_time_ms || 0)));
  const lastCompletedAtRaw = row?.lastCompletedAt || row?.last_completed_at || 0;
  const lastCompletedAt = typeof lastCompletedAtRaw === "number"
    ? lastCompletedAtRaw
    : Date.parse(lastCompletedAtRaw || "") || 0;

  return {
    plays,
    bestTime,
    lastCompletedAt
  };
}

function dayKey(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadProfileProgress(admin, profile) {
  if (!admin || !profile?.id) {
    return {
      name: profile?.displayName || "Color Maker",
      avatar: profile?.avatar || "core",
      completions: {},
      activityDays: []
    };
  }

  const { data, error } = await admin
    .from("puzzle_completions")
    .select("puzzle_id,plays,best_time_ms,last_completed_at")
    .eq("profile_id", profile.id)
    .limit(200);

  if (error) throw error;

  const completions = {};
  const activityDays = new Set();
  (data || []).forEach((row) => {
    const lastCompletedAt = row.last_completed_at ? Date.parse(row.last_completed_at) || 0 : 0;
    completions[row.puzzle_id] = {
      plays: Number(row.plays || 0),
      bestTime: Number(row.best_time_ms || 0),
      lastDuration: 0,
      lastCompletedAt
    };
    const key = lastCompletedAt ? dayKey(lastCompletedAt) : "";
    if (key) activityDays.add(key);
  });

  return {
    name: profile.displayName || "Color Maker",
    avatar: profile.avatar || "core",
    completions,
    activityDays: [...activityDays].sort()
  };
}

async function saveProfileProgress(admin, profile, body) {
  if (!admin || !profile?.id) return profile;

  const name = sanitizeProfileName(body.name || body.displayName);
  const avatar = sanitizeAvatar(body.avatar);

  const { data: updated, error: profileError } = await admin
    .from("profiles")
    .update({
      display_name: name,
      avatar
    })
    .eq("id", profile.id)
    .select("id,email,display_name,avatar,subscription_status")
    .single();

  if (profileError) throw profileError;

  const incomingRows = Object.entries(body.completions || {})
    .slice(0, 200)
    .map(([puzzleId, stats]) => {
      const normalized = normalizeCompletion(stats);
      if (!String(puzzleId || "").trim() || !normalized.plays) return null;
      return {
        profile_id: profile.id,
        puzzle_id: String(puzzleId).trim().slice(0, 80),
        plays: normalized.plays,
        best_time_ms: normalized.bestTime || null,
        last_completed_at: normalized.lastCompletedAt ? new Date(normalized.lastCompletedAt).toISOString() : null
      };
    })
    .filter(Boolean);

  if (incomingRows.length) {
    const puzzleIds = incomingRows.map((row) => row.puzzle_id);
    const { data: existingRows, error: existingError } = await admin
      .from("puzzle_completions")
      .select("puzzle_id,plays,best_time_ms,last_completed_at")
      .eq("profile_id", profile.id)
      .in("puzzle_id", puzzleIds);

    if (existingError) throw existingError;

    const existingByPuzzle = new Map((existingRows || []).map((row) => [row.puzzle_id, row]));
    const completionRows = incomingRows.map((incoming) => {
      const existing = existingByPuzzle.get(incoming.puzzle_id);
      if (!existing) return incoming;

      const existingBest = Number(existing.best_time_ms || 0);
      const incomingBest = Number(incoming.best_time_ms || 0);
      const bestCandidates = [existingBest, incomingBest].filter(Boolean);
      const existingCompleted = existing.last_completed_at ? Date.parse(existing.last_completed_at) || 0 : 0;
      const incomingCompleted = incoming.last_completed_at ? Date.parse(incoming.last_completed_at) || 0 : 0;

      return {
        ...incoming,
        plays: Math.max(Number(existing.plays || 0), Number(incoming.plays || 0)),
        best_time_ms: bestCandidates.length ? Math.min(...bestCandidates) : null,
        last_completed_at: Math.max(existingCompleted, incomingCompleted)
          ? new Date(Math.max(existingCompleted, incomingCompleted)).toISOString()
          : null
      };
    });

    const { error: completionError } = await admin
      .from("puzzle_completions")
      .upsert(completionRows, { onConflict: "profile_id,puzzle_id" });

    if (completionError) throw completionError;
  }

  return publicProfile(updated);
}

module.exports = async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const token = bearerToken(req);
    if (!token) {
      json(res, 401, { ok: false, message: "Missing session token." });
      return;
    }

    const supabase = supabasePublic();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase auth is not configured yet." });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    const profile = await upsertProfileForUser(data.user);
    const admin = supabaseAdmin();
    let activeProfile = profile;

    if (req.method === "POST") {
      const body = await readJson(req);
      activeProfile = await saveProfileProgress(admin, profile, body);
    }

    const profileProgress = await loadProfileProgress(admin, activeProfile);

    json(res, 200, {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      profile: activeProfile,
      profileProgress
    });
  } catch (error) {
    json(res, 401, {
      ok: false,
      message: error.message || "Could not load the parent session."
    });
  }
};
