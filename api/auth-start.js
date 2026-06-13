const { isValidEmail, json, normalizeEmail, readJson, supabasePublic } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      json(res, 400, { ok: false, message: "Enter a valid parent email." });
      return;
    }

    const supabase = supabasePublic();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase auth is not configured yet." });
      return;
    }

    const appUrl = process.env.APP_URL || "https://colorcut-studio.vercel.app";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: appUrl
      }
    });

    if (error) throw error;

    json(res, 200, { ok: true, email });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not send the login code."
    });
  }
};
