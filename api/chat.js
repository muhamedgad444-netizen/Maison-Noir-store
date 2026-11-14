import { askLaylaNoor } from "../backend/chat.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const out = await askLaylaNoor({
      chatInput: String(body.chatInput || body.message || ""),
      sessionId: String(body.sessionId || "maison-noir-guest"),
      reset: Boolean(body.reset),
      mlConstraints: body.mlConstraints || {},
    });
    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Layla Noor is unavailable right now." });
  }
}
