const Stripe = require("stripe");
const { isValidEmail, json, normalizeEmail, readJson, supabaseAdmin, supabasePublic, upsertProfileForUser } = require("./_supabase");

const MEMBER_STATUSES = new Set(["plus", "active", "trialing"]);

async function memberProfileForEmail(email) {
  const supabase = supabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,auth_user_id,subscription_status,stripe_customer_id")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const status = String(data.subscription_status || "").toLowerCase();
  return MEMBER_STATUSES.has(status) || data.stripe_customer_id ? data : null;
}

async function checkoutEmail(sessionId) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !sessionId) return "";

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20"
  });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email = normalizeEmail(session.customer_details?.email || session.customer_email);

  if (!email || session.payment_status !== "paid") {
    return "";
  }

  const supabase = supabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("profiles").upsert(
      {
        email,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || null,
        subscription_status: "plus"
      },
      { onConflict: "email" }
    );
    if (error) throw error;
  }

  return email;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const password = String(body.password || "");
    const checkoutSessionId = String(body.checkoutSessionId || body.sessionId || "").trim();
    const email = await checkoutEmail(checkoutSessionId);

    if (!isValidEmail(email)) {
      json(res, 401, {
        ok: false,
        code: "checkout_required",
        message: "Open account setup from your completed checkout."
      });
      return;
    }

    if (password.length < 8) {
      json(res, 400, { ok: false, message: "Use at least 8 characters." });
      return;
    }

    const memberProfile = await memberProfileForEmail(email);
    if (!memberProfile) {
      json(res, 404, {
        ok: false,
        code: "account_not_found",
        message: "No paid member account found for this email yet."
      });
      return;
    }

    const admin = supabaseAdmin();
    const publicClient = supabasePublic();
    if (!admin || !publicClient) {
      json(res, 503, { ok: false, message: "Account access is not configured yet." });
      return;
    }

    let userId = memberProfile.auth_user_id;
    if (userId) {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true
      });
      if (error) throw error;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) throw error;
      userId = data.user.id;
      const { error: linkError } = await admin
        .from("profiles")
        .update({ auth_user_id: userId })
        .eq("id", memberProfile.id);
      if (linkError) throw linkError;
    }

    const { data, error } = await publicClient.auth.signInWithPassword({
      email,
      password
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
    json(res, 500, {
      ok: false,
      code: "password_set_failed",
      message: error.message || "Could not set the password."
    });
  }
};
