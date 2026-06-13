const { isValidEmail, json, normalizeEmail, readJson, supabasePublic } = require("./_supabase");
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
        message: "No member account found for this email. Subscribe first, then log in with your checkout email."
      });
      return;
    }

    const supabase = supabasePublic();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase auth is not configured yet." });
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: appUrl()
      }
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
      code: isRateLimited ? "email_rate_limit" : "login_email_failed",
      message: isRateLimited
        ? "Too many login emails were requested. Wait a few minutes, then use the newest link on this device."
        : message || "Could not send the login link."
    });
  }
};
