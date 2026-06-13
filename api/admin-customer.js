const { isValidEmail, json, normalizeEmail, readJson, supabaseAdmin } = require("./_supabase");
const { requireAdmin, stripeCustomerUrl, stripeSubscriptionUrl } = require("./_admin");
const { ACTIVE_SUBSCRIPTION_STATUSES, stripeClient, syncSubscription } = require("./_stripe");

function serializeProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    authUserId: profile.auth_user_id,
    email: profile.email,
    displayName: profile.display_name,
    avatar: profile.avatar,
    stripeCustomerId: profile.stripe_customer_id,
    subscriptionStatus: profile.subscription_status,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  };
}

function serializeSubscription(subscription) {
  if (!subscription) return null;
  return {
    id: subscription.id,
    profileId: subscription.profile_id,
    stripeCustomerId: subscription.stripe_customer_id,
    stripeSubscriptionId: subscription.stripe_subscription_id,
    status: subscription.status,
    priceId: subscription.price_id,
    currentPeriodEnd: subscription.current_period_end,
    updatedAt: subscription.updated_at,
    stripeUrl: stripeSubscriptionUrl(subscription.stripe_subscription_id)
  };
}

function serializeStripeCustomer(customer) {
  if (!customer || customer.deleted) return null;
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    createdAt: customer.created ? new Date(customer.created * 1000).toISOString() : null,
    delinquent: Boolean(customer.delinquent),
    url: stripeCustomerUrl(customer.id)
  };
}

function serializeStripeSubscription(subscription) {
  if (!subscription) return null;
  return {
    id: subscription.id,
    status: subscription.status,
    priceId: subscription.items?.data?.[0]?.price?.id || null,
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    url: stripeSubscriptionUrl(subscription.id)
  };
}

function serializeInvoice(invoice) {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    createdAt: invoice.created ? new Date(invoice.created * 1000).toISOString() : null
  };
}

function serializeCharge(charge) {
  return {
    id: charge.id,
    status: charge.status,
    amount: charge.amount,
    currency: charge.currency,
    paid: Boolean(charge.paid),
    refunded: Boolean(charge.refunded),
    receiptUrl: charge.receipt_url,
    createdAt: charge.created ? new Date(charge.created * 1000).toISOString() : null
  };
}

async function countedQuery(query) {
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function countTable(supabase, table) {
  return countedQuery(supabase.from(table).select("id", { count: "exact", head: true }));
}

function centsToMonthly(subscription) {
  const item = subscription.items?.data?.[0];
  const amount = Number(item?.price?.unit_amount || 0);
  const interval = item?.price?.recurring?.interval;
  if (!amount) return 0;
  if (interval === "year") return Math.round(amount / 12);
  return amount;
}

async function revenueOverview() {
  const stripe = stripeClient();
  if (!stripe) {
    return {
      configured: false,
      mrrCents: 0,
      totalPaidCents: 0,
      currency: "usd",
      activeStripeSubscriptions: 0
    };
  }

  const [subscriptions, charges] = await Promise.all([
    stripe.subscriptions.list({ status: "active", limit: 100 }),
    stripe.charges.list({ limit: 100 })
  ]);

  const mrrCents = subscriptions.data.reduce((sum, subscription) => sum + centsToMonthly(subscription), 0);
  const paidCharges = charges.data.filter((charge) => charge.paid && !charge.refunded);
  const totalPaidCents = paidCharges.reduce((sum, charge) => sum + Number(charge.amount || 0), 0);

  return {
    configured: true,
    mrrCents,
    totalPaidCents,
    currency: paidCharges[0]?.currency || subscriptions.data[0]?.currency || "usd",
    activeStripeSubscriptions: subscriptions.data.length
  };
}

async function adminOverview(supabase) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsers,
    paidUsers,
    freeUsers,
    activeSubscriptions,
    canceledSubscriptions,
    waitlistCount,
    completionRows,
    recentCompletionRows,
    revenue
  ] = await Promise.all([
    countTable(supabase, "profiles"),
    countedQuery(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "plus")),
    countedQuery(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "free")),
    countedQuery(supabase.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"])),
    countedQuery(supabase.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["canceled", "unpaid", "past_due"])),
    countTable(supabase, "waitlist_leads"),
    supabase.from("puzzle_completions").select("profile_id,puzzle_id,plays,last_completed_at").limit(1000),
    supabase.from("puzzle_completions").select("profile_id,last_completed_at").gte("last_completed_at", sevenDaysAgo).limit(1000),
    revenueOverview()
  ]);

  if (completionRows.error) throw completionRows.error;
  if (recentCompletionRows.error) throw recentCompletionRows.error;

  const completions = completionRows.data || [];
  const recentActiveProfiles = new Set((recentCompletionRows.data || []).map((row) => row.profile_id).filter(Boolean));
  const totalPlays = completions.reduce((sum, row) => sum + Number(row.plays || 0), 0);
  const puzzleCounts = new Map();
  completions.forEach((row) => {
    const existing = puzzleCounts.get(row.puzzle_id) || { puzzleId: row.puzzle_id, completions: 0, plays: 0 };
    existing.completions += 1;
    existing.plays += Number(row.plays || 0);
    puzzleCounts.set(row.puzzle_id, existing);
  });

  return {
    ok: true,
    overview: {
      totalUsers,
      paidUsers,
      freeUsers,
      activeSubscriptions,
      canceledSubscriptions,
      waitlistCount,
      activeUsers7d: recentActiveProfiles.size,
      completedPuzzleRows: completions.length,
      totalPlays,
      revenue,
      topPuzzles: Array.from(puzzleCounts.values())
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 8)
    }
  };
}

