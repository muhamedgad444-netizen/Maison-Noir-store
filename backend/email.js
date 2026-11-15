import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_N8N_EMAIL_WEBHOOK_URL =
  "https://muhamedshalaby.app.n8n.cloud/webhook/maison-noir-emails";

export function composeEmailPreview(recipient = {}) {
  const fullName = String(recipient.name || "Valued Guest").trim();
  const firstName = fullName.split(/\s+/)[0] || "Guest";
  const notes = String(recipient.notes || "").trim();

  const subject = notes
    ? `A scent composed for you, ${firstName}`
    : `An invitation to Maison Noir, ${firstName}`;

  const tailoredParagraph = notes
    ? `<p>We noticed your affinity for ${notes}. Within our atelier in Paris, every Extrait de Parfum is composed to linger on skin and fabric like an unspoken signature—balancing rare botanicals, warm resins, and luminous woods tailored to your presence.</p>`
    : `<p>Within our atelier in Paris, every Extrait de Parfum is composed at a thirty percent essence concentration to linger on skin and fabric like an unspoken signature—balancing rare botanicals, warm resins, and luminous woods.</p>`;

  const html =
    `<p>Dear ${firstName},</p>` +
    tailoredParagraph +
    `<p>Whether you are exploring your next seasonal flacon or living with a sample vial on warm skin, our private concierges remain at your disposal to curate a wardrobe that feels unmistakably yours.</p>` +
    `<p>Warm regards,<br/>Maison Noir Perfumes</p>`;

  return {
    name: fullName,
    email: String(recipient.email || "").trim(),
    notes: notes || "none",
    subject,
    html,
  };
}

async function postToN8nEmailWebhook(url, payload, timeoutMs = 25000) {
  const bodyStr = JSON.stringify(payload);
  try {
    const { stdout } = await execFileAsync("curl.exe", [
      "-s",
      "--max-time",
      String(Math.ceil(timeoutMs / 1000)),
      "-X",
      "POST",
      url,
      "-H",
      "Content-Type: application/json",
      "--data-raw",
      bodyStr,
    ]);
    if (!stdout || !stdout.trim()) return { ok: true };
    try {
      return JSON.parse(stdout);
    } catch {
      return { raw: stdout };
    }
  } catch {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          ...(process.env.N8N_SECRET ? { "x-api-secret": process.env.N8N_SECRET } : {}),
        },
        body: bodyStr,
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      try {
        return text ? JSON.parse(text) : { ok: true };
      } catch {
        return { raw: text };
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Triggers n8n Workflow 7 ("My workflow 7" - maison-noir-emails)
 * Payload expected by n8n Split Out node (`body.recipients`):
 * {
 *   recipients: [
 *     { name: "Sara", email: "sara@example.com", notes: "Loves warm vanilla & winter scents" }
 *   ]
 * }
 */
export async function sendMaisonNoirEmails({ recipients = [] } = {}) {
  const cleanRecipients = (Array.isArray(recipients) ? recipients : [recipients])
    .map((r) => ({
      name: String(r?.name || "Maison Noir Client").trim(),
      email: String(r?.email || "").trim(),
      notes: String(r?.notes || "none").trim() || "none",
    }))
    .filter((r) => r.email && r.email.includes("@"));

  if (cleanRecipients.length === 0) {
    throw new Error("At least one valid recipient email is required.");
  }

  const previews = cleanRecipients.map(composeEmailPreview);
  const url = process.env.N8N_EMAIL_WEBHOOK_URL || DEFAULT_N8N_EMAIL_WEBHOOK_URL;
  const timeoutMs = Number(process.env.N8N_TIMEOUT_MS) || 25000;

  try {
    const n8nResponse = await postToN8nEmailWebhook(
      url,
      { recipients: cleanRecipients },
      timeoutMs
    );

    const hasError =
      n8nResponse?.code === 404 ||
      n8nResponse?.code === 500 ||
      (typeof n8nResponse?.message === "string" &&
        n8nResponse.message.toLowerCase().includes("not registered"));

    if (!hasError) {
      return {
        status: "dispatched",
        source: "n8n-gmail-workflow-7",
        webhookUrl: url,
        fromEmail: "muhamedgad444@gmail.com",
        count: cleanRecipients.length,
        previews,
        n8n: n8nResponse,
      };
    }
    console.warn("n8n email webhook returned warning:", n8nResponse);
  } catch (err) {
    console.warn("n8n email webhook error, returning local preview:", err.message);
  }

  return {
    status: "queued_preview",
    source: "maison-noir-email-preview",
    webhookUrl: url,
    fromEmail: "muhamedgad444@gmail.com",
    count: cleanRecipients.length,
    previews,
  };
}

/**
 * Helper to automatically send a personalized order email via n8n Workflow 7 when a customer checks out.
 */
export async function sendOrderConfirmationEmail(order = {}) {
  const email = order?.customer?.email || order?.customer_email;
  const name = order?.customer?.name || order?.customer_name || "Valued Client";
  if (!email || !String(email).includes("@")) return null;

  const rawItems = Array.isArray(order.cart)
    ? order.cart
    : Array.isArray(order.items)
      ? order.items
      : [];

  const itemSummary = rawItems
    .map((i) => `${i.name} (${i.size || i.selectedSize || "100ml"} × ${i.quantity || 1})`)
    .join(", ");

  const orderId = order.orderId || order.order_code || "MN-2026";
  const total = order.grandTotal ?? order.grand_total ?? "";
  const city = order?.shipping?.city || order?.shipping_city || "Paris";

  const notes = [
    `Order ${orderId} confirmed`,
    itemSummary ? `Selected fragrances: ${itemSummary}` : null,
    total ? `Total: $${total}` : null,
    city ? `Destination: ${city}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return sendMaisonNoirEmails({
    recipients: [{ name, email, notes }],
  });
}
