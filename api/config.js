const { json } = require("./_supabase");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  json(res, 200, {
    ok: true,
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    authReady: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
};
