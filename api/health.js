const { json } = require("./_supabase");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  json(res, 200, { ok: true });
};
