const Stripe = require("stripe");
const { isValidEmail, json, normalizeEmail, readJson } = require("./_supabase");

function appUrl() {
  return process.env.APP_URL || "https://snapuzzle.ca";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  let body;

  try {
    body = await readJson(req);
  } catch (error) {
    json(res, 400, {
      ok: false,
      message: error.message || "Invalid checkout request."
    });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const plan = body.plan === "yearly" ? "yearly" : "monthly";
  const priceId =
    plan === "yearly"
      ? process.env.STRIPE_PLUS_YEARLY_PRICE_ID
      : process.env.STRIPE_PLUS_MONTHLY_PRICE_ID || process.env.STRIPE_PLUS_PRICE_ID;

  if (!secretKey || !priceId) {
    json(res, 503, {
      ok: false,
      message: `Stripe ${plan} checkout is not connected yet.`
    });
    return;
  }

  try {
    const email = normalizeEmail(body.email);
    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20"
    });
    const baseUrl = appUrl();
    const sessionPayload = {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        source: String(body.source || "app"),
        plan
      },
      subscription_data: {
        metadata: {
          source: String(body.source || "app"),
          plan
        }
      }
    };

    if (email && isValidEmail(email)) {
      sessionPayload.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    json(res, 200, { ok: true, url: session.url });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not create checkout."
    });
  }
};
