import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";
import CheckoutPanel from "./components/CheckoutPanel";
import CustomCursor from "./components/CustomCursor";

const products = [
  {
    id: 1, name: "BACCARAT ROUGE 540", price: "$325",
    tagline: "Luminous and sophisticated signature.",
    top: "Jasmine", heart: "Saffron", base: "Cedarwood",
    category: "Amber Floral", sizes: ["35ML", "70ML", "200ML"], image: "/bottle1.png",
  },
  {
    id: 2, name: "OUD WOOD", price: "$295",
    tagline: "Rare. Exotic. Distinctive.",
    top: "Rose Wood", heart: "Oud", base: "Sandalwood",
    category: "Woody", sizes: ["50ML", "100ML", "250ML"], image: "/bottle2.png",
  },
  {
    id: 3, name: "AVENTUS", price: "$495",
    tagline: "Power, success, and heritage.",
    top: "Pineapple", heart: "Birch", base: "Oakmoss",
    category: "Fruity Chypre", sizes: ["50ML", "100ML"], image: "/bottle3.png",
  },
  {
    id: 4, name: "LIBRE INTENSE", price: "$165",
    tagline: "The fragrance of freedom.",
    top: "Lavender", heart: "Orange Blossom", base: "Vanilla",
    category: "Floral Fougère", sizes: ["30ML", "50ML", "90ML"], image: "/bottle4.png",
  },
  {
    id: 5, name: "SANTAL 33", price: "$320",
    tagline: "An intoxicating myth.",
    top: "Violet Accord", heart: "Iris", base: "Sandalwood",
    category: "Woody", sizes: ["50ML", "100ML"], image: "/bottle1.png",
  },
  {
    id: 6, name: "BLACK ORCHID", price: "$150",
    tagline: "Luxurious and sensual.",
    top: "Black Truffle", heart: "Black Orchid", base: "Patchouli",
    category: "Oriental Floral", sizes: ["30ML", "50ML", "100ML"], image: "/bottle2.png",
  },
  {
    id: 7, name: "PORTRAIT OF A LADY", price: "$395",
    tagline: "Elegance personified.",
    top: "Rose", heart: "Blackcurrant", base: "Patchouli",
    category: "Oriental Rose", sizes: ["50ML", "100ML"], image: "/bottle3.png",
  },
  {
    id: 8, name: "DELINA", price: "$355",
    tagline: "A floral bouquet of Turkish rose.",
    top: "Rhubarb", heart: "Turkish Rose", base: "Vanilla",
    category: "Floral", sizes: ["75ML"], image: "/bottle4.png",
  },
  {
    id: 9, name: "GYPSY WATER", price: "$225",
    tagline: "An ode to Romany life.",
    top: "Bergamot", heart: "Pine Needles", base: "Sandalwood",
    category: "Woody Aromatic", sizes: ["50ML", "100ML"], image: "/bottle1.png",
  },
  {
    id: 10, name: "SAUVAGE ELIXIR", price: "$180",
    tagline: "A highly concentrated interpretation.",
    top: "Grapefruit", heart: "Lavender", base: "Rich Woods",
    category: "Aromatic Spicy", sizes: ["60ML", "100ML"], image: "/bottle2.png",
  },
  {
    id: 11, name: "GRAND SOIR", price: "$235",
    tagline: "The splendor of a Parisian night.",
    top: "Spanish Labdanum", heart: "Benzoin", base: "Vanilla",
    category: "Amber", sizes: ["35ML", "70ML", "200ML"], image: "/bottle3.png",
  },
  {
    id: 12, name: "HALFETI", price: "$260",
    tagline: "Dark, mysterious, and captivating.",
    top: "Grapefruit", heart: "Black Rose", base: "Oud",
    category: "Woody Floral", sizes: ["100ML"], image: "/bottle4.png",
  },
  {
    id: 13, name: "BLEU DE CHANEL", price: "$165",
    tagline: "A tribute to masculine freedom.",
    top: "Lemon", heart: "Ginger", base: "Cedar",
    category: "Woody Aromatic", sizes: ["50ML", "100ML", "150ML"], image: "/bottle1.png",
  },
  {
    id: 14, name: "TOBACCO VANILLE", price: "$295",
    tagline: "Opulent. Warm. Iconic.",
    top: "Tobacco Leaf", heart: "Tonka Bean", base: "Vanilla",
    category: "Oriental Spicy", sizes: ["50ML", "100ML", "250ML"], image: "/bottle2.png",
  },
  {
    id: 15, name: "INTENSE CAFE", price: "$170",
    tagline: "Addictive floral coffee.",
    top: "Floral Notes", heart: "Rose & Coffee", base: "Amber/Vanilla",
    category: "Gourmand", sizes: ["50ML", "100ML"], image: "/bottle3.png",
  },
  {
    id: 16, name: "ROUGE MALACHITE", price: "$340",
    tagline: "An imaginary red bloom.",
    top: "Tuberose", heart: "Orange Blossom", base: "Amber",
    category: "Floral Oriental", sizes: ["50ML", "100ML"], image: "/bottle4.png",
  }
];

const categories = [
  { label: "Amber Floral", img: "/bottle1.png" },
  { label: "Woody", img: "/bottle2.png" },
  { label: "Fruity Chypre", img: "/bottle3.png" },
  { label: "Oriental", img: "/bottle4.png" },
];

