const { bearerToken, json, supabaseAdmin, supabasePublic } = require("./_supabase");

async function requireAdmin(req, res) {
  const token = bearerToken(req);
  if (!token) {
    json(res, 401, { ok: false, message: "Admin login required." });
    return null;
  }

  const publicClient = supabasePublic();
  const adminClient = supabaseAdmin();
  if (!publicClient || !adminClient) {
    json(res, 503, { ok: false, message: "Admin auth is not configured." });
    return null;
  }

  const { data: userData, error: userError } = await publicClient.auth.getUser(token);
  if (userError || !userData?.user?.id) {
    json(res, 401, { ok: false, message: "Admin session expired. Log in again." });
    return null;
  }

  const { data: adminUser, error: adminError } = await adminClient
    .from("admin_users")
    .select("id,auth_user_id,email,role,created_at")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (adminError) {
    json(res, 500, {
      ok: false,
      message: adminError.code === "42P01"
        ? "Admin table is missing. Run the latest Supabase schema."
        : adminError.message || "Could not verify admin access."
    });
    return null;
  }

  if (!adminUser) {
    json(res, 403, { ok: false, message: "This account is not an admin." });
    return null;
  }

  return {
    id: adminUser.id,
    authUserId: adminUser.auth_user_id,
    email: adminUser.email || userData.user.email,
    role: adminUser.role || "admin",
    createdAt: adminUser.created_at,
    user: {
      id: userData.user.id,
      email: userData.user.email
    }
  };
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
