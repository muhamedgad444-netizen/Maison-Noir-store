import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_N8N_EMAIL_WEBHOOK_URL =
  "https://muhamedshalaby.app.n8n.cloud/webhook/maison-noir-emails";

export function composeEmailPreview(recipient = {}) {
  const fullName = String(recipient.name || "Valued Client").trim();
  const firstName = fullName.split(/\s+/)[0] || "Client";
  const notes = String(recipient.notes || "").trim();
  const orderId = recipient.orderId || "MN-2026";

  const subject = `Maison Noir · Order Confirmed (${orderId})`;

  const html =
    `<p>Dear ${firstName},</p>` +
    `<p>Thank you for your order with Maison Noir Haute Parfumerie. Your selection has been reserved in our Paris atelier and is being prepared for dispatch.</p>` +
    (notes ? `<p><strong>Order Summary:</strong><br/>${notes}</p>` : "") +
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

export async function sendMaisonNoirEmails({ recipients = [] } = {}) {
  const cleanRecipients = (Array.isArray(recipients) ? recipients : [recipients])
    .map((r) => ({
      name: String(r?.name || "Maison Noir Client").trim(),
      email: String(r?.email || "").trim(),
      orderId: r?.orderId ? String(r.orderId) : undefined,
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
 * Automatically sends a personalized Order Confirmation email via n8n Workflow 7 when a customer completes checkout.
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
    .map((i) => {
      const qty = i.quantity || 1;
      const size = i.size || i.selectedSize || "100ML";
      const unitPrice =
        i.calculatedPriceNumber ||
        (typeof i.price === "string" ? parseInt(i.price.replace(/[^0-9]/g, ""), 10) : i.price) ||
        165;
      return `${i.name} (${size} × ${qty} — $${unitPrice * qty})`;
    })
    .join(", ");

  const orderId = order.orderId || order.order_code || "MN-2026";
  const total = order.grandTotal ?? order.grand_total ?? "";
  const addressParts = [
    order?.shipping?.address || order?.shipping_address,
    order?.shipping?.city || order?.shipping_city,
    order?.shipping?.postalCode || order?.shipping_postal_code,
    order?.shipping?.country || order?.shipping_country,
  ].filter(Boolean);
  const destination = addressParts.join(", ") || "Paris, France";
  const shippingMethod =
    (order?.shipping?.method || order?.shipping_method) === "white-glove"
      ? "White-Glove VIP Concierge (Next-Day Hand Delivery)"
      : "Air Express Dispatch (3–5 Working Days)";

  const notes = [
    `OFFICIAL ORDER CONFIRMATION — Please confirm that this customer's order is confirmed and include all of the following order details in the email:`,
    `Order Number: ${orderId}`,
    itemSummary ? `Purchased Items: ${itemSummary}` : null,
    total !== "" ? `Total Paid: $${total}` : null,
    `Shipping Destination: ${destination}`,
    `Delivery Method: ${shippingMethod}`,
    order.promoCode ? `Privilege Code Applied: ${order.promoCode}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return sendMaisonNoirEmails({
    recipients: [{ name, email, orderId, notes }],
  });
}
