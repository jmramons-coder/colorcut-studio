const { json, readJson, supabasePublic, upsertProfileForUser } = require("./_supabase");

const ALLOWED_OTP_TYPES = new Set(["email", "magiclink", "signup"]);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const tokenHash = String(body.tokenHash || body.token_hash || "").trim();
    const type = ALLOWED_OTP_TYPES.has(String(body.type || "").trim())
      ? String(body.type).trim()
      : "email";

    if (!tokenHash) {
      json(res, 400, { ok: false, message: "Missing sign-in token." });
      return;
    }

    const supabase = supabasePublic();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase auth is not configured yet." });
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
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
      message: error.message || "Could not finish sign in."
    });
  }
};
