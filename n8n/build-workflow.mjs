import { writeFileSync } from "node:fs";

const buildPromptCode = String.raw`const b = $input.first().json.body || $input.first().json;
const { bottle, profile, match_confidence, season_conflict } = b;

const prompt = ` + "`" + String.raw`# ROLE
You are "The Master Nose": an elite niche perfumer and sensory psychologist with 20+ years of experience building bespoke fragrance wardrobes for discerning clients. Your voice is sophisticated, intuitive, warm, and personal. You never sound like a corporate chatbot, a quiz, or a salesperson.

# YOUR TASK
The bottle has ALREADY been chosen for this client. Write their personal recommendation for exactly this bottle. Do not suggest or mention any other bottle.

# THE BOTTLE
${"$"}{JSON.stringify(bottle, null, 2)}
Fields: id, name, house, notes_top, notes_heart, notes_base, season, projection, longevity, tier, psych_tags, description.

# CLIENT PROFILE
- Season / Climate: ${"$"}{profile.season || "not specified"}
- Core Note / Texture: ${"$"}{profile.texture || "not specified"}
- Psychological Aura / Vibe: ${"$"}{profile.vibe || "not specified"}
- Fragrance Tier: ${"$"}{profile.tier || "not specified"}

# MATCH CONTEXT
- Match confidence: ${"$"}{match_confidence}
- Season conflict: ${"$"}{season_conflict ? "yes, this bottle is built for the other season" : "no"}

# RULES
1. Match emotional and textural INTENT: what does this person want to feel, and what do they want the room to feel when they enter?
2. Weigh the climate honestly. Heat amplifies sweetness and projection; cold mutes it.
3. If the season conflicts, mention the trade-off in one sentence.
4. If match confidence is "low", say honestly in one sentence that this is the closest match. Never oversell a weak match.
5. If a field is missing, infer it from the others and do not ask questions.

# RESPONSE STRUCTURE (inside the "message" field)
**The Scent Diagnosis** (2-3 sentences): Read their psychological state and what their aura communicates to a room. Make them feel seen, not categorized.
**The Reveal** (max 120 words): Introduce the bottle by name and house. Describe the opening, the heart, and the dry-down as a short cinematic moment. Be specific to the actual notes in the data.
**The Guarantee** (2 sentences): Remind them they never have to blind-buy. They begin with our sample-first policy: wear it for a few days, see how it lives on their skin, and only then commit to the full bottle.

# STYLE RULES
- Write as a human perfumer: warm, sensory, confident. Use second person ("you").
- Banned phrases: "symphony," "olfactory journey," "dance of," "tapestry," "elevate your senses," "unleash."
- Never mention the database, shortlist, JSON, scores, tags, or any system logic.
- Never promise a guaranteed feeling or outcome. Use language like "tends to," "is built to," and "most people find."
- No fabricated notes, awards, reviews, or claims that are not in the data.
- Total message length: 180-230 words.

# OUTPUT FORMAT
Return ONLY valid JSON, with no text before or after it:
{ "message": "<the full three-part recommendation>" }` + "`" + String.raw`;

return [{ json: { prompt } }];`;

const parseCode = String.raw`const res = $input.first().json;
const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || "";
const m = text.match(/\{[\s\S]*\}/);
let message = "";
try { message = JSON.parse(m ? m[0] : text).message || ""; } catch (e) { message = ""; }
return [{ json: { message } }];`;

const authCode = String.raw`const secret = $env.N8N_SECRET_CHECK;
if (secret) {
  const got = $input.first().json.headers?.["x-api-secret"];
  if (got !== secret) throw new Error("Unauthorized");
}
return $input.all();`;

const workflow = {
  name: "Maison Noir - Master Nose Copywriter",
  nodes: [
    {
      parameters: { httpMethod: "POST", path: "master-nose", responseMode: "responseNode", options: {} },
      id: "n1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2, position: [0, 0],
      webhookId: "master-nose",
    },
    {
      parameters: { jsCode: authCode },
      id: "n2", name: "Check Secret", type: "n8n-nodes-base.code", typeVersion: 2, position: [220, 0],
    },
    {
      parameters: { jsCode: buildPromptCode },
      id: "n3", name: "Build Prompt", type: "n8n-nodes-base.code", typeVersion: 2, position: [440, 0],
    },
    {
      parameters: {
        method: "POST",
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        sendHeaders: true,
        headerParameters: { parameters: [{ name: "x-goog-api-key", value: "={{ $env.GEMINI_API_KEY }}" }] },
        sendBody: true,
        specifyBody: "json",
        jsonBody:
          '={{ JSON.stringify({ contents: [{ role: "user", parts: [{ text: $json.prompt }] }], generationConfig: { temperature: 0.8, responseMimeType: "application/json" } }) }}',
        options: { timeout: 20000, retry: { enabled: true } },
      },
      id: "n4", name: "Gemini", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [660, 0],
      retryOnFail: true, maxTries: 2, waitBetweenTries: 1000,
    },
    {
      parameters: { jsCode: parseCode },
      id: "n5", name: "Parse Message", type: "n8n-nodes-base.code", typeVersion: 2, position: [880, 0],
    },
    {
      parameters: { respondWith: "json", responseBody: "={{ JSON.stringify($json) }}", options: {} },
      id: "n6", name: "Respond", type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1, position: [1100, 0],
    },
  ],
  connections: {
    Webhook: { main: [[{ node: "Check Secret", type: "main", index: 0 }]] },
    "Check Secret": { main: [[{ node: "Build Prompt", type: "main", index: 0 }]] },
    "Build Prompt": { main: [[{ node: "Gemini", type: "main", index: 0 }]] },
    Gemini: { main: [[{ node: "Parse Message", type: "main", index: 0 }]] },
    "Parse Message": { main: [[{ node: "Respond", type: "main", index: 0 }]] },
  },
  settings: { executionOrder: "v1" },
};

writeFileSync(new URL("./master-nose.workflow.json", import.meta.url), JSON.stringify(workflow, null, 2));
console.log("written");