async function adminUsers(supabase, body) {
  const search = normalizeEmail(body.search || body.email || "");
  const status = String(body.status || "all").toLowerCase();
  const limit = Math.min(Math.max(Number(body.limit || 50), 1), 100);

  let query = supabase
    .from("profiles")
    .select("id,email,display_name,avatar,subscription_status,stripe_customer_id,auth_user_id,created_at,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (search) query = query.ilike("email", `%${search}%`);
  if (status === "plus" || status === "free") query = query.eq("subscription_status", status);

  const { data: profiles, count, error } = await query;
  if (error) throw error;

  const profileIds = (profiles || []).map((profile) => profile.id);
  let subscriptions = [];
  let completions = [];

  if (profileIds.length) {
    const [subscriptionRows, completionRows] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("profile_id,status,price_id,current_period_end,updated_at")
        .in("profile_id", profileIds)
        .order("updated_at", { ascending: false }),
      supabase
        .from("puzzle_completions")
        .select("profile_id,puzzle_id,plays,last_completed_at")
        .in("profile_id", profileIds)
    ]);

    if (subscriptionRows.error) throw subscriptionRows.error;
    if (completionRows.error) throw completionRows.error;
    subscriptions = subscriptionRows.data || [];
    completions = completionRows.data || [];
  }

  const subscriptionByProfile = new Map();
  subscriptions.forEach((subscription) => {
    if (!subscriptionByProfile.has(subscription.profile_id)) {
      subscriptionByProfile.set(subscription.profile_id, subscription);
    }
  });

  const usageByProfile = new Map();
  completions.forEach((completion) => {
    const usage = usageByProfile.get(completion.profile_id) || {
      completedPuzzles: 0,
      totalPlays: 0,
      lastCompletedAt: null
    };
    usage.completedPuzzles += 1;
    usage.totalPlays += Number(completion.plays || 0);
    if (!usage.lastCompletedAt || new Date(completion.last_completed_at || 0) > new Date(usage.lastCompletedAt || 0)) {
      usage.lastCompletedAt = completion.last_completed_at;
    }
    usageByProfile.set(completion.profile_id, usage);
  });

  return {
    ok: true,
    count: count || 0,
    users: (profiles || []).map((profile) => ({
      ...serializeProfile(profile),
      subscription: subscriptionByProfile.get(profile.id) || null,
      usage: usageByProfile.get(profile.id) || {
        completedPuzzles: 0,
        totalPlays: 0,
        lastCompletedAt: null
      }
    }))
  };
}

