const Stripe = require("stripe");
const { json, normalizeEmail, supabaseAdmin } = require("./_supabase");

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function timestampToIso(value) {
  return value ? new Date(value * 1000).toISOString() : null;
}

async function upsertPremiumProfile({ email, customerId, status }) {
  const supabase = supabaseAdmin();
  if (!supabase || !email) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        email,
        stripe_customer_id: customerId,
        subscription_status: status || "active"
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

async function syncSubscription({ email, customerId, subscriptionId, status, priceId, currentPeriodEnd }) {
  const supabase = supabaseAdmin();
  if (!supabase || !customerId) return;

  const profile = await upsertPremiumProfile({
    email,
    customerId,
    status: status === "active" || status === "trialing" ? "plus" : "free"
  });

  if (!subscriptionId) return;

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
}

async function emailForCustomer(stripe, customerId) {
  if (!customerId) return "";
  const customer = await stripe.customers.retrieve(customerId);
  return normalizeEmail(customer && !customer.deleted ? customer.email : "");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    json(res, 503, { ok: false, message: "Stripe webhook is not configured yet." });
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20"
  });

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      await syncSubscription({
        email: normalizeEmail(session.customer_details?.email || session.customer_email),
        customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
        subscriptionId,
        status: subscription?.status || "active",
        priceId: subscription?.items?.data?.[0]?.price?.id,
        currentPeriodEnd: subscription?.current_period_end
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
      await syncSubscription({
        email: await emailForCustomer(stripe, customerId),
        customerId,
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: subscription.items?.data?.[0]?.price?.id,
        currentPeriodEnd: subscription.current_period_end
      });
    }

    json(res, 200, { ok: true, received: true });
  } catch (error) {
    json(res, 400, {
      ok: false,
      message: error.message || "Stripe webhook failed."
    });
  }
};
