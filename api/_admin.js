const crypto = require("crypto");
const { json } = require("./_supabase");

function adminSecret() {
  return String(process.env.ADMIN_SECRET || "").trim();
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (!leftBuffer.length || leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function requestAdminSecret(req, body = {}) {
  const auth = String(req.headers.authorization || "");
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  return String(req.headers["x-admin-secret"] || body.adminSecret || bearer || "").trim();
}

function requireAdmin(req, res, body = {}) {
  const expected = adminSecret();
  if (!expected) {
    json(res, 503, {
      ok: false,
      message: "Admin access is not configured. Add ADMIN_SECRET in Vercel."
    });
    return false;
  }

  if (!timingSafeEqualText(requestAdminSecret(req, body), expected)) {
    json(res, 401, { ok: false, message: "Invalid admin secret." });
    return false;
  }

  return true;
}

function stripeDashboardBase() {
  return String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_")
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
}

function stripeCustomerUrl(customerId) {
  return customerId ? `${stripeDashboardBase()}/customers/${customerId}` : "";
}

function stripeSubscriptionUrl(subscriptionId) {
  return subscriptionId ? `${stripeDashboardBase()}/subscriptions/${subscriptionId}` : "";
}

module.exports = {
  requireAdmin,
  stripeCustomerUrl,
  stripeSubscriptionUrl
};
