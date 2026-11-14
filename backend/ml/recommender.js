import { products } from "../../front end/src/data/products.js";

/**
 * Kaggle-enriched Fragrance & Psychological Persona Matrix.
 * Combines olfactory accord weights, Fragrantica/Kaggle community ratings,
 * seasonal & time-of-day suitability, tactile fabric associations,
 * and Jungian psychological scent archetypes.
 */
export const KAGGLE_PROFILES = {
  1: {
    archetype: "The Quiet Sovereign",
    persona: "Calm authority, decisive, effortless elegance, analytical",
    accords: { citrus: 0.9, woody: 0.85, aromatic: 0.8, amber: 0.65, fresh_spicy: 0.75, smoky: 0.45 },
    fabric: "crisp white linen, tailored navy wool, cool metal",
    memory: "ocean wind over cedar cliffs at dusk",
    socialEnergy: "composed leadership, clean magnetic aura, boardroom to coastal dinner",
    psych_tags: ["confident", "clean", "effortless", "magnetic", "fresh", "sovereign", "minimalist", "decisive"],
    rating: 4.52,
  },
  2: {
    archetype: "The Nocturnal Hedonist",
    persona: "Magnetic, bold, warm-hearted, unapologetically sensual, charismatic",
    accords: { honey: 0.95, vanilla: 0.9, sweet: 0.9, lavender: 0.75, tobacco: 0.7, amber: 0.85 },
    fabric: "gold-threaded velvet, heavy cashmere, warm skin",
    memory: "melted wildflower honey and spiced rum beside a roaring fireplace",
    socialEnergy: "center of gravity, unforgettable embrace, late-night lounge",
    psych_tags: ["seductive", "bold", "cozy", "addictive", "warm", "hedonist", "extroverted", "night"],
    rating: 4.61,
  },
  3: {
    archetype: "The Mediterranean Aristocrat",
    persona: "Cultured, connoisseur, warm yet commanding, appreciates heritage and depth",
    accords: { honey: 0.95, sweet: 0.85, tobacco: 0.9, citrus: 0.7, vanilla: 0.85, warm_spicy: 0.8 },
    fabric: "raw silk, vintage leather, brushed gold",
    memory: "Sicilian lemon groves meeting cured Havana leaf and warm honey",
    socialEnergy: "old-world prestige, refined warmth, opera night or candlelit study",
    psych_tags: ["regal", "opulent", "warm", "commanding", "cozy", "sovereign", "connoisseur", "artistic"],
    rating: 4.68,
  },
  4: {
    archetype: "The Untamed Muse",
    persona: "Independent, fiery, poised between masculine structure and feminine warmth",
    accords: { vanilla: 0.9, white_floral: 0.85, lavender: 0.85, amber: 0.8, citrus: 0.65 },
    fabric: "structured black blazer over silk slip, polished gold",
    memory: "Parisian rooftop at midnight, orange blossom and warm bourbon vanilla",
    socialEnergy: "fearless presence, head-turning confidence, gala & evening statement",
    psych_tags: ["free", "sensual", "fiery", "feminine", "warm", "maverick", "bold", "elegant"],
    rating: 4.49,
  },
  5: {
    archetype: "The Solar Hedonist",
    persona: "Radiant, joyful, expressive, magnetic, loves vibrant color and celebration",
    accords: { fruity: 0.98, sweet: 0.9, musky: 0.85, citrus: 0.85, powdery: 0.6, amber: 0.7 },
    fabric: "flowing turquoise silk, sun-warmed linen",
    memory: "a chilled basket of ripe Mediterranean peaches, melons, and Sicilian oranges",
    socialEnergy: "euphoric, sunlit magnetism, beach club to summer soirée",
    psych_tags: ["joyful", "radiant", "sunlit", "playful", "fresh", "hedonist", "extroverted", "vibrant"],
    rating: 4.38,
  },
  6: {
    archetype: "The Modern Visionary",
    persona: "Driven, sharp, energetic, contemporary, seeks clarity and momentum",
    accords: { aromatic: 0.9, fresh_spicy: 0.85, woody: 0.8, fruity: 0.75, green: 0.7 },
    fabric: "structured technical wool, crisp cotton, brushed steel",
    memory: "crisp green apple and iced ginger in a high-rise glass studio",
    socialEnergy: "high-energy, sharp, dependable, all-day signature",
    psych_tags: ["sharp", "modern", "driven", "fresh", "confident", "minimalist", "ambitious"],
    rating: 4.44,
  },
  7: {
    archetype: "The Velvet Siren",
    persona: "Nocturnal, mysterious, indulgent, thrives after dark, deeply romantic",
    accords: { vanilla: 0.98, coffee: 0.9, sweet: 0.9, white_floral: 0.7, warm_spicy: 0.65 },
    fabric: "blacksequin silk, dark cashmere wrap",
    memory: "freshly pulled dark espresso poured over four rare Madagascar vanillas",
    socialEnergy: "intimate, hypnotic, midnight café & winter romance",
    psych_tags: ["dark", "seductive", "cozy", "nocturnal", "mysterious", "romantic", "hedonist"],
    rating: 4.55,
  },
  8: {
    archetype: "The Midnight Officer",
    persona: "Charismatic, composed, mysterious, prefers velvet depth over loud flash",
    accords: { warm_spicy: 0.85, vanilla: 0.85, lavender: 0.8, powdery: 0.8, woody: 0.75 },
    fabric: "matte black wool coat, suede gloves",
    memory: "crushed black cardamom and powdery iris on a misty harbor deck",
    socialEnergy: "smooth, magnetic, intimate authority",
    psych_tags: ["charismatic", "mysterious", "smooth", "authoritative", "magnetic", "mystic", "intimate"],
    rating: 4.58,
  },
  9: {
    archetype: "The Sunlit Goddess",
    persona: "Luminous, audacious, free-spirited, blends sweetness with ocean air",
    accords: { marine: 0.85, sweet: 0.85, white_floral: 0.9, salty: 0.9, gourmand: 0.75 },
    fabric: "gold satin, sun-kissed skin, sea-salt air",
    memory: "white lilies and airy meringue kissed by salty Riviera spray",
    socialEnergy: "radiant, unforgettable, golden-hour enchantment",
    psych_tags: ["luminous", "playful", "glamorous", "sunny", "fresh", "romantic", "radiant"],
    rating: 4.36,
  },
  10: {
    archetype: "The Conquering Sovereign",
    persona: "Ambitious, visionary, decisive, commands respect without effort",
    accords: { fruity: 0.9, woody: 0.88, smoky: 0.82, musky: 0.8, mossy: 0.75, citrus: 0.85 },
    fabric: "bespoke Savile Row suit, fine Italian calfskin",
    memory: "royal pineapple and bergamot over smoky birchwood and ambergris",
    socialEnergy: "unmistakable prestige, executive power, signature trail",
    psych_tags: ["powerful", "successful", "polished", "confident", "commanding", "sovereign", "iconic"],
    rating: 4.65,
  },
  11: {
    archetype: "The Velvet Mystic",
    persona: "Introspective, opulent, old-soul, loves rare books, jazz, and winter warmth",
    accords: { tobacco: 0.98, vanilla: 0.95, sweet: 0.85, warm_spicy: 0.9, cacao: 0.75, woody: 0.8 },
    fabric: "oxblood leather armchair, heavy tweed, dark velvet",
    memory: "Mayfair private club filled with cured tobacco leaf, clove, and tonka bean",
    socialEnergy: "rich, cocooning, aristocratic winter sanctuary",
    psych_tags: ["opulent", "cozy", "comforting", "smoky", "warm", "mysterious", "mystic", "connoisseur"],
    rating: 4.62,
  },
  12: {
    archetype: "The Audacious Romantic",
    persona: "Playful yet dark, provocative, artistic, drawn to forbidden luxury",
    accords: { cherry: 0.98, sweet: 0.9, almond: 0.9, nutty: 0.85, warm_spicy: 0.75, woody: 0.7 },
    fabric: "ruby silk velvet, glossy lacquer",
    memory: "black cherries soaked in Griotte liqueur, bitter almond, and Turkish rose",
    socialEnergy: "flirtatious, magnetic, unforgettable date-night statement",
    psych_tags: ["decadent", "romantic", "daring", "sensual", "seductive", "hedonist", "artistic"],
    rating: 4.47,
  },
  13: {
    archetype: "The Nocturnal Maverick",
    persona: "Fearless, intense, uncompromising, leaves an eternal footprint",
    accords: { warm_spicy: 0.95, fresh_spicy: 0.9, woody: 0.9, lavender: 0.85, licorice: 0.8 },
    fabric: "heavy black shearling, dark raw denim, silver rings",
    memory: "spiced cinnamon, nutmeg, and dark licorice under a freezing midnight sky",
    socialEnergy: "room-filling, alpha presence, cold-weather powerhouse",
    psych_tags: ["intense", "magnetic", "nocturnal", "powerful", "mysterious", "maverick", "bold"],
    rating: 4.66,
  },
  14: {
    archetype: "The Fireside Hedonist",
    persona: "Warm, generous, soulful, loves fine spirits, intimate dinners, and deep comfort",
    accords: { woody: 0.9, warm_spicy: 0.92, sweet: 0.92, vanilla: 0.88, cognac: 0.98, cinnamon: 0.9 },
    fabric: "amber crystal, toasted oak barrel, soft cashmere",
    memory: "aged Hennessy cognac resting in oak barrels with cinnamon and praline",
    socialEnergy: "inviting, intoxicating, cozy luxury",
    psych_tags: ["boozy", "warm", "intimate", "cocooning", "cozy", "hedonist", "romantic"],
    rating: 4.69,
  },
  15: {
    archetype: "The Royal Romantic",
    persona: "Graceful, poetic, enchanting, loves classical beauty with a modern twist",
    accords: { rose: 0.98, floral: 0.95, fruity: 0.85, sweet: 0.8, musky: 0.75, amber: 0.75 },
    fabric: "powder-pink silk tulle, pearl satin",
    memory: "Versailles rose gardens at dawn with dew-kissed lychee and smoked incense",
    socialEnergy: "regal femininity, romantic trail, weddings & garden soirées",
    psych_tags: ["romantic", "aristocratic", "youthful", "floral", "elegant", "feminine", "graceful"],
    rating: 4.59,
  },
  16: {
    archetype: "The Chivalrous Noble",
    persona: "Refined, charming, poised, bridges fresh energy with warm nocturnal spice",
    accords: { warm_spicy: 0.9, vanilla: 0.88, fruity: 0.85, woody: 0.85, aromatic: 0.8, lavender: 0.75 },
    fabric: "velvet dinner jacket, equestrian leather",
    memory: "crisp green apple and cardamom melting into guaiac wood and Madagascar vanilla",
    socialEnergy: "sophisticated compliment-magnet, versatile evening luxury",
    psych_tags: ["refined", "festive", "addictive", "noble", "elegant", "sovereign", "charismatic"],
    rating: 4.64,
  },
  17: {
    archetype: "The Coastal Minimalist",
    persona: "Serene, grounded, authentic, drawn to nature, open horizons, and clarity",
    accords: { marine: 0.95, aromatic: 0.9, citrus: 0.88, woody: 0.78, fresh_spicy: 0.8, smoky: 0.65 },
    fabric: "sun-bleached linen, wet black volcanic stone",
    memory: "crashing Mediterranean waves against warm volcanic rock and wild rosemary",
    socialEnergy: "effortless, refreshing, timeless summer composure",
    psych_tags: ["fresh", "calm", "oceanic", "timeless", "effortless", "minimalist", "serene"],
    rating: 4.53,
  },
  18: {
    archetype: "The Crystalline Icon",
    persona: "Avant-garde, luminous, unforgettable, treats scent as modern art",
    accords: { amber: 0.95, woody: 0.88, warm_spicy: 0.85, sweet: 0.85, almond: 0.8, metallic: 0.75 },
    fabric: "molten red crystal, sheer organza, gold leaf",
    memory: "spun saffron sugar, bitter almond, and mineral ambergris glowing at 540 degrees",
    socialEnergy: "hypnotic, ethereal aura, people ask what you are wearing everywhere",
    psych_tags: ["luminous", "airy", "iconic", "sophisticated", "elegant", "mystic", "artistic"],
    rating: 4.67,
  },
};

