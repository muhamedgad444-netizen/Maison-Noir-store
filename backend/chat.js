import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { recommendBottle, KAGGLE_PROFILES } from "./ml/recommender.js";
import { products as CATALOG_PRODUCTS } from "../front end/src/data/products.js";

const execFileAsync = promisify(execFile);

/**
 * In-memory conversation state per sessionId so Layla Noor remembers history,
 * supports repeating/re-visiting bottles, answers free-form questions about any
 * perfume, and runs the 3-stage Psychological Persona Quiz only when requested.
 */
const sessions = new Map();

function getSession(sessionId) {
  const id = sessionId || "default-session";
  if (!sessions.has(id)) {
    sessions.set(id, {
      quizActive: false,
      quizStage: 0, // 0 = not in quiz, 1 = Q1, 2 = Q2, 3 = Q3
      quizCollected: [],
      seenBottleIds: [],
      lastRecommendedIds: [],
      history: [],
      turn: 0,
    });
  }
  return sessions.get(id);
}

function isArabic(text = "") {
  return /[\u0600-\u06FF]/.test(text);
}

function getProduct(id) {
  return CATALOG_PRODUCTS.find((p) => String(p.id) === String(id)) || CATALOG_PRODUCTS[0];
}

function toCardProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    image: p.image,
    season: p.season,
    archetype: KAGGLE_PROFILES[p.id]?.archetype,
  };
}

/**
 * Check if the user is asking about 1 or more specific perfumes in our 18-bottle catalog
 * by name, brand, or keyword (so they can ask or repeat questions about any bottle freely).
 */
function findMentionedProducts(text = "") {
  const lower = text.toLowerCase();
  const matches = [];

  const aliasMap = [
    { id: "1", keys: ["bleu", "chanel", "بلو", "شانيل"] },
    { id: "2", keys: ["le male elixir", "male elixir", "إليكسير", "اليكسير"] },
    { id: "3", keys: ["naxos", "1861", "ناكسوس"] },
    { id: "4", keys: ["libre", "libre intense", "ليبر"] },
    { id: "5", keys: ["erba pura", "erba", "إيربا", "ايربا"] },
    { id: "6", keys: ["ysl y", "y edp", "y eau de parfum", "واي"] },
    { id: "7", keys: ["black opium", "opium", "بلاك أوبيوم", "بلاك اوبيوم"] },
    { id: "8", keys: ["le male le parfum", "officer", "لو مال"] },
    { id: "9", keys: ["divine", "gaultier divine", "ديفاين"] },
    { id: "10", keys: ["aventus", "creed", "أفينتوس", "افينتوس", "كريد"] },
    { id: "11", keys: ["tobacco vanille", "tobacco", "توباكو فانيلا", "توم فورد توباكو"] },
    { id: "12", keys: ["lost cherry", "cherry", "لوست شيري", "كرز"] },
    { id: "13", keys: ["sauvage", "dior sauvage", "sauvage elixir", "سوفاج", "ديور"] },
    { id: "14", keys: ["angels share", "angel's share", "angels' share", "kilian", "أنجلز شير", "كيليان"] },
    { id: "15", keys: ["delina", "delina exclusif", "ديلينا"] },
    { id: "16", keys: ["layton", "marly layton", "لايتون"] },
    { id: "17", keys: ["acqua di gio", "acqua di giò", "armani", "أكوا دي جيو", "ارماني"] },
    { id: "18", keys: ["baccarat", "540", "kurkdjian", "باكارا"] },
  ];

  for (const entry of aliasMap) {
    if (entry.keys.some((k) => lower.includes(k))) {
      matches.push(getProduct(entry.id));
    }
  }
  return matches;
}

