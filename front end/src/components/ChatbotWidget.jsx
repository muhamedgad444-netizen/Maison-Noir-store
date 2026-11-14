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
  const [showInsights, setShowInsights] = useState(false);
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

    setShowInsights(false);
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

  const SOURCE_LABELS = {
    "n8n-workflow-6": "Gemini · n8n Agent",
    "n8n-cloud-gemini": "Gemini · Master Nose",
    "kaggle-ml + n8n-gemini": "Kaggle ML Engine",
    "kaggle-ml-encyclopedia": "Scent Encyclopedia",
    "kaggle-ml-comparator": "ML Comparator",
    "kaggle-ml-catalog-query": "Catalog Insight",
    "kaggle-ml-performance-rank": "Performance Rank",
    "kaggle-ml-persona-ar": "Kaggle ML Engine",
    "layla-noor-bespoke-lab": "Bespoke Lab",
    "layla-noor-atelier": "Atelier Tips",
    "layla-noor-memory-recall": "Memory Recall",
    "kaggle-ml-assistant": "Layla Noor",
    offline: "Offline",
  };
  const prettySource = (s = "") =>
    SOURCE_LABELS[s] || (s.startsWith("psychological-profiler") ? "Persona Profiler" : s);

  const renderFormattedText = (rawText = "") =>
    rawText.split("\n").map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <span key={lineIdx} style={{ display: "block", minHeight: line.trim() === "" ? "0.6rem" : "auto" }}>
          {parts.map((part, idx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={idx} style={{ fontWeight: 600, color: "#f1d27a" }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
              return (
                <em key={idx} style={{ color: "rgba(236,232,223,0.75)" }}>
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </span>
      );
    });

  const confColor =
    mlState.confidence === "HIGH"
      ? "#7fd99a"
      : mlState.confidence === "LOW"
      ? "#f08a7a"
      : "#f1d27a";

  const Seg = ({ items, value, onPick }) => (
    <div className="ln-seg">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={value === it.id ? "on" : ""}
          onClick={() => onPick(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <style>{LN_CSS}</style>

      {/* Floating Launcher */}
      <button className="ln-launcher" onClick={() => setOpen((v) => !v)} aria-label="Open Layla Noor">
        <span className="ln-launcher-orb">{open ? "✕" : "✦"}</span>
        {!open && (
          <span className="ln-launcher-text">
            <b>Layla Noor</b>
            <small>AI Scent Concierge</small>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ln-window"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: expanded ? "min(760px, 95vw)" : "min(430px, 94vw)",
              height: expanded ? "min(860px, 88vh)" : "min(700px, 82vh)",
            }}
          >
            {/* ── HEADER ── */}
            <div className="ln-header">
              <div className="ln-avatar">LN</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ln-title serif">Layla Noor</div>
                <div className="ln-sub">
                  <span className="ln-dot" /> Online · AI Scent Concierge
                </div>
              </div>
              <button
                className="ln-icon-btn"
                title="Restart persona quiz"
                onClick={() => sendMessage("Start My Scent Persona Quiz", true)}
              >
                ↻
              </button>
              <button
                className="ln-icon-btn"
                title={expanded ? "Compact" : "Expand"}
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "⤡" : "⤢"}
              </button>
              <button className="ln-icon-btn" title="Close" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {/* ── PERSONA STRIP (click to open insights) ── */}
            <button className="ln-strip" onClick={() => setShowInsights((v) => !v)}>
              <span className="ln-strip-label">Persona</span>
              <span className="ln-strip-arch">{mlState.archetype}</span>
              <span className="ln-strip-meta">
                {mlState.kaggleRating}★
                <span className="ln-badge" style={{ color: confColor, borderColor: confColor }}>
                  {mlState.confidence}
                </span>
                <span className={`ln-chev ${showInsights ? "up" : ""}`}>⌄</span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {showInsights && (
                <motion.div
                  className="ln-insights"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="ln-insights-inner">
                    {mlState.topAccords?.length > 0 && (
                      <div className="ln-accords">
                        {mlState.topAccords.map((acc) => (
                          <div key={acc.name} className="ln-accord">
                            <div className="ln-accord-row">
                              <span>{acc.name}</span>
                              <span>{acc.pct}%</span>
                            </div>
                            <div className="ln-bar">
                              <motion.div
                                className="ln-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${acc.pct}%` }}
                                transition={{ duration: 0.6 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="ln-filters">
                      <Seg
                        value={mlSeason}
                        onPick={(v) => handleConstraintChange("season", v)}
                        items={[
                          { id: "auto", label: "Any season" },
                          { id: "winter", label: "❄ Winter" },
                          { id: "summer", label: "☀ Summer" },
                        ]}
                      />
                      <Seg
                        value={mlGender}
                        onPick={(v) => handleConstraintChange("gender", v)}
                        items={[
                          { id: "all", label: "All" },
                          { id: "men", label: "Men" },
                          { id: "women", label: "Women" },
                          { id: "unisex", label: "Unisex" },
                        ]}
                      />
                      <button
                        type="button"
                        className={`ln-toggle ${mlSillage === "enormous" ? "on" : ""}`}
                        onClick={() =>
                          handleConstraintChange("sillage", mlSillage === "enormous" ? "all" : "enormous")
                        }
                      >
                        🔥 Beast mode
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── MESSAGES ── */}
            <div className="ln-stream">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`ln-row ${isUser ? "user" : "bot"}`}
                  >
                    {!isUser && <div className="ln-mini-avatar">✦</div>}
                    <div className="ln-col">
                      <div className={`ln-bubble ${isUser ? "user" : "bot"}`}>
                        {m.archetype && !isUser && <div className="ln-arch-tag">✦ {m.archetype}</div>}
                        <div>{renderFormattedText(m.text)}</div>
                      </div>
                      {!isUser && m.source && <div className="ln-source">{prettySource(m.source)}</div>}

                      {!isUser && m.products?.length > 0 && (
                        <div
                          className="ln-products"
                          style={{ gridTemplateColumns: m.products.length > 1 && expanded ? "1fr 1fr" : "1fr" }}
                        >
                          {m.products.map((prod) => {
                            const fullProd =
                              allProducts.find((p) => String(p.id) === String(prod.id)) || prod;
                            return (
                              <div key={prod.id} className="ln-product">
                                <div className="ln-product-img">
                                  <img src={prod.image} alt={prod.name} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="ln-product-brand">{prod.brand}</div>
                                  <div className="ln-product-name serif">{prod.name}</div>
                                  <div className="ln-product-price">{prod.price}</div>
                                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                    {onAddToCart && (
                                      <button
                                        className="ln-btn gold"
                                        onClick={() => onAddToCart(fullProd, fullProd.sizes?.[0])}
                                      >
                                        Add to bag
                                      </button>
                                    )}
                                    {onSelectProduct && (
                                      <button className="ln-btn ghost" onClick={() => onSelectProduct(fullProd)}>
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

                      {!isUser && m.options?.length > 0 && i === messages.length - 1 && (
                        <div className="ln-chips">
                          {m.options.map((opt, idx) => (
                            <button key={idx} className="ln-chip" disabled={loading} onClick={() => sendMessage(opt)}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="ln-row bot">
                  <div className="ln-mini-avatar">✦</div>
                  <div className="ln-bubble bot ln-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── INPUT ── */}
            <form
              className="ln-input-wrap"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe a mood, a memory, or ask about a bottle…"
                className="ln-input"
              />
              <button type="submit" className="ln-send" disabled={loading || !input.trim()} aria-label="Send">
                ↑
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const LN_CSS = `
.ln-launcher{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:12px;
  background:rgba(13,13,15,.92);backdrop-filter:blur(12px);color:#ece8df;border:1px solid rgba(212,175,55,.35);
  border-radius:999px;padding:8px 20px 8px 8px;box-shadow:0 18px 40px rgba(0,0,0,.35);font-family:Inter,sans-serif;
  transition:transform .2s ease, box-shadow .2s ease}
.ln-launcher:hover{transform:translateY(-2px);box-shadow:0 22px 50px rgba(212,175,55,.25)}
.ln-launcher-orb{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:16px;color:#111;
  background:radial-gradient(circle at 30% 30%,#f7e2a0,#d4af37 60%,#9c7a1c);box-shadow:0 0 0 4px rgba(212,175,55,.15);
  animation:lnPulse 2.6s ease-in-out infinite}
.ln-launcher-text{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15}
.ln-launcher-text b{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:400;font-size:18px;letter-spacing:.02em}
.ln-launcher-text small{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(236,232,223,.55)}
@keyframes lnPulse{0%,100%{box-shadow:0 0 0 4px rgba(212,175,55,.15)}50%{box-shadow:0 0 0 9px rgba(212,175,55,.05)}}

.ln-window{position:fixed;bottom:92px;right:24px;z-index:9998;display:flex;flex-direction:column;overflow:hidden;
  background:linear-gradient(180deg,#121214 0%,#0b0b0d 100%);color:#ece8df;border:1px solid rgba(212,175,55,.18);
  border-radius:22px;box-shadow:0 40px 100px rgba(0,0,0,.5);font-family:Inter,sans-serif;
  transition:width .28s ease,height .28s ease}

.ln-header{display:flex;align-items:center;gap:12px;padding:16px 16px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
.ln-avatar{width:42px;height:42px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-family:"Cormorant Garamond",serif;
  font-size:16px;color:#111;font-weight:500;background:radial-gradient(circle at 30% 30%,#f7e2a0,#d4af37 60%,#9c7a1c)}
.ln-title{font-size:22px;font-style:italic;line-height:1;color:#fff}
.ln-sub{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:10px;letter-spacing:.06em;color:rgba(236,232,223,.5);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ln-dot{width:6px;height:6px;border-radius:50%;background:#7fd99a;box-shadow:0 0 8px #7fd99a;flex-shrink:0}
.ln-icon-btn{width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);
  color:rgba(236,232,223,.8);font-size:13px;display:grid;place-items:center;transition:all .15s ease;flex-shrink:0}
.ln-icon-btn:hover{background:rgba(212,175,55,.15);border-color:rgba(212,175,55,.4);color:#f1d27a}

.ln-strip{display:flex;align-items:center;gap:10px;margin:10px 14px 0;padding:10px 14px;border-radius:14px;text-align:left;
  background:rgba(212,175,55,.06);border:1px solid rgba(212,175,55,.16);color:inherit;transition:background .15s}
.ln-strip:hover{background:rgba(212,175,55,.1)}
.ln-strip-label{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(212,175,55,.8)}
.ln-strip-arch{flex:1;min-width:0;font-size:12.5px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ln-strip-meta{display:flex;align-items:center;gap:8px;font-size:11px;color:#f1d27a}
.ln-badge{font-size:8.5px;letter-spacing:.14em;border:1px solid;border-radius:999px;padding:2px 7px}
.ln-chev{color:rgba(236,232,223,.5);transition:transform .2s;display:inline-block;line-height:1}
.ln-chev.up{transform:rotate(180deg)}

.ln-insights{overflow:hidden}
.ln-insights-inner{padding:12px 14px 4px;display:flex;flex-direction:column;gap:12px}
.ln-accords{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 14px}
.ln-accord-row{display:flex;justify-content:space-between;font-size:10px;letter-spacing:.08em;text-transform:capitalize;
  color:rgba(236,232,223,.7);margin-bottom:4px}
.ln-accord-row span:last-child{color:#f1d27a}
.ln-bar{height:4px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}
.ln-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#9c7a1c,#f1d27a)}
.ln-filters{display:flex;flex-wrap:wrap;gap:8px}
.ln-seg{display:inline-flex;padding:3px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
.ln-seg button{border:none;background:none;color:rgba(236,232,223,.6);font-size:10.5px;padding:5px 11px;border-radius:999px;transition:all .15s}
.ln-seg button.on{background:#d4af37;color:#111;font-weight:500}
.ln-toggle{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(236,232,223,.7);
  font-size:10.5px;padding:6px 12px;border-radius:999px;transition:all .15s}
.ln-toggle.on{background:rgba(240,138,122,.15);border-color:rgba(240,138,122,.5);color:#f6b3a7}

.ln-stream{flex:1;overflow-y:auto;padding:18px 14px 10px;display:flex;flex-direction:column;gap:16px}
.ln-stream::-webkit-scrollbar{width:4px}
.ln-stream::-webkit-scrollbar-track{background:transparent}
.ln-stream::-webkit-scrollbar-thumb{background:rgba(212,175,55,.25);border-radius:4px}
.ln-row{display:flex;gap:8px;align-items:flex-start}
.ln-row.user{justify-content:flex-end}
.ln-col{display:flex;flex-direction:column;gap:8px;min-width:0;max-width:88%}
.ln-row.user .ln-col{align-items:flex-end;max-width:80%}
.ln-mini-avatar{width:26px;height:26px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;color:#d4af37;
  background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);margin-top:2px}
.ln-bubble{padding:12px 15px;font-size:13.5px;line-height:1.65;word-wrap:break-word}
.ln-bubble.bot{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);border-radius:4px 18px 18px 18px;color:#e6e1d6}
.ln-bubble.user{background:linear-gradient(135deg,#f1d27a,#d4af37);color:#16130a;border-radius:18px 18px 4px 18px;font-weight:400}
.ln-bubble.user strong{color:#16130a !important}
.ln-arch-tag{display:inline-block;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#f1d27a;
  background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);border-radius:999px;padding:3px 10px;margin-bottom:9px}
.ln-source{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(236,232,223,.35);padding-left:4px}

.ln-products{display:grid;gap:8px}
.ln-product{display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.07);transition:border-color .15s}
.ln-product:hover{border-color:rgba(212,175,55,.35)}
.ln-product-img{width:62px;height:74px;border-radius:12px;background:#f5f2ea;display:grid;place-items:center;flex-shrink:0;overflow:hidden}
.ln-product-img img{width:100%;height:100%;object-fit:contain;padding:5px}
.ln-product-brand{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(236,232,223,.45)}
.ln-product-name{font-size:17px;font-style:italic;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25}
.ln-product-price{font-size:12px;color:#f1d27a;margin-top:1px}
.ln-btn{font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;transition:all .15s}
.ln-btn.gold{background:#d4af37;color:#111;border:1px solid #d4af37;font-weight:500}
.ln-btn.gold:hover{background:#f1d27a}
.ln-btn.ghost{background:transparent;color:#ece8df;border:1px solid rgba(255,255,255,.18)}
.ln-btn.ghost:hover{border-color:#d4af37;color:#f1d27a}

.ln-chips{display:flex;flex-wrap:wrap;gap:6px}
.ln-chip{font-size:11.5px;line-height:1.35;text-align:left;padding:7px 13px;border-radius:999px;color:#ece8df;
  background:rgba(255,255,255,.03);border:1px solid rgba(212,175,55,.28);transition:all .15s}
.ln-chip:hover:not(:disabled){background:rgba(212,175,55,.14);border-color:#d4af37;color:#fff}
.ln-chip:disabled{opacity:.45}

.ln-typing{display:flex;gap:5px;align-items:center;padding:14px 16px}
.ln-typing span{width:6px;height:6px;border-radius:50%;background:#d4af37;animation:lnBounce 1.2s infinite ease-in-out}
.ln-typing span:nth-child(2){animation-delay:.15s}
.ln-typing span:nth-child(3){animation-delay:.3s}
@keyframes lnBounce{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}

.ln-input-wrap{display:flex;align-items:center;gap:8px;margin:8px 12px 12px;padding:6px 6px 6px 16px;border-radius:999px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);transition:border-color .15s}
.ln-input-wrap:focus-within{border-color:rgba(212,175,55,.5)}
.ln-input{flex:1;min-width:0;border:none;outline:none;background:transparent;color:#ece8df;font-size:13.5px;font-family:Inter,sans-serif;padding:8px 0}
.ln-input::placeholder{color:rgba(236,232,223,.35)}
.ln-send{width:38px;height:38px;border-radius:50%;border:none;flex-shrink:0;font-size:17px;font-weight:600;color:#111;
  background:linear-gradient(135deg,#f1d27a,#d4af37);transition:transform .15s,opacity .15s}
.ln-send:hover:not(:disabled){transform:scale(1.06)}
.ln-send:disabled{opacity:.35}

@media (max-width:520px){
  .ln-window{right:3vw;bottom:84px;border-radius:18px}
  .ln-launcher{right:16px;bottom:16px}
}
`;
