import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SAMPLE_RECIPIENTS = [
  {
    name: "Sara Al-Mansoor",
    email: "sara@example.com",
    notes: "Loves warm honey, Sicilian tobacco & vanilla notes · Interested in Xerjoff 1861 Naxos for winter evenings",
  },
  {
    name: "Alexandre Moreau",
    email: "alexandre@example.com",
    notes: "Prefers crisp Mediterranean citrus, cedarwood & clean ambroxan · Wears Bleu de Chanel",
  },
];

const EmailConciergeModal = ({ onClose }) => {
  const [recipients, setRecipients] = useState([
    {
      name: "",
      email: "",
      notes: "Interested in our Winter Extrait de Parfum collection — warm amber, vanilla & aged cognac",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [error, setError] = useState("");

  const getApiBase = () =>
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "");

  const updateRecipient = (index, field, value) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const addRecipientRow = () => {
    setRecipients((prev) => [...prev, { name: "", email: "", notes: "" }]);
  };

  const removeRecipientRow = (index) => {
    if (recipients.length <= 1) return;
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const loadSampleRecipients = () => {
    setRecipients(SAMPLE_RECIPIENTS);
    setDispatchResult(null);
    setError("");
  };

  const importFromSupabaseOrders = async () => {
    setLoadingOrders(true);
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/api/orders`);
      if (!res.ok) throw new Error("Could not fetch recent orders");
      const data = await res.json();
      const orders = Array.isArray(data.orders) ? data.orders : [];
      const seen = new Set();
      const imported = [];
      for (const o of orders) {
        const email = (o.customer_email || "").trim();
        if (!email || !email.includes("@") || email === "guest@maison-noir.com" || seen.has(email)) {
          continue;
        }
        seen.add(email);
        const itemsList = Array.isArray(o.items)
          ? o.items.map((i) => `${i.name} (${i.size || "100ml"})`).join(", ")
          : "";
        imported.push({
          name: o.customer_name || "Valued Client",
          email,
          notes: itemsList
            ? `Past order ${o.order_code}: ${itemsList} · Total $${o.grand_total}`
            : `Past order ${o.order_code} ($${o.grand_total})`,
        });
        if (imported.length >= 5) break;
      }
      if (imported.length === 0) {
        toast("No custom client emails found in recent orders — loaded sample VIP list.");
        setRecipients(SAMPLE_RECIPIENTS);
      } else {
        setRecipients(imported);
        toast.success(`Imported ${imported.length} client(s) from Supabase orders`);
      }
    } catch {
      setError("Could not load recent orders from backend.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDispatch = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setDispatchResult(null);

    const valid = recipients.filter((r) => r.email && r.email.includes("@"));
    if (valid.length === 0) {
      setError("Please enter at least one valid recipient email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger email workflow");
      setDispatchResult(data);
      toast.success(`Dispatched ${data.count} personalized email(s) via n8n Workflow 7`);
    } catch (err) {
      setError(err.message || "Could not reach backend /api/emails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
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
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          maxHeight: "90vh",
          background: "#faf9f6",
          border: "1px solid rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 35px 90px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2.25rem",
            background: "#111",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 8.5,
                letterSpacing: "0.36em",
                textTransform: "uppercase",
                color: "#d4af37",
                marginBottom: 4,
              }}
            >
              n8n Workflow 7 · Gemini Personalized Copywriter + Gmail SMTP
            </p>
            <h2 className="serif italic" style={{ fontSize: "1.85rem", color: "#fff", lineHeight: 1 }}>
              Maison Noir · Private Gmail Concierge
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              fontSize: 9,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              background: "none",
              border: "1px solid rgba(255,255,255,0.22)",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Close ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.75rem 2.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.4rem",
          }}
        >
          {/* Pipeline Status Strip */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  background: "#111",
                  color: "#d4af37",
                  padding: "4px 9px",
                }}
              >
                POST /webhook/maison-noir-emails
              </span>
              <span style={{ fontSize: 11, color: "rgba(0,0,0,0.65)" }}>
                From <strong>muhamedgad444@gmail.com</strong> → Dynamically sends to{" "}
                <strong>any email the client enters</strong>
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={importFromSupabaseOrders}
                disabled={loadingOrders}
                style={{
                  padding: "7px 12px",
                  fontSize: 8.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "#f4f3ef",
                  border: "1px solid rgba(0,0,0,0.15)",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                {loadingOrders ? "Loading..." : "Import from Orders"}
              </button>
              <button
                type="button"
                onClick={loadSampleRecipients}
                style={{
                  padding: "7px 12px",
                  fontSize: 8.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                Load Sample VIPs
              </button>
            </div>
          </div>

          {/* Recipients Form */}
          <form onSubmit={handleDispatch} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.5)",
                }}
              >
                Recipients ({recipients.length}) — Each receives a tailored AI email
              </span>
              <button
                type="button"
                onClick={addRecipientRow}
                style={{
                  padding: "6px 12px",
                  fontSize: 8.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Add Recipient
              </button>
            </div>

            {recipients.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.1fr 1.6fr auto",
                  gap: "0.75rem",
                  alignItems: "end",
                  background: "#fff",
                  padding: "14px",
                  border: "1px solid rgba(0,0,0,0.09)",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(0,0,0,0.45)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sara"
                    value={rec.name}
                    onChange={(e) => updateRecipient(idx, "name", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      fontSize: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(0,0,0,0.45)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Gmail / Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={rec.email}
                    onChange={(e) => updateRecipient(idx, "email", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      fontSize: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(0,0,0,0.45)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Personalization Notes (Scent Preferences / Occasion)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Loves warm vanilla, tobacco & winter extraits..."
                    value={rec.notes}
                    onChange={(e) => updateRecipient(idx, "notes", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      fontSize: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeRecipientRow(idx)}
                  disabled={recipients.length <= 1}
                  style={{
                    padding: "9px 11px",
                    fontSize: 11,
                    background: "none",
                    border: "1px solid rgba(0,0,0,0.12)",
                    color: recipients.length <= 1 ? "rgba(0,0,0,0.2)" : "#c62828",
                    cursor: recipients.length <= 1 ? "not-allowed" : "pointer",
                  }}
                  title="Remove recipient"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                background: "#111",
                color: "#fff",
                fontSize: 9.5,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                border: "none",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading
                ? "Generating & Sending Personalized Emails via n8n Gmail..."
                : `Dispatch ${recipients.length} Personalized Email${recipients.length > 1 ? "s" : ""} via Gmail →`}
            </button>
          </form>

          {error && (
            <div style={{ padding: "12px 16px", background: "#ffebee", color: "#c62828", fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Dispatch Results & Generated Email Preview */}
          <AnimatePresence>
            {dispatchResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                    paddingBottom: 10,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 8.5,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "#2e7d32",
                        fontWeight: 600,
                      }}
                    >
                      ✓ {dispatchResult.status === "dispatched" ? "Dispatched via n8n Workflow 7 (Gmail SMTP)" : "Email Preview Composed"}
                    </span>
                    <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", marginTop: 2 }}>
                      Sender: {dispatchResult.fromEmail} · Recipients: {dispatchResult.count}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      background: "#f4f3ef",
                      color: "#111",
                    }}
                  >
                    {dispatchResult.source}
                  </span>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  {(dispatchResult.previews || []).map((p, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#faf9f6",
                        border: "1px solid rgba(0,0,0,0.07)",
                        padding: "1.1rem 1.35rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          color: "rgba(0,0,0,0.55)",
                          marginBottom: 6,
                        }}
                      >
                        <span>
                          <strong>To:</strong> {p.name} &lt;{p.email}&gt;
                        </span>
                        <span>
                          <strong>Notes:</strong> {p.notes}
                        </span>
                      </div>
                      <p
                        className="serif italic"
                        style={{
                          fontSize: "1.25rem",
                          color: "#111",
                          marginBottom: 8,
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          paddingBottom: 6,
                        }}
                      >
                        Subject: {p.subject}
                      </p>
                      <div
                        style={{ fontSize: 13, lineHeight: 1.7, color: "#222" }}
                        dangerouslySetInnerHTML={{ __html: p.html }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailConciergeModal;