const PSYCH_QUESTIONS = [
  {
    stage: 1,
    en: {
      prompt:
        "Let us calibrate the **Kaggle ML Engine** to your exact identity (**Step 1 of 6 — Gender & Olfactory Expression**).\n\nWhose skin chemistry are we profiling today, and which fragrance direction do you prefer?",
      options: [
        "Masculine (Pour Homme) — bold, structured & magnetic",
        "Feminine (Pour Femme) — radiant, sensual & hypnotic",
        "Unisex Haute Parfumerie — artistic, niche & boundary-free",
        "Open to All — match me purely by my psychological aura",
      ],
    },
    ar: {
      prompt:
        "لنضبط **محرك الذكاء الاصطناعي** على هويتك العطرية (**الخطوة 1 من 6 — الهوية العطرية والجنس**).\n\nهل تبحث عن عطر رجالي، نسائي، أم للجنسين (Unisex)؟",
      options: [
        "رجالي (Pour Homme) — حضور قوي، جريء وجذاب",
        "نسائي (Pour Femme) — أنوثة ساحرة، مشرقة ومغناطيسية",
        "للجنسين (Unisex Niche) — تفرد فني يتجاوز القواعد",
        "مفتوح للجميع — اختر لي حسب شخصيتي النفسية فقط",
      ],
    },
  },
  {
    stage: 2,
    en: {
      prompt:
        " calibrate **Step 2 of 6 — Unspoken Room Presence**.\n\nWhen you walk into a room, what psychological aura do you want people to feel before you say a single word?",
      options: [
        "Quiet Sovereign — calm authority, old-money & untouchable",
        "Nocturnal Hedonist — warm, magnetic, pulls people closer",
        "Velvet Mystic — enigmatic, artistic, smoky & deep",
        "Solar Optimist — radiant, effortless, joyful energy",
      ],
    },
    ar: {
      prompt:
        "**الخطوة 2 من 6 — الانطباع النفسي الأول (الهالة)**.\n\nعندما تدخل إلى مكان ما، ما هو الشعور النفسي الذي ترغب أن يسبقك قبل أن تتحدث؟",
      options: [
        "الهيبة الهادئة — حضور ملكي نظيف وواثق",
        "الجاذبية الليلية — دفء مغناطيسي يقرب الآخرين منك",
        "الغموض المخملي — عمق فني دخاني لا يُنسى",
        "الإشراق الشمسي — طاقة حيوية ومنعشة",
      ],
    },
  },
  {
    stage: 3,
    en: {
      prompt:
        "**Step 3 of 6 — Inner Emotional Anchor**.\n\nPsychologically, how should your fragrance make *you* feel internally when you catch a trace of it on your wrist?",
      options: [
        "Armor & Command — make me feel sharp, decisive & invincible",
        "Intimate Seductive Magnet — create closeness, warmth & desire",
        "Royal Nostalgic Sanctuary — wrap me in opulent, cozy comfort",
        "Sunlit Euphoria & Freedom — elevate my mood like coastal sunlight",
      ],
    },
    ar: {
      prompt:
        "**الخطوة 3 من 6 — الارتباط العاطفي الداخلي**.\n\nنفسياً، ما هو الشعور الداخلي الذي تريد أن يمنحك إياه عطرك طوال اليوم؟",
      options: [
        "القوة والحسم — يمنحني ثقة مطلقة وحضوراً قيادياً",
        "الجاذبية الحميمية — يخلق دفئاً وسحراً لا يقاوم",
        "الملاذ الملكي الدافئ — يغمرني بالراحة والفخامة الكلاسيكية",
        "البهجة والحرية — ينعش روحي كأشعة الشمس على البحر",
      ],
    },
  },
  {
    stage: 4,
    en: {
      prompt:
        "**Step 4 of 6 — Sensory Memory & Chronotype**.\n\nWhich of these scenes and times of day feels most like your natural element?",
      options: [
        "Midnight Fireside Study — aged cognac, wild honey & pipe tobacco (Winter / Night)",
        "Sunrise on Mediterranean Cliffs — crushed lemon, sea salt & rosemary (Summer / Day)",
        "2:00 AM Parisian Gala — dark espresso, roasted tonka & white florals (Winter / Night)",
        "Golden-Hour Palace Garden — velvet damask rose, lychee & incense (Summer / Dusk)",
      ],
    },
    ar: {
      prompt:
        "**الخطوة 4 من 6 — الذاكرة الحسية والزمن المفضل**.\n\nأي من هذه المشاهد والأجواء يشبه عالمك الخاص؟",
      options: [
        "مكتبة خشبية ليلاً برائحة الكونياك والعسل والتبغ (شتوي / ليلي)",
        "شروق الشمس على شاطئ المتوسط — ليمون وملح بحري (صيفي / نهاري)",
        "سهرة باريسية منتصف الليل — قهوة داكنة وفانيلا وزهور (شتوي / ليلي)",
        "حديقة قصر ملكي وقت الغروب — ورد دمشقي وليتشي وبخور (صيفي / مسائي)",
      ],
    },
  },
  {
    stage: 5,
    en: {
      prompt:
        "**Step 5 of 6 — Tactile Fabric Affinity**.\n\nIf your signature fragrance were a luxury fabric resting against your skin, which texture speaks to your soul?",
      options: [
        "Heavy Cashmere & Amber Velvet (Rich, Boozy, Gourmand & Warm)",
        "Crisp White Linen & Chilled Silk (Clean, Citrus, Marine & Fresh)",
        "Bespoke Savile Row Wool & Smoked Leather (Woody, Spicy & Smoky)",
        "Spun Sugar Crystal & Liquid Gold Satin (Saffron, Ambergris & Floral)",
      ],
    },
    ar: {
      prompt:
        "**الخطوة 5 من 6 — الملمس الحسي المتناغم**.\n\nلو كان عطرك قماشاً فاخراً يلامس بشرتك، أي ملمس يعبر عن ذوقك؟",
      options: [
        "كشمير ثقيل ومخمل عنبري دافئ (غني، حلو، وعنبري)",
        "كتان أبيض نقي وحرير بارد (منعش، حمضي، وبحري)",
        "صوف مفصل فاخر وجلد مدخن (خشبي، حار، ومدخن)",
        "ساتان ذهبي وكريستال مضيء (زعفران، عنبر، وزهور)",
      ],
    },
  },
  {
    stage: 6,
    en: {
      prompt:
        "**Step 6 of 6 — Sillage Distance & Social Trail**.\n\nFinally, how far should your scent trail project when you enter a space?",
      options: [
        "Intimate Skin Whisper — discovered only by those invited close",
        "Refined Signature Trail — turns heads effortlessly as I walk past",
        "Nuclear Beast-Mode Projection — fills the entire room for 18+ hours",
        "Beast-Mode + Also compose a Custom Formula for my persona",
      ],
    },
    ar: {
      prompt:
        "**الخطوة 6 من 6 — مدى الفوحان والثبات (Sillage)**.\n\nأخيراً، كيف تفضل قوة انتشار عطرك في المكان؟",
      options: [
        "فوحان حميمي قريب — يكتشفه فقط من يقترب منك",
        "هالة متوازنة وراقية — تترك أثراً أنيقاً عند مرورك",
        "فوحان نووي خارق (Beast Mode) — يملأ المكان ويدوم +18 ساعة",
        "فوحان خارق + صممي لي أيضاً تركيبة عطرية خاصة",
      ],
    },
  },
];

