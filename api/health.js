const { json } = require("./_supabase");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  json(res, 200, {
    ok: true,
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    publicAuthConfig: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeMonthlyPrice: Boolean(process.env.STRIPE_PLUS_MONTHLY_PRICE_ID || process.env.STRIPE_PLUS_PRICE_ID),
    stripeYearlyPrice: Boolean(process.env.STRIPE_PLUS_YEARLY_PRICE_ID)
  });
};
