const { json, normalizeEmail } = require("./_supabase");
const {
  emailForCustomer,
  stripeClient,
  stripeCustomerId,
  stripeSubscriptionId,
  syncSubscription
} = require("./_stripe");

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const stripe = stripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    json(res, 503, { ok: false, message: "Stripe webhook is not configured yet." });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscriptionId = stripeSubscriptionId(session.subscription);
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      await syncSubscription({
        email: normalizeEmail(session.customer_details?.email || session.customer_email),
        customerId: stripeCustomerId(session.customer),
        subscriptionId,
        status: subscription?.status || "active",
        priceId: subscription?.items?.data?.[0]?.price?.id,
        currentPeriodEnd: subscription?.current_period_end
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = stripeCustomerId(subscription.customer);
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
