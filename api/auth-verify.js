const {
  isValidEmail,
  json,
  normalizeEmail,
  readJson,
  supabasePublic,
  upsertProfileForUser
} = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const token = String(body.token || "").trim().replace(/\s+/g, "");

    if (!isValidEmail(email)) {
      json(res, 400, { ok: false, message: "Enter a valid parent email." });
      return;
    }

    if (!/^\d{6}$/.test(token)) {
      json(res, 400, { ok: false, message: "Enter the 6-digit code." });
      return;
    }

    const supabase = supabasePublic();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase auth is not configured yet." });
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    if (error) throw error;

    const profile = await upsertProfileForUser(data.user);

    json(res, 200, {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      },
      profile
    });
  } catch (error) {
    json(res, 401, {
      ok: false,
      message: error.message || "That code did not work."
    });
  }
};
