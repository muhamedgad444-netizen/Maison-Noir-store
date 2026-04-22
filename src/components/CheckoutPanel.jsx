import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const inputStyle = {
  width: "100%", padding: "14px 0", fontSize: 12,
  background: "none", border: "none", borderBottom: "1px solid rgba(0,0,0,0.1)",
  color: "#1a1a1a", outline: "none", letterSpacing: "0.05em",
  fontFamily: "Inter, sans-serif", fontWeight: 200,
};
const labelStyle = {
  fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase",
  color: "rgba(26,26,26,0.35)", display: "block", marginBottom: 6, marginTop: 24
};
const btnPrimary = {
  width: "100%", padding: "16px", fontSize: 9,
  letterSpacing: "0.35em", textTransform: "uppercase",
  background: "#1a1a1a", color: "#f8f7f4", border: "none",
  cursor: "none", marginTop: 8,
};
const btnGhost = {
  width: "100%", padding: "15px", fontSize: 9,
  letterSpacing: "0.35em", textTransform: "uppercase",
  background: "none", color: "rgba(26,26,26,0.4)",
  border: "1px solid rgba(0,0,0,0.1)", cursor: "none", marginTop: 8,
};

const PHASES = ["Bag", "Account", "Checkout", "Done"];

const BagPhase = ({ cart, onRemove, onNext }) => (
  <motion.div key="bag"
    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    style={{ flex: 1, display: "flex", flexDirection: "column" }}
  >
    <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(26,26,26,0.3)", marginBottom: "2rem" }}>
      {cart.length} item{cart.length !== 1 ? "s" : ""}
    </p>

    <div style={{ flex: 1, overflowY: "auto" }}>
      <AnimatePresence>
        {cart.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: "4rem" }}>
            <p style={{ fontSize: 12, color: "rgba(26,26,26,0.2)", fontStyle: "italic", fontFamily: "Cormorant Garamond, serif" }}>
              Your bag is empty.
            </p>
          </motion.div>
        )}
        {cart.map((item, i) => (
          <motion.div key={item.cartId}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            style={{ display: "flex", gap: "1.25rem", paddingBottom: "1.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.05)" }}
          >
            <div style={{ width: 70, height: 90, background: "#edecea", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(26,26,26,0.3)", marginBottom: 4 }}>{item.category}</p>
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.05rem", color: "#1a1a1a", marginBottom: 4 }}>{item.name}</p>
                <p style={{ fontSize: 10, color: "rgba(26,26,26,0.35)" }}>{item.size}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.1rem", color: "#1a1a1a" }}>{item.price}</span>
                <button data-cursor onClick={() => onRemove(item.cartId)}
                  style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(26,26,26,0.25)", background: "none", border: "none", cursor: "none" }}>
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

    {cart.length > 0 && (
      <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(26,26,26,0.35)" }}>Total</span>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.3rem", color: "#1a1a1a" }}>
            ${cart.reduce((acc, item) => acc + parseInt(item.price.replace("$", "")), 0)}
          </span>
        </div>
        <motion.button data-cursor onClick={onNext} whileTap={{ scale: 0.98 }} style={btnPrimary}>
          Continue to Account
        </motion.button>
      </div>
    )}
  </motion.div>
);

const AuthPhase = ({ onNext }) => {
  const [mode, setMode] = useState("signin");
  const [focused, setFocused] = useState(null);
  const fi = (field) => ({
    ...inputStyle,
    borderBottom: `1px solid ${focused === field ? "rgba(26,26,26,0.6)" : "rgba(0,0,0,0.1)"}`,
    transition: "border-color 0.3s",
  });

  return (
    <motion.div key="auth"
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem" }}>
        {["signin", "create"].map(m => (
          <button key={m} data-cursor onClick={() => setMode(m)}
            style={{
              fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase",
              background: "none", border: "none", cursor: "none",
              color: mode === m ? "#1a1a1a" : "rgba(26,26,26,0.3)",
              paddingBottom: 6,
              borderBottom: `1px solid ${mode === m ? "rgba(26,26,26,0.5)" : "transparent"}`,
              transition: "all 0.3s",
            }}>
            {m === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }} style={{ flex: 1 }}
        >
          {mode === "create" && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={fi("name")} placeholder="Your name" onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={fi("email")} placeholder="you@example.com" onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" style={fi("pass")} placeholder="••••••••" onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ marginTop: "auto" }}>
        <motion.button data-cursor onClick={onNext} whileTap={{ scale: 0.98 }} style={btnPrimary}>
          {mode === "signin" ? "Sign In & Continue" : "Create Account & Continue"}
        </motion.button>
        <motion.button data-cursor onClick={onNext} whileTap={{ scale: 0.98 }} style={btnGhost}>
          Continue as Guest
        </motion.button>
      </div>
    </motion.div>
  );
};

const CheckoutPhase = ({ cart, onNext }) => {
  const total = cart.reduce((acc, item) => acc + parseInt(item.price.replace("$", "")), 0);
  const [focused, setFocused] = useState(null);
  const fi = (field) => ({
    ...inputStyle,
    borderBottom: `1px solid ${focused === field ? "rgba(26,26,26,0.6)" : "rgba(0,0,0,0.1)"}`,
    transition: "border-color 0.3s",
  });

  const fields = [
    { section: "Shipping", items: [
      { key: "addr", label: "Street Address", placeholder: "123 Rue de Rivoli" },
      { key: "city", label: "City", placeholder: "Paris" },
      { key: "zip", label: "Postal Code", placeholder: "75001" },
      { key: "country", label: "Country", placeholder: "France" },
    ]},
    { section: "Payment", items: [
      { key: "card", label: "Card Number", placeholder: "•••• •••• •••• ••••" },
      { key: "exp", label: "Expiry", placeholder: "MM / YY" },
      { key: "cvv", label: "CVV", placeholder: "•••" },
    ]},
  ];

  return (
    <motion.div key="checkout"
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "1rem" }}>
        {fields.map(({ section, items }) => (
          <div key={section}>
            <p style={{ fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(26,26,26,0.25)", marginTop: "1.5rem", marginBottom: "0.25rem" }}>
              {section}
            </p>
            {items.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input style={fi(key)} placeholder={placeholder} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(26,26,26,0.35)" }}>Order Total</span>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.3rem", color: "#1a1a1a" }}>
            ${total + 20} <span style={{ fontSize: 9, color: "rgba(26,26,26,0.35)" }}>incl. shipping</span>
          </span>
        </div>
        <motion.button data-cursor onClick={onNext} whileTap={{ scale: 0.98 }} style={btnPrimary}>
          Place Order
        </motion.button>
      </div>
    </motion.div>
  );
};

const ConfirmPhase = ({ onClose }) => (
  <motion.div key="confirm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
  >
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: "2rem" }}>
      <motion.circle cx="32" cy="32" r="30" stroke="rgba(26,26,26,0.1)" strokeWidth="1" />
      <motion.circle cx="32" cy="32" r="30"
        stroke="#1a1a1a" strokeWidth="1"
        strokeDasharray={`${2 * Math.PI * 30}`}
        initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <motion.path d="M20 33l9 9 15-16"
        stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
      />
    </svg>

    <motion.p
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.7 }}
      style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "2rem", color: "#1a1a1a", marginBottom: "0.75rem" }}
    >
      Order Placed.
    </motion.p>

    <motion.p
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.7, duration: 0.7 }}
      style={{ fontSize: 11, color: "rgba(26,26,26,0.4)", lineHeight: 1.8, maxWidth: 240 }}
    >
      Your fragrance will arrive within 3–5 working days. A confirmation has been sent to your inbox.
    </motion.p>

    <motion.button data-cursor onClick={onClose}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.7 }}
      style={{ ...btnGhost, width: "auto", padding: "12px 28px", marginTop: "2.5rem" }}
    >
      Back to Collection
    </motion.button>
  </motion.div>
);