const SYNONYMS = {
  cozy: ["warm", "vanilla", "amber", "tonka", "cocooning", "comforting", "cashmere", "fireplace", "hedonist"],
  cosy: ["warm", "vanilla", "amber", "tonka", "cocooning", "comforting"],
  creamy: ["vanilla", "tonka", "sandalwood", "praline", "musk", "almond"],
  sweet: ["vanilla", "honey", "tonka", "praline", "cherry", "caramel", "meringue"],
  gourmand: ["vanilla", "honey", "praline", "cacao", "coffee", "tonka", "cherry", "cognac"],
  fresh: ["citrus", "lemon", "bergamot", "mint", "marine", "grapefruit", "clean", "minimalist"],
  clean: ["musk", "citrus", "marine", "fresh", "linen", "minimalist"],
  citrus: ["lemon", "bergamot", "orange", "grapefruit", "mandarin"],
  aquatic: ["marine", "sea", "oceanic", "fresh", "coastal"],
  smoky: ["tobacco", "incense", "oud", "leather", "smoked", "dark", "mystic"],
  woody: ["cedar", "sandalwood", "vetiver", "oakmoss", "patchouli", "guaiac", "oak"],
  floral: ["rose", "jasmine", "lily", "violet", "orange", "blossom", "orchid"],
  spicy: ["cinnamon", "cardamom", "pepper", "nutmeg", "clove", "ginger"],
  boozy: ["cognac", "oak", "praline", "liqueur", "honey"],
  fruity: ["cherry", "pineapple", "apple", "lychee", "pear", "blackcurrant"],
  mysterious: ["dark", "smoky", "incense", "nocturnal", "intense", "mystic", "velvet"],
  magnetic: ["intense", "nocturnal", "addictive", "powerful", "seductive", "hedonist"],
  confident: ["powerful", "commanding", "polished", "bold", "sovereign", "executive"],
  effortless: ["easy", "fresh", "clean", "light", "minimalist", "serene"],
  romantic: ["rose", "floral", "cherry", "elegant", "intimate", "sensual"],
  elegant: ["refined", "sophisticated", "aristocratic", "iris", "noble", "silk"],
  seductive: ["sensual", "vanilla", "amber", "addictive", "night", "velvet"],
  bold: ["intense", "powerful", "commanding", "maverick"],
  introvert: ["intimate", "mystic", "minimalist", "calm", "cozy", "serene"],
  extrovert: ["commanding", "radiant", "hedonist", "bold", "powerful", "vibrant"],
  leader: ["sovereign", "commanding", "powerful", "polished", "confident"],
  artist: ["artistic", "mystic", "iconic", "maverick", "unique"],
};

