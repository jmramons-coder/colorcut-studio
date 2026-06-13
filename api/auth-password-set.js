const crypto = require("crypto");
const {
  bearerToken,
  isValidEmail,
  json,
  normalizeEmail,
  readJson,
  supabaseAdmin,
  supabasePublic,
  upsertProfileForUser
} = require("./_supabase");
const { appUrl, memberProfileForEmail, syncCheckoutAccount } = require("./_stripe");

async function startPasswordReset(email) {
  if (!isValidEmail(email)) {
    return {
      status: 400,
      body: { ok: false, message: "Enter a valid email." }
    };
  }

  const memberProfile = await memberProfileForEmail(email);
  if (!memberProfile) {
    return {
      status: 404,
      body: {
        ok: false,
        code: "account_not_found",
        message: "No member account found for this email. Subscribe first, then create your password."
      }
    };
  }

  const admin = supabaseAdmin();
  const publicClient = supabasePublic();
  if (!admin || !publicClient) {
    return {
      status: 503,
      body: { ok: false, message: "Supabase auth is not configured yet." }
    };
  }

  if (!memberProfile.auth_user_id) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: crypto.randomBytes(24).toString("base64url"),
      email_confirm: true
    });
    const alreadyExists = /already|registered|exists/i.test(error?.message || "");
    if (error && !alreadyExists) throw error;

    if (data?.user?.id) {
      const { error: linkError } = await admin
        .from("profiles")
        .update({ auth_user_id: data.user.id })
        .eq("id", memberProfile.id);
      if (linkError) throw linkError;
    }
  }

  const { error } = await publicClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl()}/?auth=recovery`
  });
  if (error) throw error;

  return {
    status: 200,
    body: { ok: true, email }
  };
}

async function completePasswordReset(req, body) {
  const password = String(body.password || "");
  const refreshToken = String(body.refreshToken || "");
  const expiresAt = Number(body.expiresAt || 0);
  const accessToken = bearerToken(req);

  if (!accessToken) {
    return {
      status: 401,
      body: { ok: false, message: "Open the newest password reset link from your email." }
    };
  }

  if (password.length < 8) {
    return {
      status: 400,
      body: { ok: false, message: "Use at least 8 characters." }
    };
  }

  const publicClient = supabasePublic();
  const admin = supabaseAdmin();
  if (!publicClient || !admin) {
    return {
      status: 503,
      body: { ok: false, message: "Account access is not configured yet." }
    };
  }

  const { data: userData, error: userError } = await publicClient.auth.getUser(accessToken);
  if (userError) throw userError;

  const email = normalizeEmail(userData.user?.email);
  if (!isValidEmail(email)) {
    return {
      status: 401,
      body: { ok: false, message: "This reset link is not linked to an email." }
    };
  }

  const memberProfile = await memberProfileForEmail(email);
  if (!memberProfile) {
    return {
      status: 404,
      body: {
        ok: false,
        code: "account_not_found",
        message: "No paid member account found for this email."
      }
    };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userData.user.id, {
    password,
    email_confirm: true
  });
  if (updateError) throw updateError;

  if (!memberProfile.auth_user_id) {
    const { error: linkError } = await admin
      .from("profiles")
      .update({ auth_user_id: userData.user.id })
      .eq("id", memberProfile.id);
    if (linkError) throw linkError;
  }

  const profile = await upsertProfileForUser(userData.user);

  return {
    status: 200,
    body: {
      ok: true,
      user: {
        id: userData.user.id,
        email
      },
      session: {
        accessToken,
        refreshToken,
        expiresAt
      },
      profile
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
    const action = String(body.action || "").trim();

    if (action === "reset-start") {
      const result = await startPasswordReset(normalizeEmail(body.email));
      json(res, result.status, result.body);
      return;
    }

    if (action === "reset-complete") {
      const result = await completePasswordReset(req, body);
      json(res, result.status, result.body);
      return;
    }

    const password = String(body.password || "");
    const checkoutSessionId = String(body.checkoutSessionId || body.sessionId || "").trim();
    const checkout = await syncCheckoutAccount(checkoutSessionId);
    const email = checkout?.email || "";

    if (!isValidEmail(email)) {
      json(res, 401, {
        ok: false,
        code: "checkout_required",
        message: "Open account setup from your completed checkout."
      });
      return;
    }

    if (password.length < 8) {
      json(res, 400, { ok: false, message: "Use at least 8 characters." });
      return;
    }

    const memberProfile = await memberProfileForEmail(email);
    if (!memberProfile) {
      json(res, 404, {
        ok: false,
        code: "account_not_found",
        message: "No paid member account found for this email yet."
      });
      return;
    }

    const admin = supabaseAdmin();
    const publicClient = supabasePublic();
    if (!admin || !publicClient) {
      json(res, 503, { ok: false, message: "Account access is not configured yet." });
      return;
    }

    let userId = memberProfile.auth_user_id;
    if (userId) {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true
      });
      if (error) throw error;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) throw error;
      userId = data.user.id;
      const { error: linkError } = await admin
        .from("profiles")
        .update({ auth_user_id: userId })
        .eq("id", memberProfile.id);
      if (linkError) throw linkError;
    }

    const { data, error } = await publicClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    const profile = await upsertProfileForUser(data.user);

    json(res, 200, {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      },
      profile
    });
  } catch (error) {
    json(res, 500, {
      ok: false,
      code: "password_set_failed",
      message: error.message || "Could not set the password."
    });
  }
};
