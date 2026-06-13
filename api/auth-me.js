const { bearerToken, json, supabasePublic, upsertProfileForUser } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
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

    json(res, 200, {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      profile
    });
  } catch (error) {
    json(res, 401, {
      ok: false,
      message: error.message || "Could not load the parent session."
    });
  }
};