async function callN8nGemini(bestProduct, userContext, match_confidence) {
  const n8nChatUrl = process.env.N8N_CHAT_WEBHOOK_URL;
  const n8nMainUrl = process.env.N8N_WEBHOOK_URL;

  if (n8nChatUrl) {
    try {
      const { stdout } = await execFileAsync("curl.exe", [
        "-s",
        "-m",
        "8",
        "-X",
        "POST",
        n8nChatUrl,
        "-H",
        "Content-Type: application/json",
        "-d",
        JSON.stringify({
          action: "sendMessage",
          chatInput: userContext,
          sessionId: "layla-cloud",
        }),
      ]);
      const data = JSON.parse(stdout);
      const reply = data?.output || data?.reply || data?.text || (!data?.code ? data?.message : null);
      if (
        reply &&
        !String(reply).includes("Error in workflow") &&
        !String(reply).includes("is not registered")
      ) {
        return { text: String(reply), source: "n8n-workflow-6" };
      }
    } catch {
      // Fall through to active Workflow 5
    }
  }

  if (n8nMainUrl && bestProduct) {
    try {
      const { stdout } = await execFileAsync("curl.exe", [
        "-s",
        "-m",
        "15",
        "-X",
        "POST",
        n8nMainUrl,
        "-H",
        "Content-Type: application/json",
        "-d",
        JSON.stringify({
          bottle: bestProduct,
          profile: {
            season: bestProduct.season,
            texture: bestProduct.texture || "velvet & cashmere",
            vibe: userContext,
            tier: bestProduct.tier || "niche",
          },
          match_confidence,
          season_conflict: false,
        }),
      ]);
      const data = JSON.parse(stdout);
      if (data?.message && !data?.code) {
        return { text: String(data.message), source: "n8n-cloud-gemini" };
      }
    } catch {
      // Fall through to local synthesis
    }
  }
  return null;
}

function buildMlState(p, confidence = "HIGH") {
  if (!p) return null;
  const k = KAGGLE_PROFILES[p.id] || {};
  const topAccords = Object.entries(k.accords || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, val]) => ({
      name: name.replace("_", " "),
      pct: Math.round(val * 100),
    }));
  return {
    archetype: k.archetype || "The Connoisseur",
    kaggleRating: k.rating || 4.6,
    confidence: String(confidence || "HIGH").toUpperCase(),
    season: p.seasonType || "winter",
    gender: p.genderType || "unisex",
    topBottle: { id: p.id, name: p.name, brand: p.brand, price: p.price },
    topAccords,
  };
}