async function profileByEmail(supabase, email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function profileById(supabase, id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function profileByCustomer(supabase, customerId) {
  if (!customerId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function subscriptionsForProfile(supabase, profile, customerId) {
  let query = supabase
    .from("subscriptions")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (profile?.id) {
    query = query.eq("profile_id", profile.id);
  } else if (customerId) {
    query = query.eq("stripe_customer_id", customerId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function completionsForProfile(supabase, profileId) {
  if (!profileId) return [];
  const { data, error } = await supabase
    .from("puzzle_completions")
    .select("puzzle_id,plays,best_time_ms,last_completed_at")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}

async function authUserForProfile(supabase, profile) {
  if (!profile?.auth_user_id) return null;
  const { data, error } = await supabase.auth.admin.getUserById(profile.auth_user_id);
  if (error) return { id: profile.auth_user_id, error: error.message };
  return data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.created_at,
        lastSignInAt: data.user.last_sign_in_at,
        emailConfirmedAt: data.user.email_confirmed_at
      }
    : null;
}

async function stripeSnapshot(stripe, { email, customerId }) {
  if (!stripe) {
    return {
      configured: false,
      customer: null,
      subscriptions: [],
      invoices: [],
      charges: []
    };
  }

  let customer = null;
  if (customerId) {
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      if (error?.type !== "StripeInvalidRequestError" && error?.type !== "invalid_request_error") throw error;
    }
  }

  if ((!customer || customer.deleted) && email) {
    const customers = await stripe.customers.list({ email, limit: 1 });
    customer = customers.data[0] || null;
  }

  if (!customer || customer.deleted) {
    return {
      configured: true,
      customer: null,
      subscriptions: [],
      invoices: [],
      charges: []
    };
  }

  const [subscriptions, invoices, charges] = await Promise.all([
    stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 10 }),
    stripe.invoices.list({ customer: customer.id, limit: 10 }),
    stripe.charges.list({ customer: customer.id, limit: 10 })
  ]);

  return {
    configured: true,
    customer: serializeStripeCustomer(customer),
    subscriptions: subscriptions.data.map(serializeStripeSubscription),
    invoices: invoices.data.map(serializeInvoice),
    charges: charges.data.map(serializeCharge)
  };
}

async function lookupCustomer({ email, profileId }) {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return { status: 503, body: { ok: false, message: "Supabase admin is not configured." } };
  }

  const stripe = stripeClient();
  let profile = profileId ? await profileById(supabase, profileId) : null;
  if (!profile && email) profile = await profileByEmail(supabase, email);

  let stripeData = await stripeSnapshot(stripe, {
    email: email || profile?.email || "",
    customerId: profile?.stripe_customer_id || ""
  });

  if (!profile && stripeData.customer?.id) {
    profile = await profileByCustomer(supabase, stripeData.customer.id);
  }

  const [subscriptions, completions, authUser] = await Promise.all([
    subscriptionsForProfile(supabase, profile, stripeData.customer?.id || profile?.stripe_customer_id),
    completionsForProfile(supabase, profile?.id),
    authUserForProfile(supabase, profile)
  ]);

  const totalPaidCents = stripeData.charges
    .filter((charge) => charge.paid && !charge.refunded)
    .reduce((sum, charge) => sum + Number(charge.amount || 0), 0);

  return {
    status: 200,
    body: {
      ok: true,
      profile: serializeProfile(profile),
      authUser,
      subscriptions: subscriptions.map(serializeSubscription),
      completions,
      stripe: stripeData,
      money: {
        totalPaidCents,
        currency: stripeData.charges.find((charge) => charge.currency)?.currency || "usd"
      }
    }
  };
}

async function latestStripeSubscription(stripe, profile, email) {
  const stripeData = await stripeSnapshot(stripe, {
    email: email || profile?.email || "",
    customerId: profile?.stripe_customer_id || ""
  });
  return {
    stripeData,
    subscription: stripeData.subscriptions[0] || null
  };
}

async function grantCompPlus(supabase, email) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        email,
        subscription_status: "plus"
      },
      { onConflict: "email" }
    );
  if (error) throw error;
}

async function removeCompPlus(supabase, profile, email) {
  const stripe = stripeClient();
  const { subscription } = await latestStripeSubscription(stripe, profile, email);
  if (subscription && ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.status || "").toLowerCase())) {
    return {
      status: 409,
      body: { ok: false, message: "This user has an active Stripe subscription. Cancel billing in Stripe instead." }
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_status: "free" })
    .eq("id", profile.id);
  if (error) throw error;

  return null;
}

async function syncFromStripe(supabase, profile, email) {
  const stripe = stripeClient();
  if (!stripe) {
    return {
      status: 503,
      body: { ok: false, message: "Stripe is not configured." }
    };
  }

  const { stripeData, subscription } = await latestStripeSubscription(stripe, profile, email);
  if (!stripeData.customer?.id) {
    return {
      status: 404,
      body: { ok: false, message: "No Stripe customer found for this email." }
    };
  }

  await syncSubscription({
    email: normalizeEmail(stripeData.customer.email || email || profile?.email),
    customerId: stripeData.customer.id,
    subscriptionId: subscription?.id || null,
    status: subscription?.status || "canceled",
    priceId: subscription?.priceId || null,
    currentPeriodEnd: subscription?.currentPeriodEnd
      ? Math.floor(new Date(subscription.currentPeriodEnd).getTime() / 1000)
      : null
  });

  if (!subscription) {
    const syncedProfile = profile || await profileByEmail(supabase, normalizeEmail(stripeData.customer.email || email));
    if (syncedProfile?.id) {
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "free", stripe_customer_id: stripeData.customer.id })
        .eq("id", syncedProfile.id);
      if (error) throw error;
    }
  }

  return null;
}

