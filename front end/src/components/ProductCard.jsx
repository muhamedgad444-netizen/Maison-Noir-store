import { useState } from "react";
import { motion } from "framer-motion";
import { getPriceForSize } from "./ProductDetail";

const ProductCard = ({ product, onSelect, onQuickAdd }) => {
  const isWinter = product.seasonType === "winter";
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "50ML");

  const activePrice = `$${getPriceForSize(product.basePrice || 165, selectedSize)}`;

  return (
    <div
      className="product-card-wrap group"
      onClick={() => onSelect(product)}
      data-cursor
      style={{
        position: "relative",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        padding: "0.65rem",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Uniform Fixed-Height Image Container */}
      <motion.div
        layoutId={`card-${product.id}`}
        style={{
          position: "relative",
          background: "#f7f7f5",
          overflow: "hidden",
          height: 270,
          width: "100%",
          border: "1px solid rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        <motion.div
          style={{
            width: "74%",
            height: "74%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "0.75rem",
          }}
          variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.img
            layoutId={`img-${product.id}`}
            src={product.image}
            alt={product.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              mixBlendMode: "multiply",
              filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.11))",
            }}
          />
        </motion.div>

        {/* Season Badge top-left */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 7,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: isWinter ? "#111" : "#fff",
              color: isWinter ? "#fff" : "#111",
              border: isWinter ? "1px solid #111" : "1px solid rgba(0,0,0,0.1)",
              padding: "3px 7px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            }}
          >
            {product.season}
          </span>
          <span
            style={{
              fontSize: 6.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              color: "rgba(17,17,17,0.7)",
              padding: "2px 6px",
            }}
          >
            {product.gender}
          </span>
        </div>

        {/* Category top-right */}
        <div
          style={{
            position: "absolute",
            top: 11,
            right: 10,
            fontSize: 7,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(17,17,17,0.45)",
          }}
        >
          {product.category.split(" ")[0]}
        </div>

        {/* Quick Add Overlay on hover */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px",
            background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))",
            display: "flex",
            justifyContent: "center",
            opacity: 0,
            transform: "translateY(10px)",
            transition: "all 0.3s ease",
          }}
          className="quick-add-bar"
        >
          <button
            data-cursor
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(product, selectedSize);
            }}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "#111",
              color: "#fff",
              fontSize: 7.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            + Quick Add · {selectedSize} ({activePrice})
          </button>
        </div>
      </motion.div>

      {/* Hover bottom line */}
      <div className="product-card-line" />

      {/* Info below image */}
      <div
        style={{
          padding: "0.85rem 0.35rem 0.3rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <p
          style={{
            fontSize: 7.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(17,17,17,0.42)",
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.inspiration}
        </p>

        <motion.h3
          layoutId={`title-${product.id}`}
          className="serif italic"
          style={{
            fontSize: "1.18rem",
            color: "#111",
            marginBottom: 3,
            letterSpacing: "0.02em",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.name}
        </motion.h3>

        <p
          style={{
            fontSize: 8.5,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "rgba(17,17,17,0.46)",
            marginBottom: 10,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.tagline}
        </p>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontStyle: "italic",
              fontSize: "1.2rem",
              color: "#111",
              fontWeight: 400,
            }}
          >
            {activePrice}
          </span>

          {/* Interactive Size Pills */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {product.sizes?.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  style={{
                    fontSize: 7.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "3px 6px",
                    border: isSelected ? "1px solid #111" : "1px solid rgba(0,0,0,0.14)",
                    background: isSelected ? "#111" : "#fff",
                    color: isSelected ? "#fff" : "rgba(17,17,17,0.65)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
