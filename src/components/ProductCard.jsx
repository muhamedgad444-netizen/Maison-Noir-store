import { motion } from "framer-motion";

const ProductCard = ({ product, onSelect }) => {
  return (
    <div
      className="product-card-wrap"
      onClick={() => onSelect(product)}
      data-cursor
      style={{ position: "relative", cursor: "none" }}
    >
      {/* Image container */}
      <motion.div
        layoutId={`card-${product.id}`}
        style={{
          position: "relative",
          background: "#f5f5f3",
          overflow: "hidden",
          aspectRatio: "3/4",
        }}
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        <motion.div
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem" }}
          variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.img
            layoutId={`img-${product.id}`}
            src={product.image}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.1))" }}
          />
        </motion.div>

        {/* Category badge top left */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase",
          background: "#fff", color: "#111", padding: "4px 10px",
        }}>
          {product.category}
        </div>
      </motion.div>

      {/* Bottom line animation */}
      <div className="product-card-line" />

      {/* Info below image — Mazaya style */}
      <div style={{ paddingTop: "1rem" }}>
        <motion.h3
          layoutId={`title-${product.id}`}
          className="serif italic"
          style={{ fontSize: "1.15rem", color: "#111", marginBottom: 4, letterSpacing: "0.02em" }}
        >
          {product.name}
        </motion.h3>
        <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(17,17,17,0.4)", marginBottom: 6 }}>
          {product.tagline}
        </p>
        <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1rem", color: "#111" }}>
          {product.price}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
