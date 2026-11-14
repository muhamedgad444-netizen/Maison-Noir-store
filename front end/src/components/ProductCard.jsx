import { motion } from "framer-motion";

const ProductCard = ({ product, onSelect, onQuickAdd }) => {
  const isWinter = product.seasonType === "winter";

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
        border: "1px solid rgba(0,0,0,0.07)",
        padding: "0.55rem",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Image container */}
      <motion.div
        layoutId={`card-${product.id}`}
        style={{
          position: "relative",
          background: "#f7f7f5",
          overflow: "hidden",
          aspectRatio: "4/4.5",
          border: "1px solid rgba(0,0,0,0.03)",
        }}
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.75rem 1.25rem 1.5rem",
          }}
          variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.img
            layoutId={`img-${product.id}`}
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
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
              onQuickAdd(product);
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
            + Quick Add · {product.sizes?.[0]}
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
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontStyle: "italic",
              fontSize: "1.15rem",
              color: "#111",
            }}
          >
            {product.price}
          </span>
          <span
            style={{
              fontSize: 7.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(17,17,17,0.38)",
            }}
          >
            {product.sizes?.join(" · ")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
