import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_CHIPS = [
  "Start My Scent Persona Quiz",
  "Masculine (Pour Homme) — bold, structured & magnetic",
  "Feminine (Pour Femme) — radiant, sensual & hypnotic",
  "Unisex Haute Parfumerie — artistic, niche & boundary-free",
  "What is your strongest beast-mode perfume?",
  "Compare Sauvage Elixir and Xerjoff Naxos",
];

export default function ChatbotWidget({
  onSelectProduct,
  onAddToCart,
  allProducts = [],
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => "layla-" + Math.random().toString(36).slice(2, 10));

  // Live ML Constraints that work TOGETHER with the Chatbox as ONE brain
  const [mlSeason, setMlSeason] = useState("auto"); // "auto" | "winter" | "summer"
  const [mlGender, setMlGender] = useState("all"); // "all" | "men" | "women" | "unisex"
  const [mlSillage, setMlSillage] = useState("all"); // "all" | "moderate" | "strong" | "enormous"

  // Live ML Telemetry updated automatically as you chat with Layla Noor
  const [mlState, setMlState] = useState({
    archetype: "Awaiting Your Scent Clues...",
    kaggleRating: "4.65",
    confidence: "READY",
    topBottle: null,
    topAccords: [
      { name: "amber", pct: 88 },
      { name: "vanilla", pct: 84 },
      { name: "woody", pct: 80 },
      { name: "citrus", pct: 72 },
    ],
  });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to **Maison Noir**. I am **Layla Noor**, the conversational assistant for our **Kaggle Machine Learning Scent Engine**.\n\nWe can start our **6-Step Psychological & Gender Calibration** (starting with **Masculine / Feminine / Unisex** + 5 deep psychological questions: *Room Presence*, *Emotional Anchor*, *Sensory Memory*, *Tactile Fabric*, and *Sillage Trail*), or you can ask me anything freely!",
      source: "kaggle-ml-assistant",
      options: INITIAL_CHIPS,
    },
  ]);

  const bottomRef = useRef(null);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  const sendMessage = async (textOverride, isReset = false, customConstraints = null) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    // Auto-detect if the user just picked a Gender or Season in their message so the ML header pills sync live!
    const low = text.toLowerCase();
    let nextGender = customConstraints?.gender ?? mlGender;
    let nextSeason = customConstraints?.season ?? mlSeason;
    if (/\b(masculine|pour homme|for men|men|male|رجالي)\b/.test(low)) {
      nextGender = "men";
      setMlGender("men");
    } else if (/\b(feminine|pour femme|for women|women|female|نسائي)\b/.test(low)) {
      nextGender = "women";
      setMlGender("women");
    } else if (/\b(unisex|gender-fluid|للجنسين)\b/.test(low)) {
      nextGender = "unisex";
      setMlGender("unisex");
    }
    if (/\b(winter|fireside|parisian|cashmere|شتوي)\b/.test(low)) {
      nextSeason = "winter";
      setMlSeason("winter");
    } else if (/\b(summer|sunrise|linen|mediterranean|صيفي)\b/.test(low)) {
      nextSeason = "summer";
      setMlSeason("summer");
    }

    const activeConstraints = customConstraints || {
      season: nextSeason,
      gender: nextGender,
      sillage: mlSillage,
    };

    setMessages((prev) => [...prev, { role: "user", text }]);
    if (!textOverride) setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: text,
          sessionId,
          reset: isReset,
          mlConstraints: activeConstraints,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      if (data.mlState) {
        setMlState(data.mlState);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "Tell me what mood, memory, or bottle you are curious about.",
          source: data.source || "kaggle-ml + n8n-gemini",
          archetype: data.archetype || data.mlState?.archetype || null,
          mlState: data.mlState || null,
          options: Array.isArray(data.options) ? data.options : [],
          products: Array.isArray(data.products) ? data.products : [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I am momentarily syncing with the ML engine. Please try your message again.",
          source: "offline",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger an instant ML recommendation when the user clicks a live ML constraint pill
  const handleConstraintChange = (type, value) => {
    const nextSeason = type === "season" ? value : mlSeason;
    const nextGender = type === "gender" ? value : mlGender;
    const nextSillage = type === "sillage" ? value : mlSillage;

    if (type === "season") setMlSeason(value);
    if (type === "gender") setMlGender(value);
    if (type === "sillage") setMlSillage(value);

    const parts = [];
    if (nextSeason !== "auto") parts.push(`${nextSeason} season`);
    if (nextGender !== "all") parts.push(`for ${nextGender}`);
    if (nextSillage !== "all") parts.push(`with ${nextSillage} sillage projection`);

    if (parts.length > 0 && !loading) {
      sendMessage(
        `Recommend the best perfume ${parts.join(" ")} based on my profile`,
        false,
        { season: nextSeason, gender: nextGender, sillage: nextSillage }
      );
    }
  };

  const renderFormattedText = (rawText = "") => {
    return rawText.split("\n").map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <span key={lineIdx} style={{ display: "block", minHeight: line.trim() === "" ? "0.55rem" : "auto" }}>
          {parts.map((part, idx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={idx} style={{ fontWeight: 600, color: "inherit" }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <em key={idx} style={{ opacity: 0.9 }}>
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9998,
          background: "#111",
          color: "#fff",
          border: "1px solid rgba(212,175,55,0.45)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
          fontFamily: "Inter, sans-serif",
          fontSize: 10.5,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        <span style={{ color: "#d4af37", fontSize: 14 }}>✦</span>
        <span>{open ? "Close AI Concierge" : "Layla Noor · ML Scent Concierge"}</span>
      </button>

      {/* Single Unified ML + Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "fixed",
              bottom: 86,
              right: 24,
              width: expanded ? "min(880px, 95vw)" : "min(600px, 94vw)",
              height: expanded ? "min(840px, 88vh)" : "min(750px, 85vh)",
              background: "#fff",
              border: "1px solid rgba(17,17,17,0.14)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.26)",
              zIndex: 9998,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "width 0.25s ease, height 0.25s ease",
            }}
          >
            {/* ── UNIFIED HEADER + LIVE ML BRAIN TELEMETRY ── */}
            <div
              style={{
                background: "#111",
                color: "#fff",
                padding: "14px 18px 12px",
                borderBottom: "1px solid rgba(212,175,55,0.3)",
              }}
            >
              {/* Title Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#d4af37", fontSize: 13 }}>✦</span>
                    <span
                      className="serif italic"
                      style={{ fontSize: "1.25rem", letterSpacing: "0.05em", color: "#fff" }}
                    >
                      Layla Noor · ML Olfactory Assistant
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 2,
                    }}
                  >
                    Conversational Kaggle ML Engine + n8n Gemini Synthesis
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => sendMessage("Start My Scent Persona Quiz", true)}
                    title="Start 3-Step Psychological Persona Quiz"
                    style={{
                      background: "rgba(212,175,55,0.16)",
                      border: "1px solid rgba(212,175,55,0.45)",
                      color: "#f3d266",
                      fontSize: 8.5,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    🧠 Persona Quiz
                  </button>
                  <button
                    onClick={() => setExpanded((e) => !e)}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: "#fff",
                      fontSize: 8.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "6px 9px",
                      cursor: "pointer",
                    }}
                  >
                    {expanded ? "⤡ Compact" : "⤢ Expand"}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 15,
                      cursor: "pointer",
                      padding: "2px 6px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Live ML Telemetry Strip (Updates automatically from the conversation!) */}
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "9px 12px",
                  marginBottom: 9,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <div style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#d4af37" }}>
                    🧠 Live ML Persona: <strong style={{ color: "#fff" }}>{mlState.archetype}</strong>
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
                    Kaggle Rating: <strong style={{ color: "#d4af37" }}>{mlState.kaggleRating}★</strong> · Match:{" "}
                    <strong style={{ color: "#81c784" }}>{mlState.confidence}</strong>
                  </div>
                </div>

                {/* Live Accord Weights Bar */}
                {mlState.topAccords && mlState.topAccords.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {mlState.topAccords.map((acc) => (
                      <div key={acc.name} style={{ background: "rgba(0,0,0,0.35)", padding: "4px 7px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 8,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.75)",
                            marginBottom: 3,
                          }}
                        >
                          <span>{acc.name}</span>
                          <span style={{ color: "#d4af37" }}>{acc.pct}%</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.12)", width: "100%" }}>
                          <div style={{ height: "100%", width: `${acc.pct}%`, background: "#d4af37" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive ML Filter Pills (Directly steer the ML model inside the chat!) */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
                  ML Filters:
                </span>

                {/* Season Pills */}
                {[
                  { id: "auto", label: "All Seasons" },
                  { id: "winter", label: "❄ Winter" },
                  { id: "summer", label: "☀ Summer" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleConstraintChange("season", s.id)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 8.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      background: mlSeason === s.id ? "#d4af37" : "rgba(255,255,255,0.07)",
                      color: mlSeason === s.id ? "#111" : "rgba(255,255,255,0.75)",
                      fontWeight: mlSeason === s.id ? 600 : 400,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {s.label}
                  </button>
                ))}

                <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>

                {/* Gender Pills */}
                {[
                  { id: "all", label: "All" },
                  { id: "men", label: "Men" },
                  { id: "women", label: "Women" },
                  { id: "unisex", label: "Unisex" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleConstraintChange("gender", g.id)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 8.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      background: mlGender === g.id ? "#d4af37" : "rgba(255,255,255,0.07)",
                      color: mlGender === g.id ? "#111" : "rgba(255,255,255,0.75)",
                      fontWeight: mlGender === g.id ? 600 : 400,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {g.label}
                  </button>
                ))}

                <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>

                {/* Beast Mode Toggle */}
                <button
                  onClick={() =>
                    handleConstraintChange("sillage", mlSillage === "enormous" ? "all" : "enormous")
                  }
                  style={{
                    padding: "4px 8px",
                    fontSize: 8.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    background: mlSillage === "enormous" ? "#d4af37" : "rgba(255,255,255,0.07)",
                    color: mlSillage === "enormous" ? "#111" : "rgba(255,255,255,0.75)",
                    fontWeight: mlSillage === "enormous" ? 600 : 400,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  🔥 Beast Mode Sillage
                </button>
              </div>
            </div>

            {/* ── UNIFIED CONVERSATION STREAM ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "#faf9f6",
              }}
            >
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: isUser ? "82%" : "94%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        background: isUser ? "#111" : "#fff",
                        color: isUser ? "#fff" : "#111",
                        border: isUser ? "none" : "1px solid rgba(0,0,0,0.09)",
                        padding: "14px 18px",
                        fontSize: 14,
                        lineHeight: 1.65,
                        boxShadow: isUser ? "none" : "0 4px 14px rgba(0,0,0,0.04)",
                      }}
                    >
                      {m.archetype && !isUser && (
                        <div
                          style={{
                            display: "inline-block",
                            background: "#111",
                            color: "#d4af37",
                            fontSize: 9,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            padding: "4px 10px",
                            marginBottom: 10,
                          }}
                        >
                          ✦ ML Archetype: {m.archetype}
                        </div>
                      )}

                      <div>{renderFormattedText(m.text)}</div>

                      {!isUser && m.source && (
                        <div
                          style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTop: "1px solid rgba(0,0,0,0.05)",
                            fontSize: 8.5,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "rgba(17,17,17,0.4)",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>ML Pipeline: {m.source}</span>
                          <span>Kaggle + n8n Gemini</span>
                        </div>
                      )}
                    </div>

                    {/* Recommended Bottle Cards inside Chat */}
                    {!isUser && m.products && m.products.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: m.products.length > 1 ? "repeat(2, 1fr)" : "1fr",
                          gap: 10,
                        }}
                      >
                        {m.products.map((prod) => {
                          const fullProd =
                            allProducts.find((p) => String(p.id) === String(prod.id)) || prod;
                          return (
                            <div
                              key={prod.id}
                              style={{
                                background: "#fff",
                                border: "1px solid rgba(17,17,17,0.12)",
                                padding: "10px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                style={{
                                  width: 52,
                                  height: 64,
                                  objectFit: "contain",
                                  background: "#f7f7f5",
                                  padding: 4,
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 8,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    color: "rgba(17,17,17,0.45)",
                                  }}
                                >
                                  {prod.brand}
                                </div>
                                <div
                                  className="serif italic"
                                  style={{
                                    fontSize: 15,
                                    color: "#111",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {prod.name}
                                </div>
                                <div style={{ fontSize: 11, color: "#111", fontWeight: 500 }}>
                                  {prod.price}
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                  {onAddToCart && (
                                    <button
                                      onClick={() => onAddToCart(fullProd, fullProd.sizes?.[0])}
                                      style={{
                                        background: "#111",
                                        color: "#fff",
                                        border: "none",
                                        padding: "5px 9px",
                                        fontSize: 8,
                                        letterSpacing: "0.16em",
                                        textTransform: "uppercase",
                                        cursor: "pointer",
                                      }}
                                    >
                                      + Bag
                                    </button>
                                  )}
                                  {onSelectProduct && (
                                    <button
                                      onClick={() => onSelectProduct(fullProd)}
                                      style={{
                                        background: "#fff",
                                        color: "#111",
                                        border: "1px solid rgba(17,17,17,0.22)",
                                        padding: "5px 9px",
                                        fontSize: 8,
                                        letterSpacing: "0.16em",
                                        textTransform: "uppercase",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Details
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick-Reply Chips */}
                    {!isUser && m.options && m.options.length > 0 && i === messages.length - 1 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 2 }}>
                        {m.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(opt)}
                            disabled={loading}
                            style={{
                              fontSize: 11,
                              padding: "8px 12px",
                              background: "#fff",
                              border: "1px solid rgba(17,17,17,0.2)",
                              color: "#111",
                              textAlign: "left",
                              cursor: "pointer",
                              lineHeight: 1.35,
                              transition: "all 0.18s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#111";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fff";
                              e.currentTarget.style.color = "#111";
                            }}
                          >
                            ✦ {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(17,17,17,0.5)",
                    padding: "10px 14px",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  Layla Noor is scoring Kaggle ML vectors & consulting n8n Gemini...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── UNIFIED INPUT BAR ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              style={{
                display: "flex",
                borderTop: "1px solid rgba(0,0,0,0.1)",
                background: "#fff",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to the ML engine (e.g. 'sweet winter honey', 'compare Naxos & Sauvage', 'repeat')..."
                style={{
                  flex: 1,
                  border: "none",
                  padding: "16px 18px",
                  fontSize: 13.5,
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  padding: "0 24px",
                  fontSize: 10,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
