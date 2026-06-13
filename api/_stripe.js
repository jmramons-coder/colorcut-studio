const Stripe = require("stripe");
const { normalizeEmail, supabaseAdmin } = require("./_supabase");

const STRIPE_API_VERSION = "2024-06-20";
const MEMBER_STATUSES = new Set(["plus", "active", "trialing"]);
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function appUrl() {
  return process.env.APP_URL || "https://snapuzzle.ca";
}

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION
  });
}

function stripeCustomerId(value) {
  return typeof value === "string" ? value : value?.id || null;
}

function stripeSubscriptionId(value) {
  return typeof value === "string" ? value : value?.id || null;
}

function timestampToIso(value) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function subscriptionStatusForProfile(status) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(String(status || "").toLowerCase()) ? "plus" : "free";
}

function isMemberStatus(status) {
  return MEMBER_STATUSES.has(String(status || "").toLowerCase());
}

async function upsertStripeProfile({ email, customerId, status = "plus" }) {
  const supabase = supabaseAdmin();
  const normalizedEmail = normalizeEmail(email);
  if (!supabase || (!normalizedEmail && !customerId)) return null;

  if (customerId) {
    const { data: existingCustomerProfile, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingCustomerProfile?.id) {
      const updatePayload = {
        subscription_status: status
      };
      if (normalizedEmail) {
        updatePayload.email = normalizedEmail;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", existingCustomerProfile.id)
        .select("id,email,auth_user_id,subscription_status,stripe_customer_id")
        .single();

      if (error) throw error;
      return data;
    }
  }

  if (!normalizedEmail) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        email: normalizedEmail,
        stripe_customer_id: customerId || null,
        subscription_status: status
      },
      { onConflict: "email" }
    )
    .select("id,email,auth_user_id,subscription_status,stripe_customer_id")
    .single();

  if (error) throw error;
  return data;
}

async function memberProfileForEmail(email) {
  const supabase = supabaseAdmin();
  const normalizedEmail = normalizeEmail(email);
  if (!supabase || !normalizedEmail) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,auth_user_id,subscription_status,stripe_customer_id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (isMemberStatus(data.subscription_status)) return data;

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("profile_id", data.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) throw subscriptionError;
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription?.status || "").toLowerCase())) {
    return null;
  }

  return data;
}

async function paidCheckoutAccount(sessionId) {
  const stripe = stripeClient();
  if (!stripe || !sessionId) return null;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    if (error?.type === "StripeInvalidRequestError" || error?.type === "invalid_request_error") {
      return null;
    }
    throw error;
  }
  const email = normalizeEmail(session.customer_details?.email || session.customer_email);
  const customerId = stripeCustomerId(session.customer);
  const subscriptionId = stripeSubscriptionId(session.subscription);

  if (!email || session.payment_status !== "paid" || !subscriptionId) {
    return null;
  }

  return {
    email,
    customerId,
    subscriptionId,
    session
  };
}

async function syncCheckoutAccount(sessionId) {
  const checkout = await paidCheckoutAccount(sessionId);
  if (!checkout) return null;

  const stripe = stripeClient();
  const subscription = checkout.subscriptionId && stripe
    ? await stripe.subscriptions.retrieve(checkout.subscriptionId)
    : null;

  const profile = await syncSubscription({
    email: checkout.email,
    customerId: checkout.customerId,
    subscriptionId: checkout.subscriptionId,
    status: subscription?.status || "active",
    priceId: subscription?.items?.data?.[0]?.price?.id,
    currentPeriodEnd: subscription?.current_period_end
  });

  return {
    ...checkout,
    profile
  };
}

async function emailForCustomer(stripe, customerId) {
  if (!stripe || !customerId) return "";
  const customer = await stripe.customers.retrieve(customerId);
  return normalizeEmail(customer && !customer.deleted ? customer.email : "");
}

async function syncSubscription({ email, customerId, subscriptionId, status, priceId, currentPeriodEnd }) {
  const supabase = supabaseAdmin();
  if (!supabase || !customerId) return null;

  const profile = await upsertStripeProfile({
    email,
    customerId,
    status: subscriptionStatusForProfile(status)
  });

  if (!subscriptionId) return profile;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      profile_id: profile?.id || null,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: status || "incomplete",
      price_id: priceId || null,
      current_period_end: timestampToIso(currentPeriodEnd)
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) throw error;
  return profile;
}

module.exports = {
  ACTIVE_SUBSCRIPTION_STATUSES,
  appUrl,
  emailForCustomer,
  isMemberStatus,
  memberProfileForEmail,
  paidCheckoutAccount,
  stripeClient,
  stripeCustomerId,
  stripeSubscriptionId,
  syncCheckoutAccount,
  syncSubscription
};