const marqueeText = ["Baccarat Rouge 540", "·", "Oud Wood", "·", "Aventus", "·", "Delina", "·",
  "Santal 33", "·", "Portrait of a Lady", "·", "Sauvage Elixir", "·", "Grand Soir", "·"];

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const selected = products.find(p => p.id === selectedId);

  const addToCart = (product, size) => {
    setCart(prev => [...prev, { ...product, size, cartId: `${product.id}-${size}-${Date.now()}` }]);
    toast.custom(() => (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "13px 20px", background: "#111", color: "#fff",
          fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
          fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)" }}>✓</span>
        {product.name} · {size} added
      </motion.div>
    ), { duration: 2500 });
  };

  return (
    <>
      <CustomCursor />
      <Toaster position="bottom-center" toastOptions={{ style: { background: "transparent", boxShadow: "none", padding: 0 } }} />

      <main style={{ minHeight: "100vh", background: "#fff" }}>
        <Navbar cartCount={cart.length} onBagClick={() => setBagOpen(true)} />

        {/* ── Hero — Full editorial, Mazaya-style ─────── */}
        <section style={{
          height: "100vh", background: "#f5f5f3",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 2rem",
          paddingTop: 100, /* offset for triple navbar */
          position: "relative", overflow: "hidden",
        }}>
          {/* Large decorative background text */}
          <div style={{
            position: "absolute", fontSize: "clamp(8rem, 22vw, 18rem)",
            fontFamily: "Cormorant Garamond, serif", fontStyle: "italic",
            color: "rgba(0,0,0,0.03)", lineHeight: 1, letterSpacing: "-0.02em",
            userSelect: "none", pointerEvents: "none", top: "50%",
            transform: "translateY(-50%)", whiteSpace: "nowrap",
          }}>
            Presence
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(17,17,17,0.4)", marginBottom: "1.5rem" }}
          >
            Maison Noir — Collection 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="serif italic"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8.5rem)", lineHeight: 0.92, letterSpacing: "-0.02em", color: "#111", marginBottom: "2rem" }}
          >
            Essence<br />of Presence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
            style={{ fontSize: 12, color: "rgba(17,17,17,0.45)", maxWidth: 380, lineHeight: 1.8, fontWeight: 200 }}
          >
            Four exceptional fragrances, each a portrait of a different hour of the night.
          </motion.p>

          <motion.a
            href="#collection" data-cursor
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            style={{
              marginTop: "3rem", display: "inline-flex", alignItems: "center", gap: 12,
              fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#111",
              textDecoration: "none", borderBottom: "1px solid rgba(17,17,17,0.3)",
              paddingBottom: 4,
            }}
          >
            Explore the Collection
          </motion.a>
        </section>

        {/* ── Marquee Band ─────────────────────────────── */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "14px 0", overflow: "hidden" }}>
          <div className="marquee-track">
            {marqueeText.map((w, i) => (
              <span key={i} className="serif italic"
                style={{ fontSize: "1.4rem", color: i % 2 === 1 ? "rgba(17,17,17,0.25)" : "#111", padding: "0 2rem", whiteSpace: "nowrap" }}>
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* ── Shop by Category ─────────────────────────── */}
        <section style={{ padding: "5rem 3rem", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(17,17,17,0.35)", marginBottom: "0.75rem" }}>Explore</p>
          <h2 className="serif italic" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#111", marginBottom: "3rem" }}>
            Shop by Family
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <div key={cat.label} data-cursor style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "none" }}>
                <div className="cat-circle">
                  <img src={cat.img} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                </div>
                <span style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#111" }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Collection Grid ───────────────────────────── */}
        <section id="collection" style={{ padding: "2rem 3rem 8rem", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem", borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: "1.5rem" }}>
            <h2 className="serif italic" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#111" }}>
              The Collection
            </h2>
            <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(17,17,17,0.4)" }}>
              {products.length} Fragrances
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem 2rem" }}>
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                style={{ flex: "1 1 calc(25% - 1.5rem)", minWidth: 200 }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} onSelect={(item) => setSelectedId(item.id)} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Brand Statement Strip ─────────────────────── */}
        <section style={{ background: "#111", padding: "5rem 3rem", textAlign: "center" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>
            Our Commitment
          </p>
          <h2 className="serif italic" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "#fff", maxWidth: 700, margin: "0 auto", lineHeight: 1.2 }}>
            "Every fragrance is an architecture. Every note, a structural decision."
          </h2>
        </section>

        {/* ── Footer ───────────────────────────────────── */}
        <footer style={{ background: "#fff", padding: "3rem", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="serif" style={{ fontSize: "1rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#111" }}>
              Maison Noir
            </span>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <a href="#" data-cursor style={{ color: "#111", fontSize: "1.2rem", transition: "color 0.3s" }}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" data-cursor style={{ color: "#111", fontSize: "1.2rem", transition: "color 0.3s" }}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" data-cursor style={{ color: "#111", fontSize: "1.2rem", transition: "color 0.3s" }}><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
            <div style={{ display: "flex", gap: "2rem" }}>
              {["Privacy", "Terms", "Stockists"].map(l => (
                <a key={l} href="#" data-cursor style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(17,17,17,0.3)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ maxWidth: 1200, margin: "2rem auto 0", textAlign: "center" }}>
             <span style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(17,17,17,0.25)" }}>
              Paris · 2026
            </span>
          </div>
        </footer>

        {/* ── Modals ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedId && selected && (
            <ProductDetail product={selected} onClose={() => setSelectedId(null)} onAddToCart={addToCart} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {bagOpen && (
            <CheckoutPanel cart={cart} onRemove={(id) => setCart(prev => prev.filter(i => i.cartId !== id))}
              onClose={() => setBagOpen(false)} onClearCart={() => setCart([])} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
