const crypto = require("crypto");
const { isValidEmail, json, normalizeEmail, readJson, supabaseAdmin, supabasePublic } = require("./_supabase");
const { appUrl, memberProfileForEmail } = require("./_stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      json(res, 400, { ok: false, message: "Enter a valid email." });
      return;
    }

    const memberProfile = await memberProfileForEmail(email);
    if (!memberProfile) {
      json(res, 404, {
        ok: false,
        code: "account_not_found",
        message: "No member account found for this email. Subscribe first, then create your password."
      });
      return;
    }

    const admin = supabaseAdmin();
    const supabase = supabasePublic();
    if (!admin || !supabase) {
      json(res, 503, { ok: false, message: "Supabase auth is not configured yet." });
      return;
    }

    if (!memberProfile.auth_user_id) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: crypto.randomBytes(24).toString("base64url"),
        email_confirm: true
      });
      const alreadyExists = /already|registered|exists/i.test(error?.message || "");
      if (error && !alreadyExists) throw error;

      if (data?.user?.id) {
        const { error: linkError } = await admin
          .from("profiles")
          .update({ auth_user_id: data.user.id })
          .eq("id", memberProfile.id);
        if (linkError) throw linkError;
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl()}/?auth=recovery`
    });
    if (error) throw error;

    json(res, 200, { ok: true, email });
  } catch (error) {
    const message = error.message || "";
    const isRateLimited =
      error.status === 429 ||
      /rate limit|email rate|too many|over_email_send_rate_limit/i.test(message);

    json(res, isRateLimited ? 429 : 500, {
      ok: false,
      code: isRateLimited ? "email_rate_limit" : "password_reset_failed",
      message: isRateLimited
        ? "Too many emails were requested. Wait a few minutes, then use the newest reset link."
        : message || "Could not send the password reset email."
    });
  }
};
