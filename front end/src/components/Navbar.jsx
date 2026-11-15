import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Collection", "About", "Ingredients", "Stores"];

const Navbar = ({ cartCount = 0, onBagClick, onEmailClick, deviceMode = "desktop" }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCompact = deviceMode === "phone";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div
      style={{
        position: deviceMode === "desktop" ? "fixed" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
      }}
    >
      {/* ── Utility / Announcement Bar ── */}
      <div
        className="utility-bar"
        style={{
          padding: "9px 12px",
          fontSize: isCompact ? 8 : 10,
          letterSpacing: isCompact ? "0.12em" : "0.2em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Complimentary shipping on orders over $200 &nbsp;·&nbsp; New Collection 2026
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
        <div
          className="mn-nav-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isCompact ? "0 1.1rem" : "0 clamp(1.2rem, 4vw, 3rem)",
            height: isCompact ? 58 : 68,
          }}
        >
          {/* Left Nav (Desktop/Tablet) or Hamburger (Phone) */}
          <nav
            className={isCompact ? "mn-hide-forced" : "mn-nav-links-left"}
            style={{ display: isCompact ? "none" : "flex", gap: "2rem", alignItems: "center" }}
          >
            {navLinks.slice(0, 2).map((link) => (
              <a key={link} href="#collection" className="nav-item" data-cursor>
                {link}
              </a>
            ))}
          </nav>

          <button
            className={isCompact ? "mn-mobile-menu-btn-forced" : "mn-mobile-menu-btn"}
            onClick={() => setMobileMenuOpen((v) => !v)}
            style={{
              display: isCompact ? "inline-flex" : undefined,
              background: "none",
              border: "none",
              fontSize: 14,
              color: "#111",
              padding: "4px 6px",
            }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* Center Logo */}
          <div style={{ textAlign: "center" }}>
            <span
              className="serif"
              style={{
                fontSize: isCompact ? "1.2rem" : "clamp(1.2rem, 2.2vw, 1.5rem)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#111",
              }}
            >
              Maison Noir
            </span>
          </div>

          {/* Right Nav */}
          <div style={{ display: "flex", gap: isCompact ? "0.75rem" : "2rem", alignItems: "center" }}>
            <div
              className={isCompact ? "mn-hide-forced" : "mn-nav-links-right"}
              style={{ display: isCompact ? "none" : "flex", gap: "2rem", alignItems: "center" }}
            >
              {navLinks.slice(2).map((link) => (
                <a key={link} href="#collection" className="nav-item" data-cursor>
                  {link}
                </a>
              ))}
              {onEmailClick && (
                <button
                  type="button"
                  data-cursor
                  onClick={onEmailClick}
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    background: "#111",
                    color: "#d4af37",
                    border: "none",
                    padding: "6px 11px",
                    cursor: "pointer",
                  }}
                >
                  ✦ Gmail Concierge
                </button>
              )}
              <div style={{ width: 1, height: 14, background: "rgba(0,0,0,0.15)" }} />
            </div>

            <button
              data-cursor
              onClick={onBagClick}
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: cartCount > 0 ? "#111" : "rgba(17,17,17,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "color 0.3s",
              }}
            >
              Bag
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      background: "#111",
                      color: "#fff",
                      fontSize: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                background: "#fff",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                padding: "0.75rem 1.5rem 1.1rem",
                gap: "0.85rem",
              }}
            >
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="#collection"
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-item"
                  style={{ width: "fit-content" }}
                >
                  {link}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
};

export default Navbar;
