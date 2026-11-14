import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_SUPABASE_URL = "https://zscddqfbrndvxdylbpzx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzY2RkcWZicm5kdnhkeWxicHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NjkzODUsImV4cCI6MjExMDI0NTM4NX0.ykJYB3MG2OwfGB-9zD_UG-rat4ap2UwKY6yZX1f46hA";

function getConfig() {
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRequest(path, { method = "GET", body = null, prefer = "" } = {}) {
  const cfg = getConfig();
  if (!cfg) return null;

  const fullUrl = `${cfg.url}/rest/v1/${path}`;
  const headers = [
    "-H",
    `apikey: ${cfg.key}`,
    "-H",
    `Authorization: Bearer ${cfg.key}`,
    "-H",
    "Content-Type: application/json",
  ];
  if (prefer) {
    headers.push("-H", `Prefer: ${prefer}`);
  }

  const args = ["-s", "-m", "8", "-X", method, fullUrl, ...headers];
  if (body !== null) {
    args.push("--data-raw", JSON.stringify(body));
  }

  try {
    const { stdout } = await execFileAsync("curl.exe", args);
    if (!stdout || !stdout.trim()) return null;
    return JSON.parse(stdout);
  } catch {
    try {
      const res = await fetch(fullUrl, {
        method,
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          "Content-Type": "application/json",
          ...(prefer ? { Prefer: prefer } : {}),
        },
        ...(body !== null ? { body: JSON.stringify(body) } : {}),
      });
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }
}

export async function saveOrder({
  orderId,
  customer = {},
  shipping = {},
  payment = {},
  promoCode = null,
  grandTotal = 0,
  cart = [],
}) {
  const row = {
    order_code: String(orderId || `MN-2026-${Math.floor(100000 + Math.random() * 900000)}`),
    customer_name: String(customer.name || "Guest"),
    customer_email: String(customer.email || "guest@maison-noir.com"),
    customer_phone: customer.phone ? String(customer.phone) : null,
    shipping_address: shipping.address ? String(shipping.address) : null,
    shipping_city: shipping.city ? String(shipping.city) : null,
    shipping_postal_code: shipping.postalCode ? String(shipping.postalCode) : null,
    shipping_country: shipping.country ? String(shipping.country) : "France",
    shipping_method: shipping.method ? String(shipping.method) : "standard",
    payment_method: payment.method ? String(payment.method) : "card",
    promo_code: promoCode ? String(promoCode) : null,
    grand_total: Number(grandTotal) || 0,
    items: Array.isArray(cart)
      ? cart.map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          size: item.selectedSize || item.sizes?.[0] || "100ml",
          quantity: item.quantity || 1,
          price: item.calculatedPrice || item.price,
        }))
      : [],
  };

  const res = await supabaseRequest("orders", {
    method: "POST",
    body: row,
    prefer: "return=representation",
  });
  return Array.isArray(res) ? res[0] : res;
}

export async function listRecentOrders(limit = 20) {
  const res = await supabaseRequest(`orders?select=*&order=created_at.desc&limit=${Number(limit) || 20}`);
  return Array.isArray(res) ? res : [];
}

export async function loadChatSession(sessionId) {
  if (!sessionId) return null;
  const res = await supabaseRequest(
    `chat_sessions?session_id=eq.${encodeURIComponent(sessionId)}&limit=1`
  );
  if (Array.isArray(res) && res[0]) {
    const r = res[0];
    return {
      quizActive: Boolean(r.quiz_active),
      quizStage: Number(r.quiz_stage) || 0,
      quizCollected: Array.isArray(r.quiz_collected) ? r.quiz_collected : [],
      seenBottleIds: Array.isArray(r.seen_bottle_ids) ? r.seen_bottle_ids : [],
      lastRecommendedIds: Array.isArray(r.last_recommended_ids) ? r.last_recommended_ids : [],
      history: Array.isArray(r.history) ? r.history : [],
      turn: Number(r.turn) || 0,
    };
  }
  return null;
}

export async function saveChatSession(sessionId, session) {
  if (!sessionId || !session) return null;
  return supabaseRequest("chat_sessions?on_conflict=session_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: {
      session_id: String(sessionId),
      quiz_active: Boolean(session.quizActive),
      quiz_stage: Number(session.quizStage) || 0,
      quiz_collected: session.quizCollected || [],
      seen_bottle_ids: session.seenBottleIds || [],
      last_recommended_ids: session.lastRecommendedIds || [],
      history: (session.history || []).slice(-30),
      turn: Number(session.turn) || 0,
      updated_at: new Date().toISOString(),
    },
  });
}

export async function logRecommendationEvent({
  sourceEndpoint = "recommend",
  sessionId = null,
  bottleId,
  bottleName,
  archetype = null,
  matchConfidence = null,
  userQuery = null,
}) {
  if (!bottleId || !bottleName) return null;
  return supabaseRequest("recommendation_events", {
    method: "POST",
    body: {
      source_endpoint: String(sourceEndpoint),
      session_id: sessionId ? String(sessionId) : null,
      bottle_id: String(bottleId),
      bottle_name: String(bottleName),
      archetype: archetype ? String(archetype) : null,
      match_confidence: matchConfidence ? String(matchConfidence) : null,
      user_query: userQuery ? String(userQuery).slice(0, 500) : null,
    },
  });
}
