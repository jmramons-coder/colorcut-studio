const { bearerToken, isValidEmail, json, readJson, supabaseAdmin, supabasePublic, upsertProfileForUser } = require("./_supabase");
const { memberProfileForEmail } = require("./_stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const password = String(body.password || "");
    const refreshToken = String(body.refreshToken || "");
    const expiresAt = Number(body.expiresAt || 0);
    const accessToken = bearerToken(req);

    if (!accessToken) {
      json(res, 401, { ok: false, message: "Open the newest password reset link from your email." });
      return;
    }

    if (password.length < 8) {
      json(res, 400, { ok: false, message: "Use at least 8 characters." });
      return;
    }

    const publicClient = supabasePublic();
    const admin = supabaseAdmin();
    if (!publicClient || !admin) {
      json(res, 503, { ok: false, message: "Account access is not configured yet." });
      return;
    }

    const { data: userData, error: userError } = await publicClient.auth.getUser(accessToken);
    if (userError) throw userError;

    const email = userData.user?.email || "";
    if (!isValidEmail(email)) {
      json(res, 401, { ok: false, message: "This reset link is not linked to an email." });
      return;
    }

    const memberProfile = await memberProfileForEmail(email);
    if (!memberProfile) {
      json(res, 404, {
        ok: false,
        code: "account_not_found",
        message: "No paid member account found for this email."
      });
      return;
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(userData.user.id, {
      password,
      email_confirm: true
    });
    if (updateError) throw updateError;

    if (!memberProfile.auth_user_id) {
      const { error: linkError } = await admin
        .from("profiles")
        .update({ auth_user_id: userData.user.id })
        .eq("id", memberProfile.id);
      if (linkError) throw linkError;
    }

    const profile = await upsertProfileForUser(userData.user);

    json(res, 200, {
      ok: true,
      user: {
        id: userData.user.id,
        email
      },
      session: {
        accessToken,
        refreshToken,
        expiresAt
      },
      profile
    });
  } catch (error) {
    json(res, 401, {
      ok: false,
      code: "password_reset_complete_failed",
      message: error.message || "Could not save the new password."
    });
  }
};