export async function askLaylaNoor({
  chatInput = "",
  sessionId = "maison-noir-guest",
  reset = false,
  mlConstraints = {},
}) {
  if (reset) sessions.delete(sessionId);
  const session = getSession(sessionId);
  const ar = isArabic(chatInput);
  const cleanInput = chatInput.trim();
  const lower = cleanInput.toLowerCase();

  session.turn += 1;
  session.history.push(cleanInput);

  // 1. Check if user explicitly wants to start/restart the 6-step Psychological & Gender Persona Quiz
  const wantsQuizStart =
    /start my scent persona quiz|restart psychological persona quiz|persona quiz|test my persona|start quiz|ابدأ اختبار|اختبار الشخصية/.test(
      lower
    );

  if (wantsQuizStart) {
    session.quizActive = true;
    session.quizStage = 1;
    session.quizCollected = [];
    const q = PSYCH_QUESTIONS[0][ar ? "ar" : "en"];
    return {
      reply: q.prompt,
      source: "psychological-profiler-step-1-of-6",
      options: q.options,
    };
  }

  // If user directly clicked one of the Step 1 Gender options from the welcome screen, enter the 6-step quiz at Stage 1!
  if (
    !session.quizActive &&
    /^(masculine \(pour homme\)|feminine \(pour femme\)|unisex haute parfumerie|open to all|رجالي \(pour homme\)|نسائي \(pour femme\)|للجنسين \(unisex)/i.test(
      cleanInput
    )
  ) {
    session.quizActive = true;
    session.quizStage = 1;
    session.quizCollected = [];
  }

  // 2. Check if user wants to REPEAT or see previous recommendations again
  const wantsRepeat =
    /\b(repeat|again|previous|last one|before|show me again|what was|أعد|كرر|السابق|نفس العطر|مرة أخرى)\b/.test(
      lower
    );

  if (wantsRepeat && session.lastRecommendedIds.length > 0) {
    session.quizActive = false;
    const prevProducts = session.lastRecommendedIds.map((id) => getProduct(id));
    const p1 = prevProducts[0];
    const k1 = KAGGLE_PROFILES[p1.id] || {};
    const reply = ar
      ? `بكل سرور! إليك تذكير بآخر عطر رشحته لك:\n\n` +
        `✦ **${p1.name}** من دار **${p1.brand}** (${p1.price})\n` +
        `• **النمط النفسي:** ${k1.archetype} — *${k1.persona}*\n` +
        `• **الافتتاحية:** ${p1.top}\n` +
        `• **القلب:** ${p1.heart}\n` +
        `• **القاعدة:** ${p1.base}\n` +
        `• **الأداء:** ثبات ${p1.longevity} وفوحان ${p1.sillage}.`
      : `Of course — here is a complete revisit of your previous match:\n\n` +
        `✦ **${p1.name}** by **${p1.brand}** (${p1.price} · Kaggle Score: ${k1.rating}/5)\n` +
        `• **Psychological Archetype:** **${k1.archetype}** (*${k1.persona}*)\n` +
        `• **Top Notes:** ${p1.top}\n` +
        `• **Heart Notes:** ${p1.heart}\n` +
        `• **Base Notes:** ${p1.base}\n` +
        `• **Performance:** ${p1.longevity} longevity · ${p1.sillage} sillage.\n\n` +
        `Feel free to ask me anything specific about **${p1.name}**, compare it with another bottle, or ask for a new direction!`;

    return {
      reply,
      source: "layla-noor-memory-recall",
      archetype: k1.archetype,
      mlState: buildMlState(p1, "HIGH"),
      products: prevProducts.map(toCardProduct),
      options: [
        `How should I layer ${p1.name}?`,
        "Show me a different bottle with similar vibes",
        "Design a custom perfume formula for me",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  // 3. Check if user mentioned 1 or more specific perfumes by name/brand (gives total freedom to ask or repeat about any bottle!)
  const mentioned = findMentionedProducts(cleanInput);
  if (mentioned.length >= 2) {
    session.quizActive = false;
    const [a, b] = mentioned;
    const ka = KAGGLE_PROFILES[a.id] || {};
    const kb = KAGGLE_PROFILES[b.id] || {};
    session.lastRecommendedIds = [String(a.id), String(b.id)];

    const reply =
      `Here is a head-to-head comparison between **${a.name}** and **${b.name}**:\n\n` +
      `1. **${a.name}** (${a.brand} · ${a.price} · ${a.season})\n` +
      `   • **Archetype:** *${ka.archetype}* (${ka.persona})\n` +
      `   • **Key Notes:** ${a.top} → ${a.heart} → ${a.base}\n` +
      `   • **Performance:** ${a.longevity} · ${a.sillage} · Kaggle: **${ka.rating}/5**\n\n` +
      `2. **${b.name}** (${b.brand} · ${b.price} · ${b.season})\n` +
      `   • **Archetype:** *${kb.archetype}* (${kb.persona})\n` +
      `   • **Key Notes:** ${b.top} → ${b.heart} → ${b.base}\n` +
      `   • **Performance:** ${b.longevity} · ${b.sillage} · Kaggle: **${kb.rating}/5**\n\n` +
      `**Verdict:** Choose **${a.name}** if you want *${ka.fabric.toLowerCase()}* energy, or **${b.name}** if you prefer *${kb.fabric.toLowerCase()}*.`;

    return {
      reply,
      source: "kaggle-ml-comparator",
      archetype: `${ka.archetype} vs ${kb.archetype}`,
      mlState: buildMlState(a, "HIGH"),
      products: [toCardProduct(a), toCardProduct(b)],
      options: [
        `Tell me more about ${a.name}`,
        `Tell me more about ${b.name}`,
        "Design a custom blend combining both!",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  if (mentioned.length === 1) {
    session.quizActive = false;
    const p = mentioned[0];
    const k = KAGGLE_PROFILES[p.id] || {};
    session.lastRecommendedIds = [String(p.id)];

    const reply = ar
      ? `✦ **${p.name}** من دار **${p.brand}** (${p.price} · ${p.season})\n\n` +
        `• **النمط النفسي:** **${k.archetype}** — *${k.persona}*\n` +
        `• **الإحساس الملبسي:** ${k.fabric}\n` +
        `• **الهرم العطري:**\n` +
        `  - الافتتاحية: ${p.top}\n` +
        `  - القلب: ${p.heart}\n` +
        `  - القاعدة: ${p.base}\n` +
        `• **الثبات والفوحان:** ${p.longevity} | ${p.sillage} (تقييم مجتمع العطور: ${k.rating}/5)`
      : `✦ **${p.name}** by **${p.brand}** (${p.price} · ${p.season})\n\n` +
        `• **Psychological Archetype:** **${k.archetype}** — *${k.persona}*\n` +
        `• **Tactile Texture:** ${k.fabric}\n` +
        `• **Sensory Sanctuary:** ${k.memory}\n` +
        `• **Olfactory Pyramid:**\n` +
        `  - **Top:** ${p.top}\n` +
        `  - **Heart:** ${p.heart}\n` +
        `  - **Base:** ${p.base}\n` +
        `• **Performance:** ${p.longevity} longevity · ${p.sillage} sillage · Kaggle Score: **${k.rating}/5**`;

    return {
      reply,
      source: "kaggle-ml-encyclopedia",
      archetype: k.archetype,
      mlState: buildMlState(p, "HIGH"),
      products: [toCardProduct(p)],
      options: [
        `Show me perfumes similar to ${p.name}`,
        `How should I layer ${p.name}?`,
        "Design a custom perfume formula for me",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  // 4. Check if user is asking about catalog-wide superlatives (price, strongest/beast mode, highest rated, list all)
  if (/\b(cheapest|most affordable|lowest price|budget|أرخص|الأقل سعرا)\b/.test(lower)) {
    session.quizActive = false;
    const sorted = [...CATALOG_PRODUCTS].sort((a, b) => a.basePrice - b.basePrice).slice(0, 2);
    session.lastRecommendedIds = sorted.map((p) => String(p.id));
    return {
      reply:
        `Our most accessible luxury creations in the Maison Noir collection are:\n\n` +
        `1. **${sorted[0].name}** by **${sorted[0].brand}** (**${sorted[0].price}** for ${sorted[0].sizes[0]}) — *${sorted[0].tagline}*\n` +
        `2. **${sorted[1].name}** by **${sorted[1].brand}** (**${sorted[1].price}** for ${sorted[1].sizes[0]}) — *${sorted[1].tagline}*\n\n` +
        `Both are crafted at high Extrait/Parfum concentration with 10–14 hours of longevity.`,
      source: "kaggle-ml-catalog-query",
      mlState: buildMlState(sorted[0], "HIGH"),
      products: sorted.map(toCardProduct),
      options: [
        "What is your strongest beast-mode perfume?",
        "What is your highest-rated perfume on Kaggle?",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  if (/\b(most expensive|luxury|priciest|highest price|أغلى|الأغلى)\b/.test(lower)) {
    session.quizActive = false;
    const sorted = [...CATALOG_PRODUCTS].sort((a, b) => b.basePrice - a.basePrice).slice(0, 2);
    session.lastRecommendedIds = sorted.map((p) => String(p.id));
    return {
      reply:
        `The crown jewels of our Haute Parfumerie vault are:\n\n` +
        `1. **${sorted[0].name}** by **${sorted[0].brand}** (**${sorted[0].price}**) — *${KAGGLE_PROFILES[sorted[0].id]?.archetype}*\n` +
        `2. **${sorted[1].name}** by **${sorted[1].brand}** (**${sorted[1].price}**) — *${KAGGLE_PROFILES[sorted[1].id]?.archetype}*`,
      source: "kaggle-ml-catalog-query",
      mlState: buildMlState(sorted[0], "HIGH"),
      products: sorted.map(toCardProduct),
      options: [
        "What is your strongest beast-mode perfume?",
        "Design a custom perfume formula for me",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  if (/\b(strongest|beast mode|longest lasting|nuclear|most projection|أقوى|ثبات|فوحان)\b/.test(lower) && !/layer|apply/.test(lower)) {
    session.quizActive = false;
    const beasts = [getProduct("13"), getProduct("2"), getProduct("18")];
    session.lastRecommendedIds = beasts.map((p) => String(p.id));
    return {
      reply:
        `If you want **unapologetic, room-filling projection (16–18+ hours)**, these three hold the highest sillage & longevity scores in our Kaggle dataset:\n\n` +
        `1. **SAUVAGE ELIXIR** (Dior · $220) — *18+ Hours Eternal* · Cinnamon, Lavender & Licorice wood.\n` +
        `2. **LE MALE ELIXIR** (Jean Paul Gaultier · $160) — *14–16 Hours Nuclear* · Roasted Tonka, Honey & Tobacco.\n` +
        `3. **BACCARAT ROUGE 540** (MFK · $325) — *16+ Hours Iconic Trail* · Saffron, Jasmine & Ambergris.`,
      source: "kaggle-ml-performance-rank",
      mlState: buildMlState(beasts[0], "HIGH"),
      products: beasts.slice(0, 2).map(toCardProduct),
      options: [
        "Compare Sauvage Elixir and Le Male Elixir",
        "Tell me about Baccarat Rouge 540",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  // 5. Check if user wants a custom perfume formula
  const wantsCustom = /custom|formula|blend|scratch|تركيب|توليف|تصميم|خاص|صممي/.test(lower);
  if (wantsCustom) {
    session.quizActive = false;
    const querySeed =
      session.quizCollected.length > 0
        ? session.quizCollected.join(" ") + " " + cleanInput
        : cleanInput;
    const rec = recommendBottle(
      {
        texture: querySeed,
        vibe: querySeed,
        excludeIds: [],
      },
      2
    );
    const p1 = getProduct(rec.best.id);
    const k1 = KAGGLE_PROFILES[p1.id] || {};
    session.lastRecommendedIds = [String(p1.id)];

    const reply = ar
      ? `**تحليل شخصيتك العطرية:** أنت تنتمي إلى نمط **${k1.archetype || "The Connoisseur"}** (${k1.persona}).\n\n` +
        `لقد صممت لك تركيبة عطرية حصرية باسم **"L'Âme Secrète"** بتركيز Extrait de Parfum (30%):\n` +
        `• **الافتتاحية (22%):** ${p1.top}\n` +
        `• **القلب العطري (38%):** ${p1.heart}\n` +
        `• **القاعدة العميقة (40%):** ${p1.base}\n` +
        `• **التناغم الملبسي:** يتناغم مع ${k1.fabric}.\n\n` +
        `ومن مجموعتنا الجاهزة، فإن أقرب توأم لروحك هو **${p1.name}** من **${p1.brand}** (${p1.price}).`
      : `**Your Psychological Scent Archetype:** **${k1.archetype || "The Connoisseur"}** — *${k1.persona}*.\n\n` +
        `I have composed a bespoke private formula for your skin chemistry titled **"L'Âme Secrète"** (Extrait de Parfum, 30% oil concentration):\n` +
        `• **Top Accord (22%):** ${p1.top}\n` +
        `• **Heart Accord (38%):** ${p1.heart}\n` +
        `• **Base Foundation (40%):** ${p1.base}\n` +
        `• **Tactile Affinity:** Built to feel like *${k1.fabric}*.\n\n` +
        `*Maceration & IFRA Note:* Allow this blend to macerate for 21 days in dark glass, and always patch-test on skin per IFRA standards.\n\n` +
        `From our flagship Maison Noir vault, your exact ready-to-wear twin is **${p1.name}** by **${p1.brand}** (${p1.price}).`;

    return {
      reply,
      source: "layla-noor-bespoke-lab",
      archetype: k1.archetype,
      mlState: buildMlState(p1, "HIGH"),
      products: [toCardProduct(p1)],
      options: [
        "Show me a contrasting alter-ego bottle",
        "How should I layer this for maximum trail?",
        "Repeat my previous recommendation",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  // 6. If user asks about layering / application tips
  if (/layer|apply|last|storage|تطبيق|رش|طبقات/.test(lower)) {
    const lastId = session.lastRecommendedIds[0] || session.seenBottleIds[session.seenBottleIds.length - 1] || "14";
    const p = getProduct(lastId);
    const reply = ar
      ? `لتحقيق أقصى ثبات وفوحان مع **${p.name}**:\n` +
        `1. **قاعدة الترطيب:** ضع طبقة خفيفة من مرطب غير معطر على نقاط النبض قبل الرش.\n` +
        `2. **تقنية الطبقات (Layering):** لأن قاعدته تحتوي على (${p.base})، يمكنك دمجه مع رشة واحدة من عطر خشبي أو حمضي نقي.\n` +
        `3. **لا تفرك المعصمين:** الفرك يكسر جزيئات الافتتاحية (${p.top}).`
      : `To unlock the full 14+ hour architecture of **${p.name}**:\n` +
        `1. **Pulse Point Priming:** Apply an unscented balm to your collarbones, inner elbows, and back of the neck before misting.\n` +
        `2. **Bespoke Layering:** Because its base rests on *${p.base.toLowerCase()}*, you can layer one spray over a clean cedar or ambroxan primer to amplify its sillage.\n` +
        `3. **Never Rub Wrists:** Let the opening notes of *${p.top.toLowerCase()}* evaporate naturally on skin so the top pyramid stays intact.`;

    return {
      reply,
      source: "layla-noor-atelier",
      products: [toCardProduct(p)],
      options: [
        "Show me another bottle for my persona",
        "Design a custom perfume formula",
        "Start My Scent Persona Quiz",
      ],
    };
  }

  // 7. If the user is currently inside the 6-step Psychological & Gender Quiz AND didn't ask a separate free-form question
  const isGreetingOrStart =
    /^(hi|hello|hey|start|help|quiz|test|مرحبا|أهلا|اهلا|سلام|ابدأ)$/i.test(cleanInput);
  if (isGreetingOrStart && !session.quizActive) {
    session.quizActive = true;
    session.quizStage = 1;
    session.quizCollected = [];
    const q = PSYCH_QUESTIONS[0][ar ? "ar" : "en"];
    return {
      reply: q.prompt,
      source: "psychological-profiler-step-1",
      options: q.options,
    };
  }

  const isQuizOptionText =
    /masculine|feminine|unisex|open to all|sovereign|hedonist|mystic|optimist|armor|intimate|royal|sunlit|fireside|sunrise|parisian|palace|cashmere|linen|savile|spun sugar|whisper|signature trail|nuclear|رجالي|نسائي|للجنسين|الهيبة|الجاذبية|الغموض|الإشراق|القوة|الملاذ|البهجة|مكتبة|شروق|سهرة|حديقة|كشمير|كتان|صوف|ساتان|فوحان/.test(
      lower
    );

  const looksLikeFreeFormQuestion =
    /\?|what|which|how|show|give|recommend|suggest|want|need|like|love|hate|vanilla|oud|citrus|rose|honey|coffee|cherry|fresh|sweet|dark|woody|spicy|أريد|ابغى|عايز|اقترح|رشح|ما هو|كم سعر/.test(
      lower
    ) && !isQuizOptionText;

  if (session.quizActive && !looksLikeFreeFormQuestion) {
    session.quizCollected.push(cleanInput);
    const partialQuery = session.quizCollected.join(" | ");
    const partialRec = recommendBottle({
      season: partialQuery,
      gender: partialQuery,
      texture: partialQuery,
      vibe: partialQuery,
      persona: partialQuery,
    });
    const partialPrimary = getProduct(partialRec.best.id);

    if (session.quizStage < 6) {
      session.quizStage += 1;
      const qObj = PSYCH_QUESTIONS.find((q) => q.stage === session.quizStage);
      if (qObj) {
        const langQ = qObj[ar ? "ar" : "en"];
        return {
          reply: langQ.prompt,
          source: `psychological-profiler-step-${session.quizStage}-of-6`,
          archetype: KAGGLE_PROFILES[partialPrimary.id]?.archetype,
          mlState: buildMlState(partialPrimary, "CALIBRATING"),
          options: langQ.options,
        };
      }
    } else {
      // Quiz stage 6 finished! Turn off quizActive and score all 6 collected answers
      session.quizActive = false;
    }
  } else {
    // User asked a direct free-form question -> exit quiz mode so they have 100% freedom
    session.quizActive = false;
  }

  // 8. Free-form Recommendation OR Completed 6-Stage Quiz Reveal -> Run Kaggle ML + n8n Cloud Gemini
  const wantsAnother = /another|different|something else|alter-ego|next|آخر|مختلف|غيره/.test(lower);
  const queryText =
    session.quizCollected.length > 0 && session.quizStage === 6 && !looksLikeFreeFormQuestion
      ? session.quizCollected.join(" | ")
      : wantsAnother && session.history.length > 1
      ? session.history.slice(-3).join(" | ")
      : cleanInput;

  // Reset quiz stage after using it
  if (session.quizStage === 6) {
    session.quizStage = 0;
    session.quizCollected = [];
  }

  // Only exclude previously seen bottles if the user explicitly asks for "another / different" bottle!
  // That way, if they repeat the same description, they get the most accurate match (or can ask for another).
  const excludeList = wantsAnother
    ? session.seenBottleIds.length >= 14
      ? []
      : session.seenBottleIds
    : [];

  const constraintText = [
    mlConstraints.season && mlConstraints.season !== "auto" ? mlConstraints.season : "",
    mlConstraints.gender && mlConstraints.gender !== "all" ? mlConstraints.gender : "",
    mlConstraints.sillage && mlConstraints.sillage !== "all" ? mlConstraints.sillage : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rec = recommendBottle(
    {
      season: mlConstraints.season && mlConstraints.season !== "auto" ? mlConstraints.season : queryText,
      gender: mlConstraints.gender && mlConstraints.gender !== "all" ? mlConstraints.gender : queryText,
      sillage: mlConstraints.sillage && mlConstraints.sillage !== "all" ? mlConstraints.sillage : "",
      texture: `${queryText} ${constraintText}`,
      vibe: `${queryText} ${constraintText}`,
      persona: `${queryText} ${constraintText}`,
      excludeIds: excludeList,
    },
    3
  );

  const primary = getProduct(rec.best.id);
  const alt1 = getProduct(rec.ranking[1]?.id || "3");
  const kPrimary = KAGGLE_PROFILES[primary.id] || {};

  if (!session.seenBottleIds.includes(String(primary.id))) {
    session.seenBottleIds.push(String(primary.id));
  }
  session.lastRecommendedIds = [String(primary.id), String(alt1.id)];

  // Call live n8n Cloud Gemini for bespoke narrative
  const n8nResult = await callN8nGemini(rec.best, queryText, rec.match_confidence);

  let replyText = "";
  let sourceLabel = "kaggle-ml + n8n-gemini";

  if (n8nResult && !ar) {
    sourceLabel = n8nResult.source;
    replyText =
      `✦ **Psychological Archetype Matched:** **${kPrimary.archetype}** (${String(rec.match_confidence).toUpperCase()} ML Confidence)\n` +
      `*Persona Traits:* ${kPrimary.persona}\n` +
      `*Sensory Memory:* ${kPrimary.memory}\n\n` +
      `${n8nResult.text}\n\n` +
      `**Second Match:** **${alt1.name}** by ${alt1.brand} (${alt1.price}) — *${KAGGLE_PROFILES[alt1.id]?.archetype || "The Connoisseur"}*.`;
  } else if (ar) {
    sourceLabel = "kaggle-ml-persona-ar";
    replyText =
      `✦ **شخصيتك العطرية النفسية:** **${kPrimary.archetype}**\n` +
      `• **تحليل الهالة:** ${kPrimary.persona}\n` +
      `• **الملمس المتناغم:** ${kPrimary.fabric}\n\n` +
      `**العطر المختار لك بدقة:** **${primary.name}** من دار **${primary.brand}** (${primary.price})\n` +
      `يفتتح بنفحات ${primary.top}، ثم يكشف عن قلب غني من ${primary.heart}، ليستقر على قاعدة ساحرة من ${primary.base}. يتميز بثبات (${primary.longevity}) وفوحان (${primary.sillage}).\n\n` +
      `**البديل الثاني:** **${alt1.name}** (${alt1.brand} — ${alt1.price}).`;
  } else {
    replyText =
      `✦ **Psychological Archetype Matched:** **${kPrimary.archetype}** (${String(rec.match_confidence).toUpperCase()} ML Confidence)\n` +
      `*Persona Traits:* ${kPrimary.persona}\n` +
      `*Tactile Texture:* ${kPrimary.fabric}\n\n` +
      `**Your Primary Flagship Match:** **${primary.name}** by **${primary.brand}** (${primary.price} · Kaggle Score: ${kPrimary.rating}/5)\n` +
      `Opening with ${primary.top.toLowerCase()}, it transitions into a heart of ${primary.heart.toLowerCase()} before anchoring in ${primary.base.toLowerCase()}. Built for ${primary.longevity.toLowerCase()} longevity with a ${primary.sillage.toLowerCase()} trail.\n\n` +
      `**Your Second Match:** **${alt1.name}** by ${alt1.brand} (${alt1.price}).`;
  }

  return {
    reply: replyText,
    source: sourceLabel,
    archetype: kPrimary.archetype,
    mlState: buildMlState(primary, rec.match_confidence),
    products: [primary, alt1].filter(Boolean).map(toCardProduct),
    options: ar
      ? [
          "أعطني عطراً آخر مختلفاً",
          `أخبرني المزيد عن ${primary.name}`,
          "صممي لي تركيبة عطرية خاصة (Custom Formula)",
          "ابدأ اختبار الشخصية من جديد",
        ]
      : [
          "Show me another bottle for my persona",
          `Compare ${primary.name} and ${alt1.name}`,
          "Design a custom perfume formula for me",
          "Start My Scent Persona Quiz",
        ],
  };
}