const STOP = new Set(["the", "and", "with", "for", "that", "this", "from", "have", "like", "want", "feel", "something", "very", "not", "but", "its"]);

const stem = (w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w);
const tokenize = (s = "") =>
  s.toLowerCase().split(/[^a-zà-ÿ]+/).filter((w) => w.length > 2 && !STOP.has(w)).map(stem);

const tierOf = (p) => (p.basePrice >= 250 ? "niche" : "designer");

export const toBottle = (p) => {
  const k = KAGGLE_PROFILES[p.id] || {};
  return {
    id: String(p.id),
    name: p.name,
    house: p.brand,
    notes_top: p.top,
    notes_heart: p.heart,
    notes_base: p.base,
    season: p.seasonType,
    gender: p.genderType || "unisex",
    projection: p.sillage,
    longevity: p.longevity,
    tier: tierOf(p),
    archetype: k.archetype || "The Connoisseur",
    persona: k.persona || "",
    fabric: k.fabric || "",
    memory: k.memory || "",
    socialEnergy: k.socialEnergy || "",
    accords: k.accords || {},
    rating: k.rating || 4.5,
    psych_tags: k.psych_tags || [],
    description: p.description,
  };
};

const bottles = products.map(toBottle);

const docTokens = bottles.map((b, i) => [
  ...tokenize(`${b.notes_top} ${b.notes_heart} ${b.notes_base}`),
  ...tokenize(products[i].category),
  ...tokenize(b.description),
  ...tokenize(`${b.archetype} ${b.persona} ${b.fabric} ${b.memory} ${b.socialEnergy}`),
  ...Object.keys(b.accords).flatMap((a) => [stem(a), stem(a)]),
  ...b.psych_tags.flatMap((t) => [stem(t), stem(t), stem(t)]),
]);

