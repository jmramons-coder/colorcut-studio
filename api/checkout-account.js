const Stripe = require("stripe");
const { json, normalizeEmail, readJson, supabaseAdmin } = require("./_supabase");

async function paidCheckoutSession(sessionId) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !sessionId) return null;

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20"
  });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email = normalizeEmail(session.customer_details?.email || session.customer_email);

  if (!email || session.payment_status !== "paid") {
    return null;
  }

  return {
    email,
    customerId: typeof session.customer === "string" ? session.customer : session.customer?.id || null
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const checkoutSessionId = String(body.checkoutSessionId || body.sessionId || "").trim();
    const checkout = await paidCheckoutSession(checkoutSessionId);

    if (!checkout) {
      json(res, 401, {
        ok: false,
        code: "checkout_required",
        message: "Open account setup from your completed checkout."
      });
      return;
    }

    const supabase = supabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("profiles").upsert(
        {
          email: checkout.email,
          stripe_customer_id: checkout.customerId,
          subscription_status: "plus"
        },
        { onConflict: "email" }
      );
      if (error) throw error;
    }

    json(res, 200, {
      ok: true,
      email: checkout.email,
      plus: true
    });
  } catch (error) {
    json(res, 500, {
      ok: false,
      code: "checkout_account_failed",
      message: error.message || "Could not load checkout account."
    });
  }
};
