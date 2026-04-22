import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
};

const row = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.06)"
};

const ProductDetail = ({ product, onClose, onAddToCart }) => {
  const [size, setSize] = useState(product.sizes?.[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}
      />

      <motion.div
        layoutId={`card-${product.id}`}
        style={{
          position: "relative", width: "100%", maxWidth: 960,
          height: "90vh", background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          display: "flex", overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
        }}
      >
        {/* Left — Image */}
        <div style={{
          width: "48%", flexShrink: 0,
          background: "#f5f5f3",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "2rem 1.5rem", alignSelf: "stretch",
        }}>
          <motion.img
            layoutId={`img-${product.id}`}
            src={product.image} alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))" }}
          />
        </div>

        {/* Right — Info */}
        <motion.div
          variants={stagger} initial="hidden" animate="visible" exit="hidden"
          style={{ flex: 1, padding: "2.5rem 2.5rem", display: "flex", flexDirection: "column", overflowY: "auto" }}
        >
          <motion.button variants={fadeUp} data-cursor onClick={onClose}
            style={{ alignSelf: "flex-end", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(17,17,17,0.3)", background: "none", border: "none", cursor: "none", marginBottom: "2rem" }}>
            Close ×
          </motion.button>

          <motion.p variants={fadeUp} style={{ fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(17,17,17,0.3)", marginBottom: "0.6rem" }}>
            {product.category}
          </motion.p>

          <motion.h2 variants={fadeUp} layoutId={`title-${product.id}`} className="serif italic"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1, color: "#111", marginBottom: "0.5rem" }}>
            {product.name}
          </motion.h2>

          <motion.p variants={fadeUp} style={{ fontSize: 11, color: "rgba(17,17,17,0.4)", fontStyle: "italic", marginBottom: "2rem" }}>
            {product.tagline}
          </motion.p>

          <motion.div variants={fadeUp}>
            {[["Top", product.top],["Heart", product.heart],["Base", product.base],["Longevity", "10–14 hours"],["Origin", "Paris, France"],["Concentration", "Extrait de Parfum"]].map(([k,v]) => (
              <div key={k} style={row}>
                <span style={{ fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(17,17,17,0.3)" }}>{k}</span>
                <span style={{ fontSize: 11, color: "#111" }}>{v}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ marginTop: "1.75rem" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(17,17,17,0.3)", marginBottom: "0.75rem" }}>Select Size</p>
            <div style={{ display: "flex", gap: 8 }}>
              {product.sizes?.map(s => (
                <button key={s} data-cursor onClick={() => setSize(s)}
                  style={{
                    padding: "9px 16px", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                    border: `1px solid ${size === s ? "#111" : "rgba(0,0,0,0.1)"}`,
                    background: size === s ? "#111" : "none",
                    color: size === s ? "#fff" : "rgba(17,17,17,0.4)",
                    cursor: "none", transition: "all 0.3s",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
            <span className="serif italic" style={{ fontSize: "1.7rem", color: "#111", marginRight: "auto" }}>{product.price}</span>
            <motion.button data-cursor onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              animate={{ background: added ? "#444" : "#111" }}
              style={{ padding: "14px 28px", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#fff", border: "none", cursor: "none" }}>
              {added ? "Added ✓" : "Add to Bag"}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetail;
