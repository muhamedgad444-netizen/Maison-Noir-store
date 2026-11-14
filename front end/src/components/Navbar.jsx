import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Collection", "About", "Ingredients", "Stores"];

const Navbar = ({ cartCount = 0, onBagClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40 }}>
      {/* ── Utility / Announcement Bar ── */}
      <div className="utility-bar">
        Complimentary shipping on orders over $200 &nbsp;·&nbsp; New Collection 2026 Now Available
      </div>

      {/* ── Main Nav ── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          transition: "all 0.5s ease",
        }}
      >
        {/* Brand row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 3rem", height: 68,
        }}>
          {/* Left Nav */}
          <nav style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
            {navLinks.slice(0, 2).map(link => (
              <a key={link} href="#collection" className="nav-item" data-cursor>{link}</a>
            ))}
          </nav>

          {/* Center Logo */}
          <div style={{ textAlign: "center" }}>
            <span className="serif" style={{ fontSize: "1.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#111" }}>
              Maison Noir
            </span>
          </div>

          {/* Right Nav */}
          <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
            {navLinks.slice(2).map(link => (
              <a key={link} href="#collection" className="nav-item" data-cursor>{link}</a>
            ))}
            <div style={{ width: 1, height: 14, background: "rgba(0,0,0,0.15)" }} />
            <button data-cursor onClick={onBagClick}
              style={{
                fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                background: "none", border: "none", cursor: "pointer",
                color: cartCount > 0 ? "#111" : "rgba(17,17,17,0.4)",
                display: "flex", alignItems: "center", gap: 7, transition: "color 0.3s",
              }}
            >
              Bag
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{
                      width: 17, height: 17, borderRadius: "50%",
                      background: "#111", color: "#fff",
                      fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>
    </div>
  );
};

export default Navbar;
