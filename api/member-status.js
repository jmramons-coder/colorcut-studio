const Stripe = require("stripe");
const { isValidEmail, json, normalizeEmail, readJson, supabaseAdmin } = require("./_supabase");

const MEMBER_STATUSES = new Set(["plus", "active", "trialing"]);

async function emailFromCheckoutSession(sessionId) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !sessionId) return "";

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20"
  });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return normalizeEmail(session.customer_details?.email || session.customer_email);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const email = (await emailFromCheckoutSession(String(body.checkoutSessionId || body.sessionId || "").trim())) ||
      normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      json(res, 400, { ok: false, message: "Enter a valid email." });
      return;
    }

    const supabase = supabaseAdmin();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Account access is not configured yet." });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("email,auth_user_id,subscription_status,stripe_customer_id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    const status = String(data?.subscription_status || "").toLowerCase();
    const plus = Boolean(data && (MEMBER_STATUSES.has(status) || data.stripe_customer_id));

    json(res, 200, {
      ok: true,
      email,
      exists: Boolean(data),
      plus,
      hasPasswordLogin: Boolean(data?.auth_user_id),
      subscriptionStatus: data?.subscription_status || "none"
    });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not check member status."
    });
  }
};
