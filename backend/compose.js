import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BANNED = ["symphony", "olfactory journey", "dance of", "tapestry", "elevate your senses", "unleash"];
const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

function isValid(message, bottle) {
  if (typeof message !== "string" || !message.trim()) return false;
  const m = message.toLowerCase();
  const n = wordCount(message);
  if (n < 35 || n > 350) return false;
  if (BANNED.some((b) => m.includes(b))) return false;
  return true;
}

export function fallbackMessage(bottle, profile, { match_confidence, season_conflict }) {
  const feel = profile.vibe || "quiet magnetism and self-assured poise";
  const texture = profile.texture || "layered depth and refined warmth";
  const climate = profile.season || "your climate";

  const honest =
    match_confidence === "low"
      ? " Because your request blends rare contrasts, this is the closest match in our collection—approach it as an intriguing discovery rather than a rigid rule."
      : season_conflict
        ? ` While this creation was composed for the opposite season, wearing a lighter mist in ${climate} preserves its character without overwhelming the air.`
        : ` In ${climate}, the air naturally amplifies your preference for ${texture.toLowerCase()}, allowing the scent to breathe at its finest pace.`;

  return (
    `**The Scent Diagnosis**\n` +
    `You are drawn to ${feel.toLowerCase()}, which tells me you value presence over noise and intimacy over spectacle. ` +
    `When you walk into a room, you want the atmosphere to shift subtly—leaving people curious about the calm certainty you carry.${honest}\n\n` +
    `**The Reveal**\n` +
    `Allow me to introduce **${bottle.name}** by **${bottle.house}**. ` +
    `From the first mist on warm skin, the opening greets you with ${bottle.notes_top.toLowerCase()}, crisp and arresting like the first breath of evening air. ` +
    `Within twenty minutes, the composition settles into its true core: a plush heart of ${bottle.notes_heart.toLowerCase()} that wraps around your pulse points with tactile richness. ` +
    `Hours later, long after the initial brightness softens, the dry-down anchors itself in ${bottle.notes_base.toLowerCase()}. ` +
    `It is built to endure for ${bottle.longevity.toLowerCase()} with a ${bottle.projection.toLowerCase()} trail, so most people find it lingers effortlessly on silk, wool, and skin well into the night.\n\n` +
    `**The Guarantee**\n` +
    `You never have to blind-buy a flagship flacon. Every consultation begins with our sample-first policy: live with the vial on your own skin for several days, experience how it evolves through your daily rhythm, and only then commit to the full bottle.`
  );
}

async function postToN8n(url, payload, timeoutMs) {
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
    return JSON.parse(stdout);
  } catch (curlErr) {
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
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

export async function composeMessage({ bottle, profile, match_confidence, season_conflict }) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (url) {
    const timeoutMs = Number(process.env.N8N_TIMEOUT_MS) || 25000;
    try {
      const data = await postToN8n(url, { bottle, profile, match_confidence, season_conflict }, timeoutMs);
      const rawMsg = data?.message || data?.output || "";
      if (isValid(rawMsg, bottle)) {
        return { message: rawMsg, source: "n8n-gemini" };
      }
      console.warn("n8n response did not pass validation:", data);
    } catch (e) {
      console.warn("n8n error, serving Master Nose fallback:", e.message);
    }
  }
  return { message: fallbackMessage(bottle, profile, { match_confidence, season_conflict }), source: "master-nose-engine" };
}
