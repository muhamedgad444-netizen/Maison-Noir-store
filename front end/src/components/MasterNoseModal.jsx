import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [
  {
    label: "The Fireside Hedonist (Winter · Cognac & Vanilla)",
    season: "Winter",
    texture: "Creamy vanilla, warm honey & aged cognac",
    vibe: "Cozy, intimate, magnetic",
    tier: "Niche",
    persona: "Warm, generous, loves fine spirits and candlelit evenings",
    memory: "Aged oak barrels, cinnamon bark, and praline by a fireplace",
    fabric: "Soft cashmere & amber velvet",
  },
  {
    label: "The Quiet Sovereign (Summer · Citrus & Cedar)",
    season: "Summer",
    texture: "Crisp lemon zest, chilled mint & sandalwood",
    vibe: "Confident, clean, effortless authority",
    tier: "Designer",
    persona: "Calm leadership, analytical, composed, timeless",
    memory: "Ocean wind over cedar cliffs at dusk",
    fabric: "Crisp white linen & tailored navy wool",
  },
  {
    label: "The Velvet Mystic (Autumn · Tobacco & Spice)",
    season: "Autumn",
    texture: "Cured tobacco leaf, clove, tonka bean & cacao",
    vibe: "Mysterious, nocturnal, opulent",
    tier: "Niche",
    persona: "Introspective, old-soul connoisseur, loves rare books & jazz",
    memory: "Mayfair private library with leather armchairs and sweet spice",
    fabric: "Oxblood leather & heavy tweed",
  },
  {
    label: "The Audacious Romantic (Winter · Black Cherry & Rose)",
    season: "Winter",
    texture: "Black cherry liqueur, bitter almond & Turkish rose",
    vibe: "Seductive, daring, artistic",
    tier: "Niche",
    persona: "Playful yet dark, provocative, drawn to forbidden luxury",
    memory: "Velvet midnight lounge with cherry liqueur and roasted tonka",
    fabric: "Ruby silk velvet & glossy lacquer",
  },
];

