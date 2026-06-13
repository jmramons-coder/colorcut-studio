const STORAGE_KEY = "snapuzzle-admin-session";

const loginPanel = document.querySelector("#loginPanel");
const loginForm = document.querySelector("#adminLoginForm");
const adminEmail = document.querySelector("#adminEmail");
const adminPassword = document.querySelector("#adminPassword");
const adminIdentity = document.querySelector("#adminIdentity");
const logoutButton = document.querySelector("#adminLogoutButton");
const statusEl = document.querySelector("#adminStatus");
const dashboard = document.querySelector("#dashboard");
const overviewPanel = document.querySelector("#overviewPanel");
const revenuePanel = document.querySelector("#revenuePanel");
const puzzlePanel = document.querySelector("#puzzlePanel");
const searchForm = document.querySelector("#adminSearchForm");
const searchInput = document.querySelector("#customerEmail");
const usersTable = document.querySelector("#usersTable");
const userFilters = document.querySelector("#userFilters");
const customerDetail = document.querySelector("#customerDetail");
const profilePanel = document.querySelector("#profilePanel");
const stripePanel = document.querySelector("#stripePanel");
const subscriptionPanel = document.querySelector("#subscriptionPanel");
const moneyPanel = document.querySelector("#moneyPanel");
const progressPanel = document.querySelector("#progressPanel");

const state = {
  admin: null,
  customer: null,
  email: "",
  filter: "all",
  session: loadSession()
};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login();
});

logoutButton.addEventListener("click", logout);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadUsers();
});

userFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-user-filter]");
  if (!button) return;
  state.filter = button.dataset.userFilter || "all";
  userFilters.querySelectorAll("[data-user-filter]").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  loadUsers();
});

usersTable.addEventListener("click", (event) => {
  const row = event.target.closest("[data-profile-id]");
  if (!row) return;
  loadCustomer({ profileId: row.dataset.profileId, email: row.dataset.email });
});

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  runAction(actionButton.dataset.action);
});

boot();

