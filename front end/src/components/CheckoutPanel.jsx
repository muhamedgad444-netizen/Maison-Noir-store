import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const inputStyle = {
  width: "100%",
  padding: "12px 0",
  fontSize: 12,
  background: "none",
  border: "none",
  borderBottom: "1px solid rgba(0,0,0,0.12)",
  color: "#1a1a1a",
  outline: "none",
  letterSpacing: "0.04em",
  fontFamily: "Inter, sans-serif",
  fontWeight: 300,
};

const labelStyle = {
  fontSize: 8,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(26,26,26,0.45)",
  display: "block",
  marginBottom: 4,
  marginTop: 18,
};

const btnPrimary = {
  width: "100%",
  padding: "16px",
  fontSize: 9,
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  background: "#111",
  color: "#fff",
  border: "none",
  cursor: "none",
  marginTop: 10,
  fontFamily: "Inter, sans-serif",
  transition: "all 0.3s ease",
};

const btnGhost = {
  width: "100%",
  padding: "14px",
  fontSize: 9,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  background: "none",
  color: "rgba(26,26,26,0.5)",
  border: "1px solid rgba(0,0,0,0.12)",
  cursor: "none",
  marginTop: 8,
  fontFamily: "Inter, sans-serif",
};

const PHASES = ["Bag", "Contact", "Shipping & Payment", "Confirmed"];