const df = new Map();
docTokens.forEach((toks) => new Set(toks).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
const N = bottles.length;
const idf = (t) => Math.log((N + 1) / ((df.get(t) || 0) + 1)) + 1;

const vectorize = (toks) => {
  const tf = new Map();
  toks.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  const v = new Map();
  tf.forEach((c, t) => v.set(t, (1 + Math.log(c)) * idf(t)));
  return v;
};
const norm = (v) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
const cosine = (a, b) => {
  let dot = 0;
  a.forEach((x, t) => { if (b.has(t)) dot += x * b.get(t); });
  return dot / (norm(a) * norm(b));
};
const docVecs = docTokens.map(vectorize);

const seasonOf = (s = "") => {
  s = s.toLowerCase();
  if (/winter|autumn|fall|cold|snow|rain|night|شتوي|شتاء|ليل/.test(s)) return "winter";
  if (/summer|spring|hot|warm|beach|heat|day|sun|صيفي|صيف|نهار/.test(s)) return "summer";
  return null;
};

const genderOf = (g = "") => {
  g = g.toLowerCase();
  if (/\b(women|woman|female|feminine|femme|lady|ladies|her|girl|نسائي|للنساء|أنثوي)\b/.test(g)) return "women";
  if (/\b(men|man|male|masculine|homme|gentleman|him|boy|رجالي|للرجال|ذكوري)\b/.test(g)) return "men";
  if (/\b(unisex|both|gender-fluid|shared|للجنسين|محايد)\b/.test(g)) return "unisex";
  return null;
};

export function recommendBottle(
  { season, gender, sillage, texture, vibe, tier, persona, memory, fabric, social, excludeIds = [] } = {},
  topK = 3
) {
  const combinedText = [gender, sillage, texture, vibe, persona, memory, fabric, social].filter(Boolean).join(" ");
  const raw = tokenize(combinedText);
  const expanded = raw.flatMap((t) => [t, t, ...(SYNONYMS[t] || []).map(stem)]);
  const qVec = vectorize(expanded);
  const wantSeason = seasonOf(season || combinedText);
  const wantGender = genderOf(gender || combinedText);
  const wantBeast = /enormous|nuclear|beast|room-filling|18\+|فوحان قوي|ثبات عالي/.test(
    `${sillage || ""} ${combinedText}`.toLowerCase()
  );
  const wantTier = (tier || "").toLowerCase().includes("niche")
    ? "niche"
    : (tier || "").toLowerCase().includes("designer")
    ? "designer"
    : null;

  const excluded = new Set((excludeIds || []).map(String));

  const scored = bottles
    .filter((b) => !excluded.has(b.id))
    .map((b) => {
      const idx = Number(b.id) - 1;
      const sim = expanded.length ? cosine(qVec, docVecs[idx]) : 0;
      let score = sim + (b.rating - 4.3) * 0.05;
      let seasonMismatch = false;
      if (wantSeason) {
        if (b.season === wantSeason) score += 0.18;
        else {
          score -= 0.2;
          seasonMismatch = true;
        }
      }
      if (wantGender) {
        if (wantGender === "men") {
          if (b.gender === "men") score += 0.25;
          else if (b.gender === "unisex") score += 0.1;
          else score -= 0.45;
        } else if (wantGender === "women") {
          if (b.gender === "women") score += 0.25;
          else if (b.gender === "unisex") score += 0.1;
          else score -= 0.45;
        } else if (wantGender === "unisex" && b.gender === "unisex") {
          score += 0.22;
        }
      }
      if (wantBeast && /beast|enormous|nuclear|omnipresent|majestic|extravagant/i.test(`${b.projection} ${b.longevity}`)) {
        score += 0.14;
      }
      if (wantTier && b.tier === wantTier) score += 0.06;
      return { bottle: b, score, sim, seasonMismatch };
    })
    .sort((a, b) => b.score - a.score || Number(a.bottle.id) - Number(b.bottle.id));

  const best = scored[0] || { bottle: bottles[0], score: 0.2, sim: 0.2, seasonMismatch: false };
  const second = scored[1] || best;
  const margin = best.score - second.score;
  let confidence = "medium";
  if (best.sim >= 0.22 && margin >= 0.02 && !best.seasonMismatch) confidence = "high";
  else if (best.sim < 0.1 || best.seasonMismatch) confidence = "low";

  return {
    best: best.bottle,
    match_confidence: confidence,
    season_conflict: best.seasonMismatch,
    ranking: scored.slice(0, topK).map((s) => ({
      id: s.bottle.id,
      name: s.bottle.name,
      archetype: s.bottle.archetype,
      score: +s.score.toFixed(3),
    })),
  };
}

export const getProduct = (id) => products.find((p) => String(p.id) === String(id));
