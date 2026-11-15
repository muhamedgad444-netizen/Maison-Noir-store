import { saveOrder, listRecentOrders } from "../backend/supabase.js";
import { sendOrderConfirmationEmail } from "../backend/email.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const saved = await saveOrder(body);
      const emailDispatch = await sendOrderConfirmationEmail(body).catch(() => null);
      return res.status(201).json({ status: "saved", order: saved || body, emailDispatch });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Could not save order." });
    }
  }

  if (req.method === "GET") {
    try {
      const orders = await listRecentOrders(20);
      return res.status(200).json({ orders });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Could not load orders." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
