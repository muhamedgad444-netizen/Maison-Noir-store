import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.15 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const row = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)"
};

export const getPriceForSize = (basePrice, sizeStr) => {
  if (!sizeStr) return basePrice;
  const ml = parseInt(sizeStr.replace("ML", ""), 10);
  if (isNaN(ml)) return basePrice;

  if (ml <= 40) return Math.round(basePrice * 0.78);
  if (ml <= 75) return basePrice;
  if (ml <= 100) return Math.round(basePrice * 1.38);
  if (ml <= 150) return Math.round(basePrice * 1.72);
  return Math.round(basePrice * 2.15);
};

const ProductDetail = ({ product, onClose, onAddToCart }) => {
  const [size, setSize] = useState(product.sizes?.[0] || "50ML");
  const [added, setAdded] = useState(false);

  const currentPriceNumber = getPriceForSize(product.basePrice || 165, size);
  const currentPriceFormatted = `$${currentPriceNumber}`;

  const handleAdd = () => {
    onAddToCart({
      ...product,
      calculatedPrice: currentPriceFormatted,
      calculatedPriceNumber: currentPriceNumber,
    }, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isWinter = product.seasonType === "winter";

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
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
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Modal Dialog */}
      <motion.div
        layoutId={`card-${product.id}`}
        className="detail-modal-dialog"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1040,
          maxHeight: "92vh",
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          boxShadow: "0 35px 90px rgba(0,0,0,0.25)",
        }}
      >
        {/* Left — Image Gallery Column */}
        <div
          className="detail-modal-image-col"
          style={{
            width: "44%",
            flexShrink: 0,
            background: "#f7f7f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2rem",
            position: "relative",
            borderRight: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Season pill */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 8,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                background: isWinter ? "#111" : "#fff",
                color: isWinter ? "#fff" : "#111",
                border: isWinter ? "1px solid #111" : "1px solid rgba(0,0,0,0.1)",
                padding: "5px 10px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {product.season}
            </span>
            <span
              style={{
                fontSize: 8,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.85)",
                color: "rgba(17,17,17,0.7)",
                padding: "3px 8px",
              }}
            >
              {product.gender}
            </span>
          </div>

          <motion.img
            layoutId={`img-${product.id}`}
            src={product.image}
            alt={product.name}
            style={{
              width: "82%",
              maxHeight: "58vh",
              objectFit: "contain",
              filter: "drop-shadow(0 24px 45px rgba(0,0,0,0.16))",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 24,
              textAlign: "center",
              width: "100%",
              padding: "0 2rem",
            }}
          >
            <p
              style={{
                fontSize: 8.5,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(17,17,17,0.4)",
              }}
            >
              {product.concentration} · {product.origin}
            </p>
          </div>
        </div>

        {/* Right — Scent Olfactory Definition & Details */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{
            flex: 1,
            padding: "2.75rem 3rem",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Top Bar: Inspiration & Close */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <span
              style={{
                fontSize: 8.5,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#111",
                borderLeft: "2px solid #111",
                paddingLeft: 8,
              }}
            >
              {product.inspiration}
            </span>

            <motion.button
              variants={fadeUp}
              data-cursor
              onClick={onClose}
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(17,17,17,0.4)",
                background: "none",
                border: "none",
                cursor: "none",
                padding: "4px 8px",
              }}
            >
              Close ×
            </motion.button>
          </div>

          {/* Title & Tagline */}
          <motion.h2
            variants={fadeUp}
            layoutId={`title-${product.id}`}
            className="serif italic"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              lineHeight: 1.05,
              color: "#111",
              marginBottom: "0.3rem",
            }}
          >
            {product.name}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(17,17,17,0.45)",
              marginBottom: "1.2rem",
            }}
          >
            {product.subName} · {product.category}
          </motion.p>

          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 12.5,
              fontFamily: "Cormorant Garamond, serif",
              fontStyle: "italic",
              color: "#111",
              lineHeight: 1.5,
              marginBottom: "1.25rem",
              borderLeft: "1px solid rgba(0,0,0,0.15)",
              paddingLeft: "1rem",
            }}
          >
            "{product.tagline}"
          </motion.p>

          {/* Scent Olfactory Narrative Definition */}
          <motion.div variants={fadeUp} style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                fontSize: 8,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(17,17,17,0.35)",
                marginBottom: 6,
              }}
            >
              The Olfactory Architecture
            </p>
            <p
              style={{
                fontSize: 11.5,
                color: "rgba(17,17,17,0.68)",
                lineHeight: 1.75,
                fontWeight: 300,
              }}
            >
              {product.description}
            </p>
          </motion.div>

          {/* Note Pyramid */}
          <motion.div
            variants={fadeUp}
            style={{
              background: "#fafaf8",
              padding: "1.2rem",
              border: "1px solid rgba(0,0,0,0.05)",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: 8,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(17,17,17,0.4)",
                marginBottom: 10,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                paddingBottom: 4,
              }}
            >
              Olfactory Pyramid
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", width: 45, flexShrink: 0 }}>
                  Top
                </span>
                <span style={{ fontSize: 10.5, color: "rgba(17,17,17,0.75)" }}>{product.top}</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", width: 45, flexShrink: 0 }}>
                  Heart
                </span>
                <span style={{ fontSize: 10.5, color: "rgba(17,17,17,0.75)" }}>{product.heart}</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", width: 45, flexShrink: 0 }}>
                  Base
                </span>
                <span style={{ fontSize: 10.5, color: "rgba(17,17,17,0.75)" }}>{product.base}</span>
              </div>
            </div>
          </motion.div>

          {/* Technical Specs */}
          <motion.div variants={fadeUp} style={{ marginBottom: "1.5rem" }}>
            {[
              ["Longevity", product.longevity],
              ["Sillage & Trail", product.sillage],
              ["Season Suitability", product.season],
              ["Concentration", product.concentration],
            ].map(([k, v]) => (
              <div key={k} style={row}>
                <span style={{ fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(17,17,17,0.35)" }}>
                  {k}
                </span>
                <span style={{ fontSize: 10.5, color: "#111", fontWeight: 400 }}>{v}</span>
              </div>
            ))}
          </motion.div>

          {/* Size Selection */}
          <motion.div variants={fadeUp} style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            <p
              style={{
                fontSize: 8,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(17,17,17,0.35)",
                marginBottom: "0.6rem",
              }}
            >
              Select Flacon Size
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.sizes?.map((s) => {
                const sPrice = getPriceForSize(product.basePrice || 165, s);
                const isSelected = size === s;
                return (
                  <button
                    key={s}
                    data-cursor
                    onClick={() => setSize(s)}
                    style={{
                      padding: "8px 14px",
                      fontSize: 9,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      border: `1px solid ${isSelected ? "#111" : "rgba(0,0,0,0.12)"}`,
                      background: isSelected ? "#111" : "#fff",
                      color: isSelected ? "#fff" : "rgba(17,17,17,0.6)",
                      cursor: "none",
                      transition: "all 0.25s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{s}</span>
                    <span style={{ opacity: 0.6, fontSize: 8 }}>${sPrice}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom Bar: Calculated Price & Add to Bag */}
          <motion.div
            variants={fadeUp}
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div>
              <p style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(17,17,17,0.35)", marginBottom: 2 }}>
                Price ({size})
              </p>
              <span className="serif italic" style={{ fontSize: "1.9rem", color: "#111", lineHeight: 1 }}>
                {currentPriceFormatted}
              </span>
            </div>

            <motion.button
              data-cursor
              onClick={handleAdd}
              whileTap={{ scale: 0.98 }}
              animate={{ background: added ? "#2e7d32" : "#111" }}
              style={{
                padding: "14px 32px",
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#fff",
                border: "none",
                cursor: "none",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.3s ease",
              }}
            >
              {added ? "Added to Bag ✓" : `Add to Bag · ${size}`}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetail;
