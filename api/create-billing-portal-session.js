const Stripe = require("stripe");
const { bearerToken, json, supabaseAdmin, supabasePublic, upsertProfileForUser } = require("./_supabase");

function appUrl() {
  return process.env.APP_URL || "https://snapuzzle.ca";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    json(res, 503, { ok: false, message: "Stripe billing is not connected yet." });
    return;
  }

  try {
    const token = bearerToken(req);
    if (!token) {
      json(res, 401, { ok: false, message: "Sign in to manage billing." });
      return;
    }

    const supabase = supabasePublic();
    const admin = supabaseAdmin();
    if (!supabase || !admin) {
      json(res, 503, { ok: false, message: "Account access is not configured yet." });
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw userError;

    const profile = await upsertProfileForUser(userData.user);
    if (!profile?.id) {
      json(res, 404, { ok: false, message: "No account profile is linked to this session yet." });
      return;
    }

    const { data: privateProfile, error: profileError } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", profile.id)
      .single();

    if (profileError) throw profileError;
    if (!privateProfile?.stripe_customer_id) {
      json(res, 404, { ok: false, message: "No Stripe customer is linked to this email yet." });
      return;
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20"
    });
    const session = await stripe.billingPortal.sessions.create({
      customer: privateProfile.stripe_customer_id,
      return_url: `${appUrl()}/?billing=return`
    });

    json(res, 200, { ok: true, url: session.url });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not open billing management."
    });
  }
};
