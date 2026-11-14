import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetail, { getPriceForSize } from "./components/ProductDetail";
import CheckoutPanel from "./components/CheckoutPanel";
import ChatbotWidget from "./components/ChatbotWidget";
import MasterNoseModal from "./components/MasterNoseModal";
import { products, fragranceFamilies } from "./data/products";

const marqueeText = [
  "Bleu de Chanel", "·",
  "Xerjoff 1861 Naxos", "·",
  "JPG Le Male Elixir", "·",
  "YSL Libre Intense", "·",
  "Creed Aventus", "·",
  "Xerjoff Erba Pura", "·",
  "Tom Ford Tobacco Vanille", "·",
  "Kilian Angels' Share", "·",
  "Parfums de Marly Delina", "·",
  "YSL Y Eau de Parfum", "·",
  "Dior Sauvage Elixir", "·",
  "Baccarat Rouge 540", "·",
  "Gaultier Divine", "·",
  "Acqua di Giò Parfum", "·",
];

const LOCAL_STORAGE_KEY = "maison_noir_cart_v2";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [masterNoseOpen, setMasterNoseOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  // Filtering states
  const [seasonFilter, setSeasonFilter] = useState("all"); // "all" | "winter" | "summer"
  const [genderFilter, setGenderFilter] = useState("all"); // "all" | "men" | "women" | "unisex"
  const [searchQuery, setSearchQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState(null);

  const selected = products.find((p) => p.id === selectedId);

  // Add to Bag with exact size & calculated price
  const addToCart = (product, chosenSize) => {
    const size = chosenSize || product.sizes?.[0] || "50ML";
    const priceNum = getPriceForSize(product.basePrice || 165, size);
    const priceStr = `$${priceNum}`;
    const cartId = `${product.id}-${size}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartId === cartId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: (next[existingIndex].quantity || 1) + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          ...product,
          size,
          price: priceStr,
          calculatedPriceNumber: priceNum,
          quantity: 1,
          cartId,
        },
      ];
    });

    toast.custom(
      () => (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "13px 22px",
            background: "#111",
            color: "#fff",
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <span style={{ color: "#81c784", fontSize: 11 }}>✓</span>
          <span>{product.name} · {size} added to Bag</span>
        </motion.div>
      ),
      { duration: 2500 }
    );
  };

  const handleUpdateQty = (cartId, newQty) => {
    if (newQty <= 0) {
      handleRemove(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemove = (cartId) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Season match
      if (seasonFilter !== "all" && p.seasonType !== seasonFilter) return false;

      // Gender match
      if (genderFilter !== "all" && p.genderType !== genderFilter) return false;

      // Family match
      if (familyFilter && !p.category.toLowerCase().includes(familyFilter.toLowerCase())) return false;

      // Search match (name, brand, inspiration, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesInsp = p.inspiration.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesNotes =
          p.top.toLowerCase().includes(q) ||
          p.heart.toLowerCase().includes(q) ||
          p.base.toLowerCase().includes(q);
        return matchesName || matchesBrand || matchesInsp || matchesCategory || matchesNotes;
      }

      return true;
    });
  }, [seasonFilter, genderFilter, familyFilter, searchQuery]);

  const totalBagItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cart]);

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { background: "transparent", boxShadow: "none", padding: 0 } }}
      />

      {/* ── 2-Second Luxury Intro Splash Animation ── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="maison-noir-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "radial-gradient(circle at center, #171512 0%, #09090b 100%)",
              color: "#ece8df",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Expanding golden aura ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.35, opacity: [0, 0.35, 0] }}
              transition={{ duration: 1.9, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: 340,
                height: 340,
                borderRadius: "50%",
                border: "1px solid rgba(212,175,55,0.45)",
                pointerEvents: "none",
              }}
            />

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              style={{
                fontSize: 9.5,
                letterSpacing: "0.48em",
                textTransform: "uppercase",
                color: "#d4af37",
                marginBottom: 14,
              }}
            >
              ✦ Paris · Haute Parfumerie ✦
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, scale: 0.94, letterSpacing: "0.08em" }}
              animate={{ opacity: 1, scale: 1, letterSpacing: "0.22em" }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="serif"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.8rem)",
                textTransform: "uppercase",
                color: "#fff",
                fontWeight: 300,
              }}
            >
              Maison Noir
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="serif italic"
              style={{ fontSize: "1.15rem", color: "#f1d27a", marginTop: 6, marginBottom: 26 }}
            >
              Architecture of Scent · AI Olfactory Atelier
            </motion.p>

            {/* 2-Second Gold Progress Line */}
            <div
              style={{
                width: 180,
                height: 1.5,
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.75, ease: "easeInOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #9c7a1c, #f7e2a0, #d4af37)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ minHeight: "100vh", background: "#fff" }}>
        <Navbar
          cartCount={totalBagItemsCount}
          onBagClick={() => setBagOpen(true)}
        />

        {/* ── Hero — Full editorial luxury ─────── */}
        <section
          style={{
            height: "100vh",
            background: "#f6f5f3",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 2rem",
            paddingTop: 100,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle watermark background typography */}
          <div
            style={{
              position: "absolute",
              fontSize: "clamp(8rem, 24vw, 22rem)",
              fontFamily: "Cormorant Garamond, serif",
              fontStyle: "italic",
              color: "rgba(0,0,0,0.025)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              userSelect: "none",
              pointerEvents: "none",
              top: "50%",
              transform: "translateY(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            Haute Parfumerie
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            style={{
              fontSize: 9,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "rgba(17,17,17,0.45)",
              marginBottom: "1.5rem",
            }}
          >
            Maison Noir · Édition 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="serif italic"
            style={{
              fontSize: "clamp(3.5rem, 9.5vw, 8.5rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.02em",
              color: "#111",
              marginBottom: "1.75rem",
            }}
          >
            Architecture<br />of Scent.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            style={{
              fontSize: 12.5,
              color: "rgba(17,17,17,0.55)",
              maxWidth: 480,
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            Mastercrafted olfactory creations inspired by the world’s most coveted niche and designer houses —
            curated for Winter warmth and Summer radiance.
          </motion.p>

          {/* Quick Collection Anchor Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            style={{ marginTop: "2.8rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}
          >
            <a
              href="#collection"
              data-cursor
              onClick={() => {
                setSeasonFilter("winter");
                setFamilyFilter(null);
              }}
              style={{
                fontSize: 8.5,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#111",
                padding: "12px 24px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Explore Winter Collection ❄️
            </a>

            <a
              href="#collection"
              data-cursor
              onClick={() => {
                setSeasonFilter("summer");
                setFamilyFilter(null);
              }}
              style={{
                fontSize: 8.5,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#111",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.15)",
                padding: "12px 24px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Explore Summer Collection ☀️
            </a>
          </motion.div>
        </section>

        {/* ── Marquee Band ─────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            padding: "16px 0",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <div className="marquee-track">
            {marqueeText.concat(marqueeText).map((w, i) => (
              <span
                key={i}
                className="serif italic"
                style={{
                  fontSize: "1.35rem",
                  color: i % 2 === 1 ? "rgba(17,17,17,0.25)" : "#111",
                  padding: "0 2rem",
                  whiteSpace: "nowrap",
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* ── Shop by Olfactory Family ─────────────────── */}
        <section style={{ padding: "5rem 3rem", maxWidth: 1140, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: 8.5,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(17,17,17,0.4)",
              marginBottom: "0.75rem",
            }}
          >
            Curated Families
          </p>
          <h2
            className="serif italic"
            style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#111", marginBottom: "3rem" }}
          >
            Explore by Scent Profile
          </h2>

          <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
            {fragranceFamilies.map((fam) => {
              const isActive = familyFilter === fam.filter;
              return (
                <div
                  key={fam.label}
                  data-cursor
                  onClick={() => {
                    setFamilyFilter(isActive ? null : fam.filter);
                    const el = document.getElementById("collection");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    opacity: isActive ? 1 : 0.85,
                  }}
                >
                  <div
                    className="cat-circle"
                    style={{
                      border: isActive ? "2px solid #111" : "1px solid rgba(0,0,0,0.08)",
                      background: "#f6f5f3",
                      padding: 10,
                    }}
                  >
                    <img
                      src={fam.img}
                      alt={fam.label}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#111",
                        fontWeight: isActive ? 600 : 400,
                        display: "block",
                      }}
                    >
                      {fam.label}
                    </span>
                    <span style={{ fontSize: 7.5, color: "rgba(17,17,17,0.4)", textTransform: "uppercase" }}>
                      {fam.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Collection Grid & Filtering Architecture ─── */}
        <section id="collection" style={{ padding: "2rem 3rem 8rem", maxWidth: 1260, margin: "0 auto" }}>
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              marginBottom: "2.5rem",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              paddingBottom: "1.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: 8.5, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(17,17,17,0.4)", marginBottom: 4 }}>
                  Maison Noir Catalog
                </p>
                <h2 className="serif italic" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#111" }}>
                  The Signature Collection
                </h2>
              </div>

              {/* Real-time Search Input */}
              <div style={{ position: "relative", minWidth: 260 }}>
                <input
                  type="text"
                  placeholder="SEARCH BRAND, NOTE, OR SCENT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 32px 10px 0",
                    fontSize: 9.5,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    color: "#111",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
                {searchQuery && (
                  <button
                    data-cursor
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 10,
                      color: "rgba(0,0,0,0.4)",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs: Season & Gender */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              {/* Season Tabs */}
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {[
                  { key: "all", label: "All Seasons" },
                  { key: "winter", label: "Winter Collection ❄️" },
                  { key: "summer", label: "Summer Collection ☀️" },
                ].map((s) => {
                  const isCurrent = seasonFilter === s.key;
                  return (
                    <button
                      key={s.key}
                      data-cursor
                      onClick={() => setSeasonFilter(s.key)}
                      style={{
                        padding: "8px 14px",
                        fontSize: 8.5,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        background: isCurrent ? "#111" : "#fff",
                        color: isCurrent ? "#fff" : "rgba(17,17,17,0.5)",
                        border: `1px solid ${isCurrent ? "#111" : "rgba(0,0,0,0.12)"}`,
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Gender Tabs */}
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {[
                  { key: "all", label: "All Genders" },
                  { key: "men", label: "Pour Homme (Men)" },
                  { key: "women", label: "Pour Femme (Women)" },
                  { key: "unisex", label: "Unisex" },
                ].map((g) => {
                  const isCurrent = genderFilter === g.key;
                  return (
                    <button
                      key={g.key}
                      data-cursor
                      onClick={() => setGenderFilter(g.key)}
                      style={{
                        padding: "8px 14px",
                        fontSize: 8.5,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        background: isCurrent ? "#111" : "#fff",
                        color: isCurrent ? "#fff" : "rgba(17,17,17,0.5)",
                        border: `1px solid ${isCurrent ? "#111" : "rgba(0,0,0,0.12)"}`,
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}

                {/* Reset Filters button if any active */}
                {(seasonFilter !== "all" || genderFilter !== "all" || familyFilter || searchQuery) && (
                  <button
                    data-cursor
                    onClick={() => {
                      setSeasonFilter("all");
                      setGenderFilter("all");
                      setFamilyFilter(null);
                      setSearchQuery("");
                    }}
                    style={{
                      padding: "8px 12px",
                      fontSize: 8,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      background: "none",
                      color: "#c62828",
                      border: "1px dashed #c62828",
                      cursor: "pointer",
                    }}
                  >
                    Reset Filters ✕
                  </button>
                )}
              </div>
            </div>

            {/* Results summary line */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 8.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(17,17,17,0.4)" }}>
                Showing {filteredProducts.length} of {products.length} Flacons
                {familyFilter && ` · Filtered by ${familyFilter}`}
              </span>
              <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(17,17,17,0.35)" }}>
                Handcrafted in Grasse & Paris
              </span>
            </div>
          </div>

          {/* Empty state if search or filter yielded 0 */}
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
              <p className="serif italic" style={{ fontSize: "1.8rem", color: "rgba(0,0,0,0.3)", marginBottom: "1rem" }}>
                No fragrance matches your filter criteria.
              </p>
              <button
                data-cursor
                onClick={() => {
                  setSeasonFilter("all");
                  setGenderFilter("all");
                  setFamilyFilter(null);
                  setSearchQuery("");
                }}
                style={{
                  padding: "12px 24px",
                  fontSize: 8.5,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          <div className="product-grid">
            {filteredProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard
                  product={p}
                  onSelect={(item) => setSelectedId(item.id)}
                  onQuickAdd={(item) => addToCart(item, item.sizes?.[0])}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Brand Statement Strip ─────────────────────── */}
        <section style={{ background: "#111", padding: "6rem 3rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: 8.5,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: "1.5rem",
            }}
          >
            Haute Parfumerie Philosophy
          </p>
          <h2
            className="serif italic"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
              color: "#fff",
              maxWidth: 780,
              margin: "0 auto",
              lineHeight: 1.25,
            }}
          >
            "Every fragrance is an invisible garment. A silent testament of presence before a single word is spoken."
          </h2>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginTop: "2.5rem",
            }}
          >
            Extrait de Parfum · 30% Pure Essence Concentration
          </p>
        </section>

        {/* ── Footer ───────────────────────────────────── */}
        <footer style={{ background: "#fff", padding: "4rem 3rem 3rem", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <div
            style={{
              maxWidth: 1260,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "2rem",
            }}
          >
            <div>
              <span className="serif" style={{ fontSize: "1.3rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#111" }}>
                Maison Noir
              </span>
              <p style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(17,17,17,0.35)", marginTop: 4 }}>
                Paris · London · Milan · Dubai
              </p>
            </div>

            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <a href="#" data-cursor style={{ color: "#111", fontSize: "1.1rem" }}>
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" data-cursor style={{ color: "#111", fontSize: "1.1rem" }}>
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="#" data-cursor style={{ color: "#111", fontSize: "1.1rem" }}>
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </div>

            <div style={{ display: "flex", gap: "2rem" }}>
              {["Private Bespoke", "Complimentary Samples", "Boutiques", "Legal & Privacy"].map((l) => (
                <a
                  key={l}
                  href="#"
                  data-cursor
                  style={{
                    fontSize: 8.5,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "rgba(17,17,17,0.4)",
                    textDecoration: "none",
                  }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1260, margin: "2.5rem auto 0", textAlign: "center", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "1.5rem" }}>
            <span style={{ fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(17,17,17,0.3)" }}>
              © 2026 Maison Noir Haute Parfumerie · All Rights Reserved
            </span>
          </div>
        </footer>

        {/* ── Product Detail Modal ──────────────────────── */}
        <AnimatePresence>
          {selectedId && selected && (
            <ProductDetail
              product={selected}
              onClose={() => setSelectedId(null)}
              onAddToCart={addToCart}
            />
          )}
        </AnimatePresence>

        {/* ── Checkout / Bag Drawer ─────────────────────── */}
        <AnimatePresence>
          {bagOpen && (
            <CheckoutPanel
              cart={cart}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              onClearCart={handleClearCart}
              onClose={() => setBagOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Master Nose AI Consultation Modal ─────────── */}
        <AnimatePresence>
          {masterNoseOpen && (
            <MasterNoseModal
              onClose={() => setMasterNoseOpen(false)}
              onSelectProduct={(p) => {
                setMasterNoseOpen(false);
                setSelectedId(p.id);
              }}
              onAddToCart={addToCart}
              allProducts={products}
            />
          )}
        </AnimatePresence>

        {/* ── 3-in-1 Unified AI Atelier (Free Chat + Persona Quiz + ML Scent Lab) ─── */}
        <ChatbotWidget
          onSelectProduct={(p) => setSelectedId(p.id)}
          onAddToCart={addToCart}
          allProducts={products}
        />
      </main>
    </>
  );
}
