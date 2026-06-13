const { json, readJson } = require("./_supabase");
const { syncCheckoutAccount } = require("./_stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const checkoutSessionId = String(body.checkoutSessionId || body.sessionId || "").trim();
    const checkout = await syncCheckoutAccount(checkoutSessionId);

    if (!checkout) {
      json(res, 401, {
        ok: false,
        code: "checkout_required",
        message: "Open account setup from your completed checkout."
      });
      return;
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