const CheckoutPanel = ({ cart, onRemove, onClose, onClearCart }) => {
  const [phase, setPhase] = useState(0);

  const handleNext = () => setPhase(p => p + 1);
  const handleClose = () => {
    if (phase === 3) onClearCart();
    setPhase(0);
    onClose();
  };

  return (
    <motion.div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        onClick={handleClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }}
      />

      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", width: "100%", maxWidth: 460,
          height: "100%", background: "#f8f7f4",
          borderLeft: "1px solid rgba(0,0,0,0.07)",
          display: "flex", flexDirection: "column", padding: "2.5rem",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.3rem", color: "#1a1a1a" }}>
            {PHASES[phase]}
          </span>
          <button data-cursor onClick={handleClose}
            style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(26,26,26,0.3)", background: "none", border: "none", cursor: "none" }}>
            Close ×
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: "2.5rem" }}>
          {PHASES.map((_, i) => (
            <motion.div key={i}
              animate={{ background: i <= phase ? "#1a1a1a" : "rgba(26,26,26,0.1)", width: i === phase ? 24 : 6 }}
              transition={{ duration: 0.4 }}
              style={{ height: 2, borderRadius: 1 }}
            />
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            {phase === 0 && <BagPhase cart={cart} onRemove={onRemove} onNext={handleNext} />}
            {phase === 1 && <AuthPhase onNext={handleNext} />}
            {phase === 2 && <CheckoutPhase cart={cart} onNext={handleNext} />}
            {phase === 3 && <ConfirmPhase onClose={handleClose} />}
          </AnimatePresence>
        </div>

        {phase > 0 && phase < 3 && (
          <motion.button data-cursor
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setPhase(p => p - 1)}
            style={{ marginTop: "1rem", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(26,26,26,0.25)", background: "none", border: "none", cursor: "none", textAlign: "left" }}
          >
            ← Back
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CheckoutPanel;