const MasterNoseModal = ({ onClose, onSelectProduct, onAddToCart, allProducts }) => {
  const [season, setSeason] = useState("Winter");
  const [tier, setTier] = useState("Niche");
  const [texture, setTexture] = useState("Creamy vanilla, warm honey & aged cognac");
  const [vibe, setVibe] = useState("Cozy, intimate, magnetic");
  const [persona, setPersona] = useState("The Nocturnal Hedonist — warm, charismatic, pulls people closer");
  const [memory, setMemory] = useState("A private wood-paneled study with aged cognac, honey & pipe tobacco");
  const [fabric, setFabric] = useState("Heavy cashmere & warm velvet");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleConsult = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiBase =
        import.meta.env.VITE_API_URL ||
        (typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "");
      const res = await fetch(`${apiBase}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season, texture, vibe, tier, persona, memory, fabric }),
      });
      if (!res.ok) throw new Error("Failed to reach Master Nose API");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Could not reach backend on http://localhost:5000. Make sure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (p) => {
    setSeason(p.season);
    setTexture(p.texture);
    setVibe(p.vibe);
    setTier(p.tier);
    setPersona(p.persona);
    setMemory(p.memory);
    setFabric(p.fabric);
    setResult(null);
  };

  const matchedFullProduct = result
    ? allProducts?.find((p) => String(p.id) === String(result.bottle_id))
    : null;

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 65,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 980,
          maxHeight: "92vh",
          background: "#faf9f6",
          border: "1px solid rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 35px 90px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.6rem 2.5rem",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#111",
            color: "#fff",
          }}
        >
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4 }}>
              Kaggle Olfactory Matrix + Psychological Persona + n8n Gemini
            </p>
            <h2 className="serif italic" style={{ fontSize: "2rem", color: "#fff", lineHeight: 1 }}>
              The Master Nose · Psychological Scent Profiling
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: 9.5,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              background: "none",
              border: "1px solid rgba(255,255,255,0.22)",
              padding: "8px 16px",
            }}
          >
            Close ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick Test Presets */}
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginBottom: 8 }}>
              Select a Psychological Archetype Preset (or customize below):
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.14)",
                    color: "#111",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Client Profile + Psychological Persona Form */}
          <form onSubmit={handleConsult} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.1rem" }}>
            <div>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                1. Season / Climate
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              >
                <option value="Winter">Winter (Cold / Crisp Nights)</option>
                <option value="Summer">Summer (Warm / Sunlit Heat)</option>
                <option value="Autumn">Autumn (Cool / Spiced Air)</option>
                <option value="Spring">Spring (Temperate / Blooming)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                2. Fragrance Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              >
                <option value="Niche">Haute Niche ($250+)</option>
                <option value="Designer">Signature Designer</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                3. Psychological Room Presence
              </label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              >
                <option value="The Quiet Sovereign — calm authority, clean, untouchable">Quiet Sovereign (Calm Authority & Clean Power)</option>
                <option value="The Nocturnal Hedonist — warm, charismatic, pulls people closer">Nocturnal Hedonist (Warm, Magnetic & Intimate)</option>
                <option value="The Velvet Mystic — enigmatic, artistic, smoky, old-soul">Velvet Mystic (Enigmatic, Smoky & Artistic)</option>
                <option value="The Solar Optimist — radiant, joyful, effortless sunlit energy">Solar Optimist (Radiant, Joyful & Sunlit)</option>
                <option value="The Audacious Romantic — sensual, daring, unforgettable">Audacious Romantic (Sensual, Daring & Poetic)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                4. Tactile Fabric Affinity
              </label>
              <select
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              >
                <option value="Heavy cashmere & amber velvet">Heavy Cashmere & Amber Velvet</option>
                <option value="Crisp white linen & chilled silk">Crisp White Linen & Chilled Silk</option>
                <option value="Bespoke Savile Row wool & smoked leather">Tailored Wool & Smoked Leather</option>
                <option value="Ruby satin, silk tulle & gold leaf">Ruby Satin & Sheer Silk Organza</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                5. Sensory Memory Sanctuary (Where does your mind feel most alive?)
              </label>
              <select
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              >
                <option value="A private wood-paneled study with aged cognac, honey & pipe tobacco">
                  A candlelit oak library with aged cognac, wildflower honey & pipe tobacco
                </option>
                <option value="Mediterranean cliffs at sunrise with crushed lemon, sea salt & rosemary">
                  Mediterranean volcanic cliffs at dawn — crushed lemon zest, sea spray & rosemary
                </option>
                <option value="A midnight Parisian rooftop with dark espresso, vanilla bourbon & white flowers">
                  A midnight Parisian gala — roasted espresso, Madagascar vanilla & orange blossom
                </option>
                <option value="Versailles rose garden at dusk with Turkish rose, lychee, cherry & incense">
                  A royal garden at twilight — velvet Damask rose, black cherry, lychee & incense
                </option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                6. Core Notes / Olfactory Craving
              </label>
              <input
                type="text"
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                placeholder="e.g. Creamy vanilla, smoky tobacco, crisp citrus..."
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: 6 }}>
                7. Emotional Vibe
              </label>
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g. Cozy, magnetic, mysterious, effortless..."
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  fontSize: 12.5,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#111",
                  color: "#fff",
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  border: "none",
                }}
              >
                {loading ? "Analyzing Psychological Persona & Calling n8n Gemini..." : "Diagnose My Persona & Flagship Bottle →"}
              </button>
            </div>
          </form>

          {error && (
            <div style={{ padding: "12px 16px", background: "#ffebee", color: "#c62828", fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Output Display */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.bottle_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  padding: "2rem",
                  display: "grid",
                  gridTemplateColumns: "240px 1fr",
                  gap: "2rem",
                  alignItems: "start",
                }}
              >
                {/* Left: Chosen Bottle Card */}
                <div style={{ textAlign: "center", background: "#f6f5f2", padding: "1.5rem 1rem", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 8,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      background: "#111",
                      color: "#d4af37",
                      padding: "5px 10px",
                      marginBottom: 8,
                    }}
                  >
                    {result.archetype || `Confidence: ${result.match_confidence.toUpperCase()}`}
                  </span>
                  <p style={{ fontSize: 9, color: "rgba(0,0,0,0.5)", marginBottom: 10 }}>
                    Kaggle Community Score: ★ {result.kaggle_rating || 4.65} / 5.0
                  </p>
                  <img
                    src={result.product?.image}
                    alt={result.product?.name}
                    style={{ width: "100%", height: 175, objectFit: "contain", marginBottom: 12 }}
                  />
                  <p style={{ fontSize: 8.5, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)" }}>
                    {result.product?.brand}
                  </p>
                  <h4 className="serif italic" style={{ fontSize: "1.4rem", color: "#111", margin: "4px 0" }}>
                    {result.product?.name}
                  </h4>
                  <p className="serif italic" style={{ fontSize: "1.15rem", color: "#111", marginBottom: 14 }}>
                    {result.product?.price}
                  </p>

                  {matchedFullProduct && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        onClick={() => onAddToCart(matchedFullProduct, matchedFullProduct.sizes?.[0])}
                        style={{
                          width: "100%",
                          padding: "11px",
                          background: "#111",
                          color: "#fff",
                          fontSize: 9,
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          border: "none",
                        }}
                      >
                        + Add to Bag
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(matchedFullProduct);
                        }}
                        style={{
                          width: "100%",
                          padding: "9px",
                          background: "none",
                          color: "#111",
                          fontSize: 8.5,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          border: "1px solid rgba(0,0,0,0.18)",
                        }}
                      >
                        Inspect Pyramid
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: 3-Part Master Nose Message */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      paddingBottom: 10,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#111", fontWeight: 500 }}>
                        Persona: {result.archetype}
                      </span>
                      {result.persona_summary && (
                        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.55)", marginTop: 2 }}>
                          {result.persona_summary}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2e7d32" }}>
                      Source: {result.message_source}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: "#1a1a1a",
                      whiteSpace: "pre-line",
                      fontWeight: 300,
                    }}
                  >
                    {result.message}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MasterNoseModal;