async function boot() {
  if (!state.session?.accessToken) {
    showLogin();
    return;
  }

  showDashboardShell();
  try {
    const data = await adminRequest({ view: "me" });
    state.admin = data.admin;
    renderAdminIdentity();
    await Promise.all([loadOverview(), loadUsers()]);
    setStatus("Admin dashboard loaded.");
  } catch (error) {
    clearSession();
    showLogin(error.message || "Log in again.");
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(session) {
  state.session = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  state.session = null;
  localStorage.removeItem(STORAGE_KEY);
}

function showLogin(message = "") {
  loginPanel.hidden = false;
  dashboard.hidden = true;
  adminIdentity.hidden = true;
  logoutButton.hidden = true;
  setStatus(message);
}

function showDashboardShell() {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  adminIdentity.hidden = false;
  logoutButton.hidden = false;
}

function renderAdminIdentity() {
  adminIdentity.textContent = state.admin?.email ? `${state.admin.email} · ${state.admin.role || "admin"}` : "Admin";
}

function setStatus(message = "", isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

function setBusy(isBusy) {
  document.body.classList.toggle("is-busy", isBusy);
}

async function login() {
  const email = adminEmail.value.trim().toLowerCase();
  const password = adminPassword.value;
  if (!email || !password) {
    setStatus("Enter your admin email and password.", true);
    return;
  }

  setBusy(true);
  setStatus("Logging in...");
  try {
    const response = await fetch("/api/auth-password-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Login failed.");

    saveSession(data.session);
    const me = await adminRequest({ view: "me" });
    state.admin = me.admin;
    adminPassword.value = "";
    showDashboardShell();
    renderAdminIdentity();
    await Promise.all([loadOverview(), loadUsers()]);
    setStatus("Admin dashboard loaded.");
  } catch (error) {
    clearSession();
    setStatus(error.message || "Could not log in.", true);
  } finally {
    setBusy(false);
  }
}

function logout() {
  clearSession();
  state.admin = null;
  state.customer = null;
  showLogin("Logged out.");
}

async function adminRequest(payload) {
  if (!state.session?.accessToken) throw new Error("Admin login required.");

  const response = await fetch("/api/admin-customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.session.accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.message || "Admin request failed.");
  }

  return data;
}

async function loadOverview() {
  setBusy(true);
  try {
    const data = await adminRequest({ view: "overview" });
    renderOverview(data.overview || {});
  } catch (error) {
    setStatus(error.message || "Could not load overview.", true);
  } finally {
    setBusy(false);
  }
}

async function loadUsers() {
  setBusy(true);
  try {
    const data = await adminRequest({
      view: "users",
      search: searchInput.value.trim(),
      status: state.filter
    });
    renderUsers(data.users || []);
  } catch (error) {
    setStatus(error.message || "Could not load users.", true);
  } finally {
    setBusy(false);
  }
}

async function loadCustomer({ profileId = "", email = "" } = {}) {
  setBusy(true);
  setStatus("Loading customer...");
  try {
    const data = await adminRequest({ profileId, email });
    state.customer = data;
    state.email = data.profile?.email || email || "";
    renderCustomerDetail(data);
    customerDetail.hidden = false;
    customerDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    setStatus("Customer loaded.");
  } catch (error) {
    setStatus(error.message || "Could not load customer.", true);
  } finally {
    setBusy(false);
  }
}

async function runAction(action) {
  const email = state.customer?.profile?.email || state.email || "";
  const profileId = state.customer?.profile?.id || "";
  if (!email && !profileId) {
    setStatus("Select a customer first.", true);
    return;
  }

  const payload = { action, email, profileId };

  if (action === "cancel_subscription") {
    const value = window.prompt("Type cancel to cancel the latest Stripe subscription.");
    if (value !== "cancel") return;
    payload.confirm = "cancel";
  }

  if (action === "delete_supabase") {
    const value = window.prompt("Type delete to remove Supabase auth/profile/progress for this test account. Stripe is not deleted.");
    if (value !== "delete") return;
    payload.confirm = "delete";
  }

  setBusy(true);
  setStatus("Running admin action...");
  try {
    const data = await adminRequest(payload);
    state.customer = data;
    renderCustomerDetail(data);
    await Promise.all([loadOverview(), loadUsers()]);
    setStatus(data.message || "Action complete.");
  } catch (error) {
    setStatus(error.message || "Action failed.", true);
  } finally {
    setBusy(false);
  }
}

function renderOverview(overview) {
  const revenue = overview.revenue || {};
  const events = overview.events || {};
  overviewPanel.innerHTML = [
    kpi("Total users", overview.totalUsers || 0),
    kpi("Paid users", overview.paidUsers || 0),
    kpi("Free users", overview.freeUsers || 0),
    kpi("Active 7d", overview.activeUsers7d || 0),
    kpi("MRR", money(revenue.mrrCents || 0, revenue.currency || "usd")),
    kpi("Total paid", money(revenue.totalPaidCents || 0, revenue.currency || "usd")),
    kpi("Waitlist", overview.waitlistCount || 0),
    kpi("Puzzle plays", overview.totalPlays || 0),
    kpi("Pricing opens", events.pricingOpened || 0),
    kpi("Locked taps", events.lockedClicks || 0),
    kpi("Scratch done", events.scratchCompleted || 0),
    kpi("Checkout rate", `${events.checkoutCompletionRate || 0}%`)
  ].join("");

  revenuePanel.innerHTML = `
    <p class="eyebrow">Revenue</p>
    <h2>Stripe snapshot</h2>
    ${kv([
      ["MRR", safeText(money(revenue.mrrCents || 0, revenue.currency || "usd"))],
      ["Total paid", safeText(money(revenue.totalPaidCents || 0, revenue.currency || "usd"))],
      ["Active Stripe subs", safeText(revenue.activeStripeSubscriptions || 0)],
      ["Mirrored active subs", safeText(overview.activeSubscriptions || 0)],
      ["Canceled/problem subs", safeText(overview.canceledSubscriptions || 0)]
    ])}
    <p class="fine-print">Revenue is a quick Stripe snapshot from recent charges/subscriptions. Stripe remains the accounting source of truth.</p>
  `;

  puzzlePanel.innerHTML = `
    <p class="eyebrow">Product analytics</p>
    <h2>Funnel</h2>
    ${kv([
      ["App opens", safeText(events.appOpened || 0)],
      ["Puzzle views", safeText(events.puzzleViewed || 0)],
      ["Puzzle starts", safeText(events.puzzleStarted || 0)],
      ["Puzzle assembled", safeText(events.puzzleCompleted || 0)],
      ["Scratch complete", safeText(events.scratchCompleted || 0)],
      ["First-puzzle rate", safeText(`${events.firstPuzzleCompletionRate || 0}%`)],
      ["Pricing opens", safeText(events.pricingOpened || 0)],
      ["Checkout starts", safeText(events.checkoutStarted || 0)]
    ])}
    <h3>Premium demand</h3>
    ${(events.lockedDemand || []).length ? list(events.lockedDemand.map((item) => `
      <div class="row"><strong>${safeText(item.puzzleId || item.category || item.id)}</strong><span class="badge">${safeText(item.count)} taps</span></div>
      <span class="muted">${safeText(item.category)} · ${safeText(item.tier)}</span>
    `)) : `<p class="empty">No locked puzzle taps yet.</p>`}
    <h3>Top completed puzzles</h3>
    ${(overview.topPuzzles || []).length ? list(overview.topPuzzles.map((item) => `
      <div class="row"><strong>${safeText(item.puzzleId)}</strong><span class="badge">${safeText(item.plays)} plays</span></div>
      <span class="muted">${safeText(item.completions)} completed profiles</span>
    `)) : `<p class="empty">No puzzle usage yet.</p>`}
  `;
}

function renderUsers(users) {
  if (!users.length) {
    usersTable.innerHTML = `<tr><td colspan="5" class="empty-cell">No users found.</td></tr>`;
    return;
  }

  usersTable.innerHTML = users.map((user) => `
    <tr data-profile-id="${escapeHtml(user.id)}" data-email="${escapeHtml(user.email || "")}" tabindex="0">
      <td>
        <strong>${safeText(user.email)}</strong>
        <span class="table-muted">${safeText(user.displayName)}</span>
      </td>
      <td>${badge(user.subscriptionStatus)}</td>
      <td>
        <strong>${safeText(user.usage?.totalPlays || 0)} plays</strong>
        <span class="table-muted">${safeText(user.usage?.completedPuzzles || 0)} puzzles</span>
      </td>
      <td>${safeText(dateLabel(user.usage?.lastCompletedAt || user.updatedAt))}</td>
      <td>${user.stripeCustomerId ? badge("linked") : badge("none")}</td>
    </tr>
  `).join("");
}

function renderCustomerDetail(data) {
  renderProfile(data);
  renderStripe(data);
  renderSubscriptions(data);
  renderMoney(data);
  renderProgress(data);
}

function kpi(label, value) {
  return `
    <article class="kpi-card">
      <span>${escapeHtml(label)}</span>
      <strong>${safeText(value)}</strong>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeText(value, fallback = "None") {
  const text = value === null || value === undefined || value === "" ? fallback : value;
  return escapeHtml(text);
}

function badge(value) {
  const label = String(value || "none");
  return `<span class="badge ${escapeHtml(label.toLowerCase())}">${escapeHtml(label)}</span>`;
}

function dateLabel(value) {
  if (!value) return "None";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function money(cents, currency = "usd") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: String(currency || "usd").toUpperCase()
  }).format(Number(cents || 0) / 100);
}

function link(url, label) {
  if (!url) return "None";
  return `<a class="small-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function kv(rows) {
  return `<dl class="kv">${rows.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
}

function renderProfile(data) {
  const profile = data.profile;
  const authUser = data.authUser;

  if (!profile) {
    profilePanel.innerHTML = `
      <p class="eyebrow">Supabase</p>
      <h2>No app profile</h2>
      <p class="empty">No Supabase profile exists for this email yet.</p>
    `;
    return;
  }

  profilePanel.innerHTML = `
    <p class="eyebrow">Supabase</p>
    <h2>App profile</h2>
    ${kv([
      ["Email", safeText(profile.email)],
      ["Status", badge(profile.subscriptionStatus)],
      ["Display name", safeText(profile.displayName)],
      ["Avatar", safeText(profile.avatar)],
      ["Profile ID", safeText(profile.id)],
      ["Auth user", safeText(profile.authUserId)],
      ["Auth email", safeText(authUser?.email)],
      ["Last sign in", safeText(dateLabel(authUser?.lastSignInAt))],
      ["Created", safeText(dateLabel(profile.createdAt))]
    ])}
  `;
}

function renderStripe(data) {
  const stripe = data.stripe || {};
  const customer = stripe.customer;

  if (!stripe.configured) {
    stripePanel.innerHTML = `
      <p class="eyebrow">Stripe</p>
      <h2>Not connected</h2>
      <p class="empty">Stripe env vars are missing.</p>
    `;
    return;
  }

  if (!customer) {
    stripePanel.innerHTML = `
      <p class="eyebrow">Stripe</p>
      <h2>No customer</h2>
      <p class="empty">No Stripe customer was found for this email.</p>
    `;
    return;
  }

  stripePanel.innerHTML = `
    <p class="eyebrow">Stripe</p>
    <h2>Billing customer</h2>
    ${kv([
      ["Email", safeText(customer.email)],
      ["Customer ID", safeText(customer.id)],
      ["Name", safeText(customer.name)],
      ["Delinquent", badge(customer.delinquent ? "yes" : "no")],
      ["Dashboard", link(customer.url, "Open in Stripe")],
      ["Created", safeText(dateLabel(customer.createdAt))]
    ])}
  `;
}

function renderSubscriptions(data) {
  const localSubscriptions = data.subscriptions || [];
  const stripeSubscriptions = data.stripe?.subscriptions || [];

  subscriptionPanel.innerHTML = `
    <p class="eyebrow">Access</p>
    <h2>Subscriptions</h2>
    <h3>Stripe</h3>
    ${stripeSubscriptions.length ? list(stripeSubscriptions.map((item) => `
      <div class="row"><strong>${safeText(item.id)}</strong>${badge(item.status)}</div>
      <span class="muted">Renews/ends: ${safeText(dateLabel(item.currentPeriodEnd))}</span>
      <span>${link(item.url, "Open subscription")}</span>
    `)) : `<p class="empty">No Stripe subscriptions.</p>`}
    <h3>Supabase mirror</h3>
    ${localSubscriptions.length ? list(localSubscriptions.map((item) => `
      <div class="row"><strong>${safeText(item.stripeSubscriptionId)}</strong>${badge(item.status)}</div>
      <span class="muted">Price: ${safeText(item.priceId)}</span>
      <span class="muted">Current period end: ${safeText(dateLabel(item.currentPeriodEnd))}</span>
    `)) : `<p class="empty">No mirrored subscriptions.</p>`}
  `;
}

function renderMoney(data) {
  const invoices = data.stripe?.invoices || [];
  const charges = data.stripe?.charges || [];
  const total = data.money?.totalPaidCents || 0;
  const currency = data.money?.currency || "usd";

  moneyPanel.innerHTML = `
    <p class="eyebrow">Revenue</p>
    <h2>Payments</h2>
    <div class="money-total">${escapeHtml(money(total, currency))}</div>
    <p class="muted">Total paid charges found for this Stripe customer.</p>
    <h3>Latest invoices</h3>
    ${invoices.length ? list(invoices.slice(0, 5).map((item) => `
      <div class="row"><strong>${safeText(item.number || item.id)}</strong>${badge(item.status)}</div>
      <span>${safeText(money(item.amountPaid, item.currency))} paid</span>
      <span>${link(item.hostedInvoiceUrl, "Open invoice")}</span>
    `)) : `<p class="empty">No invoices.</p>`}
    <h3>Latest charges</h3>
    ${charges.length ? list(charges.slice(0, 5).map((item) => `
      <div class="row"><strong>${safeText(money(item.amount, item.currency))}</strong>${badge(item.refunded ? "refunded" : item.status)}</div>
      <span class="muted">${safeText(dateLabel(item.createdAt))}</span>
      <span>${link(item.receiptUrl, "Receipt")}</span>
    `)) : `<p class="empty">No charges.</p>`}
  `;
}

function renderProgress(data) {
  const completions = data.completions || [];
  const totalPlays = completions.reduce((sum, item) => sum + Number(item.plays || 0), 0);

  progressPanel.innerHTML = `
    <p class="eyebrow">Product usage</p>
    <h2>Puzzle progress</h2>
    ${kv([
      ["Completed puzzles", safeText(completions.length)],
      ["Total plays", safeText(totalPlays)]
    ])}
    ${completions.length ? list(completions.map((item) => `
      <div class="row"><strong>${safeText(item.puzzle_id)}</strong><span class="badge">${safeText(item.plays)} plays</span></div>
      <span class="muted">Last completed: ${safeText(dateLabel(item.last_completed_at))}</span>
      <span class="muted">Best time: ${item.best_time_ms ? `${safeText(Math.round(item.best_time_ms / 1000))}s` : "None"}</span>
    `)) : `<p class="empty">No saved completions yet.</p>`}
  `;
}

function list(items) {
  return `<ul class="list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}
