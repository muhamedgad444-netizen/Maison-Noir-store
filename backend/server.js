import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { recommendBottle, getProduct, KAGGLE_PROFILES } from "./ml/recommender.js";
import { composeMessage } from "./compose.js";
import { askLaylaNoor } from "./chat.js";

// Minimal .env loader (no dependencies)
if (existsSync(new URL("./.env", import.meta.url))) {
  for (const line of readFileSync(new URL("./.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const PORT = process.env.PORT || 5000;
const cors = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const send = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json", ...cors });
  res.end(JSON.stringify(body));
};

http
  .createServer(async (req, res) => {
    if (req.method === "OPTIONS") return send(res, 204, {});

    // 1) Master Nose ML Recommender + Workflow 5
    if (req.method === "POST" && req.url === "/api/recommend") {
      let raw = "";
      for await (const c of req) raw += c;
      try {
        const body = JSON.parse(raw || "{}");
        const profile = {
          season: String(body.season || "winter"),
          gender: String(body.gender || ""),
          sillage: String(body.sillage || ""),
          longevity: String(body.longevity || ""),
          texture: String(body.texture || body.fabric || "velvet & cashmere"),
          vibe: String(body.vibe || body.persona || "warm & magnetic"),
          tier: String(body.tier || "niche"),
          persona: String(body.persona || ""),
          memory: String(body.memory || ""),
          fabric: String(body.fabric || ""),
          social: String(body.social || ""),
        };

        const rec = recommendBottle(profile);
        const { message, source } = await composeMessage({
          bottle: rec.best,
          profile,
          match_confidence: rec.match_confidence,
          season_conflict: rec.season_conflict,
        });

        const p = getProduct(rec.best.id);
        const k = KAGGLE_PROFILES[p.id] || {};
        return send(res, 200, {
          bottle_id: rec.best.id,
          match_confidence: rec.match_confidence,
          archetype: k.archetype || "The Connoisseur",
          persona_summary: k.persona || "",
          kaggle_rating: k.rating || 4.6,
          message,
          message_source: source,
          best: rec.best,
          product: { id: p.id, name: p.name, brand: p.brand, image: p.image, price: p.price },
          alternatives: rec.ranking.slice(1),
        });
      } catch (e) {
        console.error(e);
        return send(res, 500, { error: "The Master Nose is unavailable right now. Please try again." });
      }
    }

    // 2) Layla Noor Chatbot Concierge (Workflow 6 + Psychological Profiler)
    if (req.method === "POST" && req.url === "/api/chat") {
      let raw = "";
      for await (const c of req) raw += c;
      try {
        const body = JSON.parse(raw || "{}");
        const out = await askLaylaNoor({
          chatInput: String(body.chatInput || body.message || ""),
          sessionId: String(body.sessionId || "maison-noir-guest"),
          reset: Boolean(body.reset),
          mlConstraints: body.mlConstraints || {},
        });
        return send(res, 200, out);
      } catch (e) {
        console.error(e);
        return send(res, 500, { error: "Layla Noor is unavailable right now." });
      }
    }

    send(res, 404, { error: "Not found" });
  })
  .listen(PORT, () => console.log(`Master Nose & Layla Noor API on http://localhost:${PORT}`));
