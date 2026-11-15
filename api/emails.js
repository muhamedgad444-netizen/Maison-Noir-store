import { sendMaisonNoirEmails } from "../backend/email.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const recipients = Array.isArray(body.recipients)
      ? body.recipients
      : body.email
        ? [{ name: body.name || "Maison Noir Client", email: body.email, notes: body.notes || "none" }]
        : [];
    const result = await sendMaisonNoirEmails({ recipients });
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: e.message || "Could not dispatch emails." });
  }
}