// ── Phase 0: Bag ──────────────────────────────────────────────────────────
const BagPhase = ({
  cart,
  onUpdateQty,
  onRemove,
  onClearCart,
  promoCode,
  setPromoCode,
  appliedPromo,
  setAppliedPromo,
  promoError,
  setPromoError,
  onNext,
}) => {
  const [promoInput, setPromoInput] = useState("");

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const priceNum = item.calculatedPriceNumber || parseInt(item.price.replace("$", ""), 10);
      return acc + priceNum * (item.quantity || 1);
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") {
      return Math.round((subtotal * appliedPromo.value) / 100);
    }
    if (appliedPromo.type === "fixed") {
      return Math.min(subtotal, appliedPromo.value);
    }
    return 0;
  }, [subtotal, appliedPromo]);

  const freeShippingThreshold = 200;
  const isFreeShipping = subtotal >= freeShippingThreshold || appliedPromo?.freeShipping;
  const shippingFee = isFreeShipping ? 0 : 20;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "NOIR10") {
      setAppliedPromo({ code: "NOIR10", label: "10% Welcome Noir Privilege", type: "percent", value: 10 });
      setPromoError("");
    } else if (clean === "PARIS20") {
      setAppliedPromo({ code: "PARIS20", label: "$20 Maison Paris Gift", type: "fixed", value: 20 });
      setPromoError("");
    } else if (clean === "VIP") {
      setAppliedPromo({ code: "VIP", label: "15% VIP Access + Complimentary Courier", type: "percent", value: 15, freeShipping: true });
      setPromoError("");
    } else {
      setPromoError("Invalid code. Try NOIR10 or PARIS20");
    }
  };

  const shippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <motion.div
      key="bag"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
    >
      {/* Bag Count & Clear all */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <p style={{ fontSize: 8.5, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(26,26,26,0.4)" }}>
          {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} Flacon
          {cart.reduce((sum, item) => sum + (item.quantity || 1), 0) !== 1 ? "s" : ""} in Bag
        </p>
        {cart.length > 0 && (
          <button
            data-cursor
            onClick={onClearCart}
            style={{
              fontSize: 7.5,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(26,26,26,0.3)",
              background: "none",
              border: "none",
              cursor: "none",
              textDecoration: "underline",
            }}
          >
            Clear Bag
          </button>
        )}
      </div>

      {/* Free Shipping Progress bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.06)",
          padding: "10px 14px",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "#111" }}>
            {isFreeShipping ? "✓ Complimentary Shipping Unlocked" : `Add $${shippingRemaining} for Free Express Shipping`}
          </span>
          <span style={{ fontSize: 8, color: "rgba(17,17,17,0.4)" }}>${freeShippingThreshold} Goal</span>
        </div>
        <div style={{ width: "100%", height: 3, background: "#ecebe7", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${shippingProgress}%` }}
            transition={{ duration: 0.6 }}
            style={{ height: "100%", background: isFreeShipping ? "#2e7d32" : "#111" }}
          />
        </div>
      </div>

      {/* Item List */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
        <AnimatePresence>
          {cart.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: "5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.2 }}>✦</div>
              <p style={{ fontSize: 13, color: "rgba(26,26,26,0.3)", fontStyle: "italic", fontFamily: "Cormorant Garamond, serif" }}>
                Your private fragrance bag is empty.
              </p>
              <p style={{ fontSize: 8.5, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(26,26,26,0.3)", marginTop: 8 }}>
                Explore the Winter & Summer collections
              </p>
            </motion.div>
          )}

          {cart.map((item, i) => {
            const itemPriceNum = item.calculatedPriceNumber || parseInt(item.price.replace("$", ""), 10);
            const qty = item.quantity || 1;
            const lineTotal = itemPriceNum * qty;

            return (
              <motion.div
                key={item.cartId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                style={{
                  display: "flex",
                  gap: "1.1rem",
                  paddingBottom: "1.25rem",
                  marginBottom: "1.25rem",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {/* Flacon Packshot */}
                <div
                  style={{
                    width: 74,
                    height: 94,
                    background: "#f4f3f0",
                    border: "1px solid rgba(0,0,0,0.04)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                  }}
                >
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>

                {/* Details & Controls */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontSize: 7.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(26,26,26,0.35)" }}>
                        {item.inspiration || item.brand}
                      </p>
                      <button
                        data-cursor
                        onClick={() => onRemove(item.cartId)}
                        style={{
                          fontSize: 8,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(26,26,26,0.3)",
                          background: "none",
                          border: "none",
                          cursor: "none",
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <p
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontStyle: "italic",
                        fontSize: "1.1rem",
                        color: "#1a1a1a",
                        lineHeight: 1.1,
                        margin: "2px 0 4px",
                      }}
                    >
                      {item.name}
                    </p>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(26,26,26,0.5)" }}>
                        Size: {item.size}
                      </span>
                      <span style={{ fontSize: 8, color: "rgba(26,26,26,0.3)" }}>·</span>
                      <span style={{ fontSize: 9, color: "rgba(26,26,26,0.4)" }}>${itemPriceNum} each</span>
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "#fff",
                      }}
                    >
                      <button
                        data-cursor
                        onClick={() => onUpdateQty(item.cartId, qty - 1)}
                        style={{
                          width: 26,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "none",
                          cursor: "none",
                          fontSize: 12,
                          color: "#111",
                        }}
                      >
                        –
                      </button>
                      <span
                        style={{
                          width: 28,
                          textAlign: "center",
                          fontSize: 10,
                          fontWeight: 400,
                          color: "#111",
                        }}
                      >
                        {qty}
                      </span>
                      <button
                        data-cursor
                        onClick={() => onUpdateQty(item.cartId, qty + 1)}
                        style={{
                          width: 26,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "none",
                          cursor: "none",
                          fontSize: 12,
                          color: "#111",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <span
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontStyle: "italic",
                        fontSize: "1.15rem",
                        color: "#1a1a1a",
                      }}
                    >
                      ${lineTotal}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Breakdown & Checkout Action */}
      {cart.length > 0 && (
        <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "auto" }}>
          {/* Promo code input */}
          {!appliedPromo ? (
            <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  if (promoError) setPromoError("");
                }}
                placeholder="PROMO CODE (NOIR10, PARIS20)"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                data-cursor
                style={{
                  padding: "8px 14px",
                  fontSize: 8.5,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  cursor: "none",
                }}
              >
                Apply
              </button>
            </form>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f0efe9",
                padding: "6px 12px",
                marginBottom: 10,
              }}
            >
              <div>
                <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", fontWeight: 400 }}>
                  {appliedPromo.code}
                </span>
                <span style={{ fontSize: 7.5, color: "rgba(0,0,0,0.5)", marginLeft: 6 }}>({appliedPromo.label})</span>
              </div>
              <button
                data-cursor
                onClick={() => setAppliedPromo(null)}
                style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", background: "none", border: "none", cursor: "none" }}
              >
                Remove
              </button>
            </div>
          )}

          {promoError && (
            <p style={{ fontSize: 8, color: "#c62828", marginBottom: 8, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {promoError}
            </p>
          )}

          {/* Pricing summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 8.5, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(26,26,26,0.4)" }}>
                Subtotal
              </span>
              <span style={{ fontSize: 11, color: "#111" }}>${subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 8.5, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2e7d32" }}>
                  Discount ({appliedPromo.code})
                </span>
                <span style={{ fontSize: 11, color: "#2e7d32" }}>-${discountAmount}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 8.5, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(26,26,26,0.4)" }}>
                Express Courier
              </span>
              <span style={{ fontSize: 11, color: isFreeShipping ? "#2e7d32" : "#111" }}>
                {isFreeShipping ? "COMPLIMENTARY" : `$${shippingFee}`}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 8,
                marginTop: 4,
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ fontSize: 9.5, letterSpacing: "0.3em", textTransform: "uppercase", color: "#111", fontWeight: 400 }}>
                Total
              </span>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.45rem", color: "#111" }}>
                ${total}
              </span>
            </div>
          </div>

          <motion.button data-cursor onClick={onNext} whileTap={{ scale: 0.98 }} style={btnPrimary}>
            Proceed to Checkout
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// ── Phase 1: Contact Details ──────────────────────────────────────────────
const ContactPhase = ({ customer, setCustomer, onNext, onBack }) => {
  const [authMode, setAuthMode] = useState("guest"); // "guest" | "signin" | "create"
  const [focused, setFocused] = useState(null);

  const fi = (field) => ({
    ...inputStyle,
    borderBottom: `1px solid ${focused === field ? "#111" : "rgba(0,0,0,0.12)"}`,
    transition: "border-color 0.3s",
  });

  const isValid = customer.email.trim() && customer.name.trim();

  return (
    <motion.div
      key="contact"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}
    >
      {/* Mode selection tabs */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.8rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {[
          { key: "guest", label: "Guest Checkout" },
          { key: "signin", label: "Maison Member" },
          { key: "create", label: "Create Account" },
        ].map((m) => (
          <button
            key={m.key}
            data-cursor
            onClick={() => setAuthMode(m.key)}
            style={{
              fontSize: 8.5,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              cursor: "none",
              color: authMode === m.key ? "#111" : "rgba(26,26,26,0.35)",
              paddingBottom: 8,
              borderBottom: `1.5px solid ${authMode === m.key ? "#111" : "transparent"}`,
              transition: "all 0.25s ease",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(26,26,26,0.4)", marginBottom: 6 }}>
          Customer Information
        </p>

        <div>
          <label style={labelStyle}>Full Name *</label>
          <input
            style={fi("name")}
            placeholder="e.g. Alexandre Moreau"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div>
          <label style={labelStyle}>Email Address *</label>
          <input
            type="email"
            style={fi("email")}
            placeholder="name@example.com"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div>
          <label style={labelStyle}>Phone Number (Courier Dispatch)</label>
          <input
            type="tel"
            style={fi("phone")}
            placeholder="+33 6 12 34 56 78"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
          />
        </div>

        {authMode !== "guest" && (
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              style={fi("pass")}
              placeholder="••••••••"
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
            />
          </div>
        )}

        <div style={{ marginTop: 24, padding: "12px", background: "#f5f4f0", borderLeft: "2px solid #111" }}>
          <p style={{ fontSize: 8.5, color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}>
            ✦ Your receipt and bespoke dispatch tracking link will be transmitted to this email address immediately upon confirmation.
          </p>
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingTop: "1.2rem" }}>
        <motion.button
          data-cursor
          onClick={onNext}
          whileTap={{ scale: 0.98 }}
          disabled={!isValid}
          style={{
            ...btnPrimary,
            opacity: isValid ? 1 : 0.4,
            cursor: isValid ? "none" : "not-allowed",
          }}
        >
          Continue to Shipping & Payment
        </motion.button>
        <button data-cursor onClick={onBack} style={btnGhost}>
          ← Return to Bag
        </button>
      </div>
    </motion.div>
  );
};

// ── Phase 2: Shipping & Payment ───────────────────────────────────────────
const ShippingPaymentPhase = ({
  cart,
  customer,
  shipping,
  setShipping,
  payment,
  setPayment,
  appliedPromo,
  onPlaceOrder,
  onBack,
}) => {
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const priceNum = item.calculatedPriceNumber || parseInt(item.price.replace("$", ""), 10);
      return acc + priceNum * (item.quantity || 1);
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") {
      return Math.round((subtotal * appliedPromo.value) / 100);
    }
    if (appliedPromo.type === "fixed") {
      return Math.min(subtotal, appliedPromo.value);
    }
    return 0;
  }, [subtotal, appliedPromo]);

  const freeShipping = subtotal >= 200 || appliedPromo?.freeShipping;
  const deliveryCost = shipping.method === "white-glove" ? 35 : freeShipping ? 0 : 20;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCost);

  const fi = (field) => ({
    ...inputStyle,
    borderBottom: `1px solid ${focused === field ? "#111" : "rgba(0,0,0,0.12)"}`,
    transition: "border-color 0.3s",
  });

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      onPlaceOrder({
        grandTotal,
        subtotal,
        discountAmount,
        deliveryCost,
      });
      setSubmitting(false);
    }, 1200);
  };

  const isFormValid =
    shipping.address.trim() &&
    shipping.city.trim() &&
    shipping.postalCode.trim() &&
    (payment.method !== "card" || (payment.cardNumber.trim() && payment.cardExp.trim()));

  return (
    <motion.div
      key="shipping-payment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}
    >
      <div style={{ flex: 1, paddingBottom: 16 }}>
        {/* Shipping Address */}
        <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#111", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 4, marginBottom: 12 }}>
          1. Destination Address
        </p>

        <div>
          <label style={labelStyle}>Street Address *</label>
          <input
            style={fi("address")}
            placeholder="14 Place Vendôme"
            value={shipping.address}
            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
            onFocus={() => setFocused("address")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>City *</label>
            <input
              style={fi("city")}
              placeholder="Paris"
              value={shipping.city}
              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              onFocus={() => setFocused("city")}
              onBlur={() => setFocused(null)}
            />
          </div>
          <div style={{ width: 110 }}>
            <label style={labelStyle}>Postal Code *</label>
            <input
              style={fi("postalCode")}
              placeholder="75001"
              value={shipping.postalCode}
              onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
              onFocus={() => setFocused("postalCode")}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Country / Region</label>
          <select
            value={shipping.country}
            onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
            style={{
              ...inputStyle,
              borderBottom: "1px solid rgba(0,0,0,0.12)",
              cursor: "none",
            }}
          >
            <option value="France">France</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Egypt">Egypt</option>
            <option value="Germany">Germany</option>
            <option value="Italy">Italy</option>
            <option value="Switzerland">Switzerland</option>
          </select>
        </div>

        {/* Delivery Method Choice */}
        <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#111", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 4, marginTop: 24, marginBottom: 10 }}>
          2. Courier Tier
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label
            data-cursor
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: shipping.method === "standard" ? "#fff" : "transparent",
              border: `1px solid ${shipping.method === "standard" ? "#111" : "rgba(0,0,0,0.1)"}`,
              cursor: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="radio"
                name="delivery"
                checked={shipping.method === "standard"}
                onChange={() => setShipping({ ...shipping, method: "standard" })}
              />
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111" }}>
                  Air Express Dispatch
                </p>
                <p style={{ fontSize: 8, color: "rgba(0,0,0,0.4)" }}>3–5 business days · Tracked & Insured</p>
              </div>
            </div>
            <span style={{ fontSize: 9, color: freeShipping ? "#2e7d32" : "#111" }}>
              {freeShipping ? "FREE" : "$20"}
            </span>
          </label>

          <label
            data-cursor
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: shipping.method === "white-glove" ? "#fff" : "transparent",
              border: `1px solid ${shipping.method === "white-glove" ? "#111" : "rgba(0,0,0,0.1)"}`,
              cursor: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="radio"
                name="delivery"
                checked={shipping.method === "white-glove"}
                onChange={() => setShipping({ ...shipping, method: "white-glove" })}
              />
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111" }}>
                  White-Glove VIP Concierge
                </p>
                <p style={{ fontSize: 8, color: "rgba(0,0,0,0.4)" }}>Next-Day Hand Delivery + Luxury Gift Boxing</p>
              </div>
            </div>
            <span style={{ fontSize: 9, color: "#111" }}>+$35</span>
          </label>
        </div>

        {/* Payment Methods */}
        <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#111", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 4, marginTop: 24, marginBottom: 10 }}>
          3. Payment Method
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[
            { id: "card", label: "Card" },
            { id: "applepay", label: "Apple Pay" },
            { id: "cod", label: "Pay on Delivery" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              data-cursor
              onClick={() => setPayment({ ...payment, method: m.id })}
              style={{
                flex: 1,
                padding: "8px 6px",
                fontSize: 8.5,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: payment.method === m.id ? "#111" : "#fff",
                color: payment.method === m.id ? "#fff" : "rgba(17,17,17,0.6)",
                border: `1px solid ${payment.method === m.id ? "#111" : "rgba(0,0,0,0.12)"}`,
                cursor: "none",
                transition: "all 0.2s ease",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {payment.method === "card" && (
          <div>
            <div>
              <label style={labelStyle}>Card Number</label>
              <input
                style={fi("cardNumber")}
                placeholder="4532 •••• •••• 8892"
                value={payment.cardNumber}
                onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                onFocus={() => setFocused("cardNumber")}
                onBlur={() => setFocused(null)}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Expiry (MM/YY)</label>
                <input
                  style={fi("cardExp")}
                  placeholder="12 / 28"
                  value={payment.cardExp}
                  onChange={(e) => setPayment({ ...payment, cardExp: e.target.value })}
                  onFocus={() => setFocused("cardExp")}
                  onBlur={() => setFocused(null)}
                />
              </div>
              <div style={{ width: 90 }}>
                <label style={labelStyle}>CVV</label>
                <input
                  style={fi("cardCvv")}
                  placeholder="•••"
                  value={payment.cardCvv}
                  onChange={(e) => setPayment({ ...payment, cardCvv: e.target.value })}
                  onFocus={() => setFocused("cardCvv")}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </div>
          </div>
        )}

        {payment.method === "applepay" && (
          <div style={{ padding: "16px", background: "#f5f4f0", textAlign: "center", border: "1px dashed rgba(0,0,0,0.15)" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#111", marginBottom: 4 }}>
             Apple Pay Enabled
            </p>
            <p style={{ fontSize: 8, color: "rgba(0,0,0,0.5)" }}>Touch ID or Face ID will authenticate upon order placement.</p>
          </div>
        )}

        {payment.method === "cod" && (
          <div style={{ padding: "16px", background: "#f5f4f0", textAlign: "center", border: "1px dashed rgba(0,0,0,0.15)" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#111", marginBottom: 4 }}>
              Cash on Delivery (VIP Settlement)
            </p>
            <p style={{ fontSize: 8, color: "rgba(0,0,0,0.5)" }}>Pay in cash or direct contactless card directly upon courier arrival.</p>
          </div>
        )}
      </div>

      {/* Summary strip & Place order */}
      <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(26,26,26,0.5)" }}>
            Total with Dispatch
          </span>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.45rem", color: "#111" }}>
            ${grandTotal}
          </span>
        </div>

        <motion.button
          data-cursor
          onClick={handleSubmit}
          whileTap={{ scale: 0.98 }}
          disabled={!isFormValid || submitting}
          style={{
            ...btnPrimary,
            opacity: isFormValid && !submitting ? 1 : 0.4,
            cursor: isFormValid && !submitting ? "none" : "not-allowed",
          }}
        >
          {submitting ? "Securing Fragrance Order..." : `Authorize & Place Order · $${grandTotal}`}
        </motion.button>
        <button data-cursor onClick={onBack} style={btnGhost}>
          ← Back to Contact
        </button>
      </div>
    </motion.div>
  );
};

// ── Phase 3: Order Confirmation ───────────────────────────────────────────
const ConfirmationPhase = ({ orderResult, onClose }) => {
  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "1rem 0",
      }}
    >
      {/* Animated Monogram Luxury Checkmark */}
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none" style={{ marginBottom: "1.5rem" }}>
        <circle cx="34" cy="34" r="32" stroke="rgba(26,26,26,0.12)" strokeWidth="1" />
        <motion.circle
          cx="34"
          cy="34"
          r="32"
          stroke="#111"
          strokeWidth="1.2"
          strokeDasharray={`${2 * Math.PI * 32}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
        <motion.path
          d="M22 35l8 8 16-17"
          stroke="#111"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
        />
      </svg>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{
          fontSize: 8.5,
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: "rgba(26,26,26,0.45)",
          marginBottom: 4,
        }}
      >
        Maison Noir · Order Confirmed
      </motion.p>

      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="serif italic"
        style={{ fontSize: "2.3rem", color: "#1a1a1a", marginBottom: "0.4rem", lineHeight: 1 }}
      >
        Your Scent is Bound.
      </motion.h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          padding: "14px 20px",
          margin: "1rem 0",
          width: "100%",
          maxWidth: 340,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)" }}>
            Order Number
          </span>
          <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "#111", fontWeight: 500 }}>
            {orderResult.orderId || "MN-2026-8849"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)" }}>
            Recipient
          </span>
          <span style={{ fontSize: 9, color: "#111" }}>{orderResult.customer?.name || "Client"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)" }}>
            Estimated Delivery
          </span>
          <span style={{ fontSize: 9, color: "#2e7d32" }}>3–5 Working Days</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 6 }}>
          <span style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)" }}>
            Settlement Total
          </span>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.1rem", color: "#111" }}>
            ${orderResult.grandTotal}
          </span>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        style={{ fontSize: 11, color: "rgba(26,26,26,0.5)", lineHeight: 1.7, maxWidth: 300, fontWeight: 300 }}
      >
        A handwritten calligraphed letter and official receipt have been dispatched to{" "}
        <span style={{ color: "#111" }}>{orderResult.customer?.email}</span>.
      </motion.p>

      <motion.button
        data-cursor
        onClick={onClose}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        style={{ ...btnPrimary, maxWidth: 260, marginTop: "2rem" }}
      >
        Return to Collection
      </motion.button>
    </motion.div>
  );
};

// ── Main Checkout Panel Drawer ────────────────────────────────────────────
const CheckoutPanel = ({ cart, onUpdateQty, onRemove, onClose, onClearCart }) => {
  const [phase, setPhase] = useState(0);

  // Bag-level promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  // Customer contact state
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Shipping state
  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    method: "standard",
  });

  // Payment state
  const [payment, setPayment] = useState({
    method: "card",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
  });

  // Stored order result for confirmation screen
  const [orderResult, setOrderResult] = useState({});

  const handlePlaceOrder = (totals) => {
    const generatedId = `MN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const payload = {
      orderId: generatedId,
      customer,
      shipping,
      payment: { method: payment.method },
      promoCode: appliedPromo?.code || null,
      grandTotal: totals.grandTotal,
      cart: [...cart],
    };
    setOrderResult(payload);
    setPhase(3);

    const apiBase =
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "");
    fetch(`${apiBase}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  const handleClose = () => {
    if (phase === 3) {
      onClearCart();
    }
    setPhase(0);
    onClose();
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "flex-end",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Blurred Backdrop */}
      <motion.div
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          height: "100%",
          background: "#f9f8f5",
          borderLeft: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          padding: "2.5rem 2.25rem",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: "1.45rem", color: "#1a1a1a" }}>
              {PHASES[phase]}
            </span>
            <p style={{ fontSize: 7.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", marginTop: 2 }}>
              Step {phase + 1} of 4 · Maison Noir Bag
            </p>
          </div>

          <button
            data-cursor
            onClick={handleClose}
            style={{
              fontSize: 8.5,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(26,26,26,0.4)",
              background: "none",
              border: "none",
              cursor: "none",
              padding: "4px 8px",
            }}
          >
            Close ×
          </button>
        </div>

        {/* Progress Tracker Line */}
        <div style={{ display: "flex", gap: 6, marginBottom: "2rem" }}>
          {PHASES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                background: i <= phase ? "#1a1a1a" : "rgba(26,26,26,0.12)",
                flex: i === phase ? 2 : 1,
              }}
              transition={{ duration: 0.4 }}
              style={{ height: 2, borderRadius: 1 }}
            />
          ))}
        </div>

        {/* Phase Body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <BagPhase
                cart={cart}
                onUpdateQty={onUpdateQty}
                onRemove={onRemove}
                onClearCart={onClearCart}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                appliedPromo={appliedPromo}
                setAppliedPromo={setAppliedPromo}
                promoError={promoError}
                setPromoError={setPromoError}
                onNext={() => setPhase(1)}
              />
            )}

            {phase === 1 && (
              <ContactPhase
                customer={customer}
                setCustomer={setCustomer}
                onNext={() => setPhase(2)}
                onBack={() => setPhase(0)}
              />
            )}

            {phase === 2 && (
              <ShippingPaymentPhase
                cart={cart}
                customer={customer}
                shipping={shipping}
                setShipping={setShipping}
                payment={payment}
                setPayment={setPayment}
                appliedPromo={appliedPromo}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => setPhase(1)}
              />
            )}

            {phase === 3 && (
              <ConfirmationPhase orderResult={orderResult} onClose={handleClose} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutPanel;
