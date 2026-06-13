const { createClient } = require("@supabase/supabase-js");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(value);
}

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function supabasePublic() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function bearerToken(req) {
  const value = req.headers.authorization || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function publicProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    avatar: profile.avatar,
    subscriptionStatus: profile.subscription_status
  };
}

async function upsertProfileForUser(user) {
  const supabase = supabaseAdmin();
  if (!supabase || !user?.id || !user?.email) {
    return null;
  }

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id,email,display_name,avatar,subscription_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    return publicProfile(existing);
  }

  const { data: emailProfile, error: emailSelectError } = await supabase
    .from("profiles")
    .select("id,email,display_name,avatar,subscription_status,auth_user_id")
    .eq("email", user.email)
    .maybeSingle();

  if (emailSelectError) {
    throw emailSelectError;
  }

  if (emailProfile) {
    if (!emailProfile.auth_user_id) {
      const { data: linked, error: linkError } = await supabase
        .from("profiles")
        .update({ auth_user_id: user.id })
        .eq("id", emailProfile.id)
        .select("id,email,display_name,avatar,subscription_status")
        .single();

      if (linkError) throw linkError;
      return publicProfile(linked);
    }

    return publicProfile(emailProfile);
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || "Color Maker"
    })
    .select("id,email,display_name,avatar,subscription_status")
    .single();

  if (error) {
    throw error;
  }

  return publicProfile(data);
}

module.exports = {
  bearerToken,
  isValidEmail,
  json,
  normalizeEmail,
  publicProfile,
  readJson,
  supabaseAdmin,
  supabasePublic,
  upsertProfileForUser
};
