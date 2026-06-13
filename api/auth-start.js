const { isValidEmail, json, normalizeEmail, readJson, supabaseAdmin, supabasePublic } = require("./_supabase");

const MEMBER_STATUSES = new Set(["plus", "active", "trialing"]);

async function memberProfileForEmail(email) {
  const supabase = supabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("email,subscription_status,stripe_customer_id")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const status = String(data.subscription_status || "").toLowerCase();
  if (MEMBER_STATUSES.has(status) || data.stripe_customer_id) {
    return data;
  }

  return null;
}

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

    const appUrl = process.env.APP_URL || "https://snapuzzle.ca";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: appUrl
      }
    });

    if (error) throw error;

    json(res, 200, { ok: true, email });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not send the login link."
    });
  }
};