async function cancelLatestSubscription(profile, email) {
  const stripe = stripeClient();
  if (!stripe) {
    return {
      status: 503,
      body: { ok: false, message: "Stripe is not configured." }
    };
  }

  const { subscription, stripeData } = await latestStripeSubscription(stripe, profile, email);
  if (!subscription?.id) {
    return {
      status: 404,
      body: { ok: false, message: "No Stripe subscription found." }
    };
  }

  const canceled = await stripe.subscriptions.cancel(subscription.id);
  await syncSubscription({
    email: normalizeEmail(stripeData.customer?.email || email || profile?.email),
    customerId: stripeData.customer.id,
    subscriptionId: canceled.id,
    status: canceled.status,
    priceId: canceled.items?.data?.[0]?.price?.id,
    currentPeriodEnd: canceled.current_period_end
  });

  return null;
}

async function deleteSupabaseAccount(supabase, profile) {
  if (!profile?.id) {
    return {
      status: 404,
      body: { ok: false, message: "No Supabase profile found to delete." }
    };
  }

  if (profile.auth_user_id) {
    const { error } = await supabase.auth.admin.deleteUser(profile.auth_user_id);
    if (error && !/not found/i.test(error.message || "")) throw error;
  }

  if (profile.stripe_customer_id) {
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("stripe_customer_id", profile.stripe_customer_id);
    if (subscriptionError) throw subscriptionError;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profile.id);
  if (profileError) throw profileError;

  return null;
}

async function performAction(body) {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return { status: 503, body: { ok: false, message: "Supabase admin is not configured." } };
  }

  const action = String(body.action || "").trim();
  const email = normalizeEmail(body.email);
  const profileId = String(body.profileId || "").trim();

  if (!profileId && !isValidEmail(email)) {
    return { status: 400, body: { ok: false, message: "Enter a valid email first." } };
  }

  let profile = profileId ? await profileById(supabase, profileId) : null;
  if (!profile && isValidEmail(email)) profile = await profileByEmail(supabase, email);

  if (action === "grant_comp") {
    if (!isValidEmail(email || profile?.email)) {
      return { status: 400, body: { ok: false, message: "Granting Plus needs an email." } };
    }
    await grantCompPlus(supabase, email || normalizeEmail(profile.email));
  } else if (action === "remove_comp") {
    if (!profile) return { status: 404, body: { ok: false, message: "No profile found." } };
    const blocked = await removeCompPlus(supabase, profile, email);
    if (blocked) return blocked;
  } else if (action === "sync_stripe") {
    const failed = await syncFromStripe(supabase, profile, email);
    if (failed) return failed;
  } else if (action === "cancel_subscription") {
    if (body.confirm !== "cancel") {
      return { status: 400, body: { ok: false, message: "Type cancel to confirm." } };
    }
    const failed = await cancelLatestSubscription(profile, email);
    if (failed) return failed;
  } else if (action === "delete_supabase") {
    if (body.confirm !== "delete") {
      return { status: 400, body: { ok: false, message: "Type delete to confirm." } };
    }
    const failed = await deleteSupabaseAccount(supabase, profile);
    if (failed) return failed;
  } else {
    return { status: 400, body: { ok: false, message: "Unknown admin action." } };
  }

  const refreshed = await lookupCustomer({ email: email || normalizeEmail(profile?.email), profileId: profile?.id });
  return {
    status: 200,
    body: {
      ...refreshed.body,
      message: "Admin action completed."
    }
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const supabase = supabaseAdmin();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase admin is not configured." });
      return;
    }

    const view = String(body.view || "").trim();
    if (view === "me") {
      json(res, 200, { ok: true, admin });
      return;
    }

    if (view === "overview") {
      json(res, 200, await adminOverview(supabase));
      return;
    }

    if (view === "users") {
      json(res, 200, await adminUsers(supabase, body));
      return;
    }

    if (body.action) {
      const result = await performAction(body);
      json(res, result.status, result.body);
      return;
    }

    const email = normalizeEmail(body.email);
    const profileId = String(body.profileId || "").trim();
    if (!profileId && !isValidEmail(email)) {
      json(res, 400, { ok: false, message: "Enter a valid email." });
      return;
    }

    const result = await lookupCustomer({ email, profileId });
    json(res, result.status, result.body);
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Admin request failed."
    });
  }
};
