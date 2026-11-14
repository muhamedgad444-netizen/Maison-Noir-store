import { recommendBottle, getProduct, KAGGLE_PROFILES } from "../backend/ml/recommender.js";
import { composeMessage } from "../backend/compose.js";
import { logRecommendationEvent } from "../backend/supabase.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
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

    await logRecommendationEvent({
      sourceEndpoint: "recommend",
      bottleId: rec.best.id,
      bottleName: p.name,
      archetype: k.archetype || "The Connoisseur",
      matchConfidence: rec.match_confidence,
      userQuery: `${profile.season} | ${profile.texture} | ${profile.vibe}`,
    }).catch(() => {});

    return res.status(200).json({
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
    return res.status(500).json({ error: "The Master Nose is unavailable right now." });
  }
}
