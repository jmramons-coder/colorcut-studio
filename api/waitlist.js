const { isValidEmail, json, normalizeEmail, readJson, supabaseAdmin } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      json(res, 400, { ok: false, message: "Enter a valid email address." });
      return;
    }

    const supabase = supabaseAdmin();
    if (!supabase) {
      json(res, 503, { ok: false, message: "Supabase is not configured yet." });
      return;
    }

    const lead = {
      email,
      source: String(body.source || "website").slice(0, 80),
      page: String(body.page || "").slice(0, 120),
      completed_puzzle_id: body.completedPuzzleId ? String(body.completedPuzzleId).slice(0, 80) : null,
      referrer: String(req.headers.referer || "").slice(0, 500),
      user_agent: String(req.headers["user-agent"] || "").slice(0, 500),
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {}
    };

    const { error } = await supabase.from("waitlist_leads").upsert(lead, {
      onConflict: "email"
    });

    if (error) {
      throw error;
    }

    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 500, {
      ok: false,
      message: error.message || "Could not save the waitlist signup."
    });
  }
};
