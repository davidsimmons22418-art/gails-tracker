import { useState, useEffect, useRef } from "react";
import { db, ref as fbRef, onValue, push, remove as fbRemove } from "./firebase";

/*
  GAIL's Brand Design Language — v3 Full Red
  - Warm parchment/cream backgrounds (#F7F2EB, #EDE6DB)
  - GAIL's crimson red primary (#C0392B, #8E1B12)
  - Serif display type (Playfair Display) + clean sans body (DM Sans)
  - Soft, organic shapes. Generous whitespace. Editorial calm.
  - Kraft/artisan texture feel through subtle grain and warm shadows
*/

const GAILS_PRODUCTS = {
  "Packaged Sweets": [
    { name: "Brownie Bites", price: "£6.20", shelfDays: 14 },
    { name: "Pistachio Financier", price: "£6.20", shelfDays: 14 },
    { name: "Brown Butter Financiers", price: "£6.20", shelfDays: 14 },
    { name: "Pistachio & Sour Cherry Biscotti", price: "£6.20", shelfDays: 30 },
    { name: "Chocolate & Hazelnut Biscotti", price: "£6.40", shelfDays: 30 },
    { name: "Heritage Grain & Vanilla Shortbread", price: "£6.20", shelfDays: 30 },
    { name: "Speculoos Biscuits", price: "£6.20", shelfDays: 30 },
    { name: "Nut Biscuits", price: "£6.20", shelfDays: 30 },
    { name: "Ginger & Treacle Loaf Cake", price: "£12.00", shelfDays: 10 },
    { name: "Chocolate Loaf Cake", price: "£12.00", shelfDays: 10 },
    { name: "Lemon Drizzle Loaf Cake", price: "£12.00", shelfDays: 10 },
  ],
  "Crisps": [
    { name: "Two Farmers Salted Crisps 40g", price: "£1.65", shelfDays: 90 },
    { name: "Two Farmers Cheese & Onion Crisps 40g", price: "£1.65", shelfDays: 90 },
    { name: "Two Farmers Wild Mushroom & Garlic Crisps 40g", price: "£1.65", shelfDays: 90 },
    { name: "Two Farmers Salted Crisps 150g Sharing Bag", price: "£3.50", shelfDays: 90 },
  ],
  "Ingredients & Grocery": [
    { name: "Classic Fruit & Nut Granola 400g", price: "£6.00", shelfDays: 90 },
    { name: "Toasted Coconut, Rye & Maple Granola 350g", price: "£6.00", shelfDays: 90 },
    { name: "Organic Raspberry & Rose Jam", price: "£5.60", shelfDays: 180 },
    { name: "Seville Orange Marmalade", price: "£5.60", shelfDays: 180 },
    { name: "Oxfordshire Honey", price: "£8.00", shelfDays: 365 },
    { name: "Hazelnut & Chocolate Spread", price: "£10.00", shelfDays: 120 },
    { name: "Crunchy Hazelnut Spread", price: "£10.00", shelfDays: 120 },
    { name: "Parmesan Shortbread", price: "£6.80", shelfDays: 30 },
    { name: "Heritage Grain Crispbreads", price: "£5.50", shelfDays: 60 },
    { name: "Buttermilk Seed Mix Crackers", price: "£5.50", shelfDays: 60 },
  ],
};

const CAT_ICONS = {
  "Packaged Sweets": "🍪",
  "Crisps": "🥔",
  "Ingredients & Grocery": "🫙",
  "My Products": "📦",
};

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseD(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function daysUntil(s) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.ceil((parseD(s) - t) / 86400000);
}

function StatusTag({ days }) {
  let bg, color, text, border;
  if (days < 0) {
    bg = "#F9E4E4"; color = "#9B2C2C"; text = "Expired"; border = "#E8B4B4";
  } else if (days === 0) {
    bg = "#FDECEA"; color = "#C0392B"; text = "Today"; border = "#F5C6C0";
  } else if (days === 1) {
    bg = "#FEF0EE"; color = "#A93226"; text = "Tomorrow"; border = "#F9D0CA";
  } else if (days <= 7) {
    bg = "#FDECEA"; color = "#A93226"; text = `${days}d left`; border = "#F5C6C0";
  } else if (days <= 30) {
    bg = "#FEF0EE"; color = "#C0392B"; text = `${days}d`; border = "#F9D0CA";
  } else {
    bg = "#FEF0EE"; color = "#D4655A"; text = `${Math.floor(days / 7)}w`; border = "#F9D0CA";
  }
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20, border: `1px solid ${border}`,
      fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap", letterSpacing: 0.3,
    }}>
      {text}
    </span>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

    .gails-app * { box-sizing: border-box; }
    .gails-app ::-webkit-scrollbar { width: 0; height: 0; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .gails-card {
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .gails-card:active {
      transform: scale(0.983);
    }
    .gails-tab-btn {
      transition: all 0.2s ease;
      position: relative;
    }
    .gails-tab-btn::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 18%;
      right: 18%;
      height: 2px;
      background: #C0392B;
      border-radius: 1px;
      transform: scaleX(0);
      transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .gails-tab-btn.active::after {
      transform: scaleX(1);
    }
    .modal-overlay {
      animation: fadeIn 0.2s ease;
    }
    .modal-sheet {
      animation: slideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .gails-input:focus {
      outline: none;
      border-color: #C0392B !important;
      box-shadow: 0 0 0 3px rgba(192,57,43,0.09);
    }
    .gails-del-btn:hover {
      background: #FEF0EE !important;
      border-color: #F5C6C0 !important;
      color: #C0392B !important;
    }
    .gails-fab:hover {
      transform: translateX(-50%) scale(1.06);
      box-shadow: 0 8px 30px rgba(192,57,43,0.40), 0 0 0 6px rgba(192,57,43,0.09) !important;
    }
    .gails-fab:active {
      transform: translateX(-50%) scale(0.96);
    }
    .grain-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 128px;
      mix-blend-mode: multiply;
      z-index: 0;
    }
  `}</style>
);

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState(null);
  const [selCat, setSelCat] = useState(null);
  const [selProd, setSelProd] = useState(null);
  const [cDate, setCDate] = useState("");
  const [cName, setCName] = useState("");
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selCalDay, setSelCalDay] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const fileRef = useRef(null);

  // Firebase realtime listener — syncs across all devices
  useEffect(() => {
    const productsRef = fbRef(db, "products");
    const unsub = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([firebaseId, val]) => ({
          ...val,
          firebaseId,
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const add = (name, cat, date, price) => {
    if (!name || !date) return;
    const productsRef = fbRef(db, "products");
    push(productsRef, {
      id: Date.now().toString(), name, category: cat,
      price: price || null, expiryDate: date, addedDate: fmtDate(new Date()),
    });
  };
  const removeProduct = (p) => {
    if (p.firebaseId) {
      const itemRef = fbRef(db, `products/${p.firebaseId}`);
      fbRemove(itemRef);
    }
  };
  const sugDate = (prod) => {
    const d = new Date(); d.setDate(d.getDate() + (prod.shelfDays || 30)); return fmtDate(d);
  };
  const closeModal = () => {
    setShowAdd(false); setAddMode(null); setSelCat(null); setSelProd(null);
    setCDate(""); setCName(""); setScanResult(null); setScanning(false);
  };

  const handleCam = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setScanning(true); setScanResult(null);
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej();
        r.readAsDataURL(file);
      });
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{
            role: "user", content: [
              { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: b64 } },
              { type: "text", text: `Extract the sell-by/use-by/best-before date and product name from this label. Respond ONLY with JSON: {"date":"YYYY-MM-DD","product":"name or null"}. If no date found: {"date":null,"product":null}. Today is ${fmtDate(new Date())}. Assume DD/MM/YY for ambiguous UK dates.` },
            ],
          }],
        }),
      });
      const data = await resp.json();
      const txt = data.content?.map(i => i.text || "").join("") || "";
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setScanResult(parsed);
      if (parsed.date) setCDate(parsed.date);
      if (parsed.product) setCName(parsed.product);
    } catch {
      setScanResult({ date: null, product: null, error: true });
    }
    setScanning(false);
  };

  const today = fmtDate(new Date());
  const expiringToday = products.filter(p => daysUntil(p.expiryDate) === 0);
  const expSoon = products.filter(p => { const d = daysUntil(p.expiryDate); return d > 0 && d <= 7; });
  const expired = products.filter(p => daysUntil(p.expiryDate) < 0);
  const fresh = products.filter(p => daysUntil(p.expiryDate) > 7);
  const sortedAll = [...products].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  const forDate = (ds) => products.filter(p => p.expiryDate === ds);

  const getWeekDays = (offset) => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const dow = now.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(now); mon.setDate(now.getDate() + diff + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i); return d;
    });
  };
  const weekDays = getWeekDays(weekOffset);
  const weekLabel =
    weekOffset === 0 ? "This Week" :
    weekOffset === 1 ? "Next Week" :
    weekOffset === -1 ? "Last Week" :
    `${weekDays[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDays[6].toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

  const calDays = () => {
    const f = new Date(calMonth.y, calMonth.m, 1);
    const l = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    const d = f.getDay() === 0 ? 6 : f.getDay() - 1;
    const c = [];
    for (let i = 0; i < d; i++) c.push(null);
    for (let i = 1; i <= l; i++) c.push(i);
    return c;
  };
  const calStr = new Date(calMonth.y, calMonth.m).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const shiftM = (dir) => {
    setCalMonth(p => {
      let m = p.m + dir, y = p.y;
      if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { y, m };
    });
    setSelCalDay(null);
  };

  // Design tokens
  const serif = "'Cormorant Garamond', 'Georgia', serif";
  const sans = "'Libre Franklin', -apple-system, sans-serif";
  const green = "#C0392B";
  const greenDark = "#8E1B12";
  const cream = "#F7F2EB";
  const parchment = "#EDE6DB";
  const warmGray = "#9A8F82";
  const red = "#C0392B";
  const redLight = "#FDECEA";
  const redBorder = "#F5C6C0";

  // ── Sub-components ──────────────────────────────────────────────

  const Card = ({ p, delay = 0 }) => {
    const d = daysUntil(p.expiryDate);
    return (
      <div className="gails-card" style={{
        background: "#FFFFFF", borderRadius: 16, padding: "15px 17px", marginBottom: 9,
        border: `1px solid ${d < 0 ? "#EAC8C8" : d === 0 ? redBorder : "#E8E2D8"}`,
        display: "flex", alignItems: "center", gap: 13,
        opacity: d < 0 ? 0.72 : 1,
        boxShadow: d < 0 ? "none" : "0 1px 4px rgba(192,57,43,0.05)",
        animation: `fadeUp 0.3s ease ${delay}ms both`,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: parchment,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0, border: `1px solid ${cream}`,
        }}>
          {CAT_ICONS[p.category] || "📦"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: greenDark, lineHeight: 1.35, fontFamily: sans }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: warmGray, fontFamily: sans, marginTop: 2 }}>
            {d < 0
              ? `Expired ${Math.abs(d)}d ago`
              : d === 0
              ? "Use by end of day"
              : parseD(p.expiryDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            {p.price ? <span style={{ color: red, fontWeight: 600 }}> · {p.price}</span> : ""}
          </div>
        </div>
        <StatusTag days={d} />
        <button
          className="gails-del-btn"
          onClick={() => removeProduct(p)}
          style={{
            background: "transparent", border: `1px solid #E0D8CD`, color: warmGray,
            borderRadius: 10, width: 32, height: 32, fontSize: 14, cursor: "pointer",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: sans, transition: "all 0.15s",
          }}
        >×</button>
      </div>
    );
  };

  const SectionHeader = ({ children }) => (
    <div style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase",
      color: warmGray, marginBottom: 12, fontFamily: sans,
    }}>
      {children}
    </div>
  );

  const NavArrow = ({ onClick, children }) => (
    <button onClick={onClick} style={{
      background: "#FFF", border: `1px solid #E0D8CD`, color: green,
      width: 36, height: 36, borderRadius: 10, fontSize: 16, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: serif, transition: "all 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {children}
    </button>
  );

  const BackBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: red, fontSize: 13,
      cursor: "pointer", marginBottom: 16, padding: 0,
      fontFamily: sans, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
    }}>
      {children}
    </button>
  );

  const PrimaryBtn = ({ onClick, disabled, children }) => (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        width: "100%", padding: "16px", marginTop: 20,
        background: disabled ? parchment : green,
        border: "none", borderRadius: 14,
        color: disabled ? warmGray : "#FFF",
        fontSize: 15, fontWeight: 600, cursor: disabled ? "default" : "pointer",
        fontFamily: sans, letterSpacing: 0.3,
        boxShadow: disabled ? "none" : "0 4px 18px rgba(192,57,43,0.22)",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="gails-app" style={{
        maxWidth: 430, margin: "0 auto", minHeight: "100vh",
        background: cream, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        borderRadius: 24, fontFamily: sans,
      }}>
        <GlobalStyles />
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: green,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(192,57,43,0.25)", marginBottom: 16,
        }}>
          <span style={{ color: cream, fontSize: 28, fontFamily: serif, fontWeight: 700 }}>G</span>
        </div>
        <div style={{ fontSize: 14, color: warmGray, animation: "pulse 1.5s ease infinite" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="gails-app" style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: cream, position: "relative",
      borderRadius: 24, overflow: "hidden", fontFamily: sans,
    }}>
      <GlobalStyles />
      <div className="grain-overlay" />

      {/* ── HEADER ── */}
      <div style={{
        padding: "22px 24px 16px",
        background: `linear-gradient(180deg, #FFFFFF 0%, ${cream} 100%)`,
        borderBottom: `1px solid #E8E2D8`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13, background: green,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(192,57,43,0.28)",
          }}>
            <span style={{ color: cream, fontSize: 23, fontFamily: serif, fontWeight: 700, marginTop: -1 }}>G</span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: serif, color: greenDark, letterSpacing: 1.8 }}>GAIL's</div>
            <div style={{ fontSize: 9.5, color: warmGray, letterSpacing: 2.8, fontFamily: sans, fontWeight: 600, marginTop: -2, textTransform: "uppercase" }}>Freshness Tracker</div>
          </div>
        </div>
        <div style={{
          fontSize: 12, color: green, fontFamily: sans, fontWeight: 700,
          background: "rgba(192,57,43,0.06)", padding: "5px 13px", borderRadius: 20,
          border: "1px solid rgba(192,57,43,0.10)",
        }}>
          {products.length} item{products.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{
        display: "flex", padding: "0 8px",
        background: "#FFFFFF", borderBottom: "1px solid #E8E2D8",
        position: "relative", zIndex: 1,
      }}>
        {[["home", "Home"], ["weekly", "Weekly"], ["calendar", "Calendar"], ["all", "All"]].map(([id, label]) => (
          <button
            key={id}
            className={`gails-tab-btn ${tab === id ? "active" : ""}`}
            onClick={() => { setTab(id); setSelCalDay(null); }}
            style={{
              flex: 1, padding: "14px 0 12px", textAlign: "center", fontSize: 13,
              fontWeight: tab === id ? 700 : 400,
              color: tab === id ? greenDark : warmGray,
              background: "none", border: "none", fontFamily: sans, cursor: "pointer",
              letterSpacing: 0.3,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── HOME ── */}
      {tab === "home" && (
        <div style={{ paddingBottom: 100, position: "relative", zIndex: 1 }}>
          {(expiringToday.length > 0 || expired.length > 0) && (
            <div style={{
              margin: "16px 20px 0", padding: "16px 18px", borderRadius: 16,
              background: expired.length > 0 ? "#FDF5F5" : redLight,
              border: `1px solid ${expired.length > 0 ? "#EDD4D4" : redBorder}`,
              display: "flex", alignItems: "center", gap: 14,
              animation: "fadeUp 0.3s ease both",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: expired.length > 0 ? "#F9E4E4" : "#FDD5D0",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
              }}>
                {expired.length > 0 ? "⚠" : "⏰"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: expired.length > 0 ? "#9B2C2C" : red, fontFamily: sans }}>
                  {expired.length > 0
                    ? `${expired.length} product${expired.length > 1 ? "s" : ""} expired`
                    : `${expiringToday.length} expiring today`}
                </div>
                <div style={{ fontSize: 12, color: warmGray, fontFamily: sans, marginTop: 2 }}>
                  {expired.length > 0 ? "Remove to keep your pantry tidy" : "Use or freeze these today"}
                </div>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 40px", animation: "fadeUp 0.4s ease both" }}>
              <div style={{ fontSize: 24, fontWeight: 500, fontFamily: serif, color: greenDark, marginBottom: 10 }}>Your pantry is empty</div>
              <div style={{ fontSize: 14, color: warmGray, lineHeight: 1.6, fontFamily: sans }}>
                Tap the button below to start tracking sell-by dates on your GAIL's products
              </div>
            </div>
          ) : (
            <>
              {expired.length > 0 && (
                <div style={{ padding: "16px 20px 0" }}>
                  <SectionHeader>Expired</SectionHeader>
                  {expired.map((p, i) => <Card key={p.id} p={p} delay={i * 40} />)}
                </div>
              )}
              {expiringToday.length > 0 && (
                <div style={{ padding: "16px 20px 0" }}>
                  <SectionHeader>Expiring Today</SectionHeader>
                  {expiringToday.map((p, i) => <Card key={p.id} p={p} delay={i * 40} />)}
                </div>
              )}
              {expSoon.length > 0 && (
                <div style={{ padding: "16px 20px 0" }}>
                  <SectionHeader>This Week</SectionHeader>
                  {expSoon.map((p, i) => <Card key={p.id} p={p} delay={i * 40} />)}
                </div>
              )}
              {fresh.length > 0 && (
                <div style={{ padding: "16px 20px 0" }}>
                  <SectionHeader>All Good</SectionHeader>
                  {fresh.sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)).map((p, i) => <Card key={p.id} p={p} delay={i * 40} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── WEEKLY ── */}
      {tab === "weekly" && (
        <div style={{ paddingBottom: 100, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 10px" }}>
            <NavArrow onClick={() => setWeekOffset(w => w - 1)}>‹</NavArrow>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 500, fontFamily: serif, color: greenDark }}>{weekLabel}</div>
              <div style={{ fontSize: 11, color: warmGray, fontFamily: sans, marginTop: 2 }}>
                {weekDays[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {weekDays[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <NavArrow onClick={() => setWeekOffset(w => w + 1)}>›</NavArrow>
          </div>

          {weekOffset !== 0 && (
            <div style={{ textAlign: "center", paddingBottom: 6 }}>
              <button onClick={() => setWeekOffset(0)} style={{ background: "none", border: "none", color: red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: sans }}>← Back to this week</button>
            </div>
          )}

          {/* Day strip */}
          <div style={{ display: "flex", gap: 6, padding: "10px 20px 12px", overflowX: "auto" }}>
            {weekDays.map(d => {
              const ds = fmtDate(d);
              const count = forDate(ds).length;
              const isTd = ds === today;
              const hasExp = forDate(ds).some(p => daysUntil(p.expiryDate) < 0);
              const isExpiring = forDate(ds).some(p => daysUntil(p.expiryDate) === 0);
              return (
                <div key={ds} style={{
                  flex: "0 0 auto", width: 50, textAlign: "center", padding: "10px 0 8px",
                  borderRadius: 14, transition: "all 0.2s",
                  background: isTd ? green : count > 0 ? "#FFF" : "transparent",
                  border: isTd ? `1px solid ${green}` : count > 0 ? "1px solid #E0D8CD" : "1px solid transparent",
                  boxShadow: isTd ? "0 2px 8px rgba(192,57,43,0.18)" : "none",
                }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: isTd ? "rgba(255,255,255,0.65)" : warmGray, letterSpacing: 0.8 }}>
                    {d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: isTd ? "#FFF" : greenDark, fontFamily: sans, marginTop: 2 }}>
                    {d.getDate()}
                  </div>
                  {count > 0 && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, marginTop: 4,
                      color: isTd ? "#FFF" : hasExp ? "#9B2C2C" : isExpiring ? red : green,
                      background: isTd ? "rgba(255,255,255,0.2)" : hasExp ? "#F9E4E4" : isExpiring ? redLight : "rgba(192,57,43,0.08)",
                      borderRadius: 8, padding: "2px 0", width: 22, margin: "0 auto",
                    }}>
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day-by-day */}
          <div style={{ padding: "0 20px" }}>
            {weekDays.map((d, idx) => {
              const ds = fmtDate(d);
              const items = forDate(ds);
              const isTd = ds === today;
              const dayName = isTd ? "Today" : daysUntil(ds) === 1 ? "Tomorrow" : daysUntil(ds) === -1 ? "Yesterday" : d.toLocaleDateString("en-GB", { weekday: "long" });
              const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
              return (
                <div key={ds} style={{ marginBottom: 4, animation: `fadeUp 0.3s ease ${idx * 50}ms both` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0 8px" }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                      background: items.length === 0 ? "#E0D8CD" :
                        items.some(p => daysUntil(p.expiryDate) < 0) ? "#D46A6A" :
                        items.some(p => daysUntil(p.expiryDate) === 0) ? red : green,
                      boxShadow: items.length > 0 ? `0 0 0 3px ${items.some(p => daysUntil(p.expiryDate) < 0) ? "rgba(212,106,106,0.15)" : items.some(p => daysUntil(p.expiryDate) === 0) ? "rgba(192,57,43,0.15)" : "rgba(192,57,43,0.1)"}` : "none",
                    }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 15, fontWeight: isTd ? 700 : 500, color: isTd ? green : greenDark, fontFamily: isTd ? sans : serif }}>{dayName}</span>
                      <span style={{ fontSize: 12, color: warmGray, marginLeft: 8, fontFamily: sans }}>{dateStr}</span>
                    </div>
                    {items.length > 0 && <span style={{ fontSize: 11, color: warmGray, fontFamily: sans }}>{items.length} item{items.length > 1 ? "s" : ""}</span>}
                  </div>
                  {items.length > 0 ? (
                    <div style={{ paddingLeft: 22 }}>
                      {items.map((p, i) => <Card key={p.id} p={p} delay={idx * 50 + i * 30} />)}
                    </div>
                  ) : (
                    <div style={{ paddingLeft: 22, paddingBottom: 4 }}>
                      <div style={{ fontSize: 12, color: "#C8BEB0", fontStyle: "italic", fontFamily: sans }}>Nothing expiring</div>
                    </div>
                  )}
                  {idx < 6 && <div style={{ height: 1, background: "#E8E2D8", marginLeft: 22 }} />}
                </div>
              );
            })}
          </div>

          {/* Week summary */}
          {(() => {
            const items = weekDays.flatMap(d => forDate(fmtDate(d)));
            if (!items.length) return null;
            const expCount = items.filter(p => daysUntil(p.expiryDate) < 0).length;
            return (
              <div style={{ margin: "12px 20px 0", padding: "16px 18px", borderRadius: 16, background: "#FFF", border: "1px solid #E0D8CD" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: green, fontFamily: sans, marginBottom: 4 }}>Week at a glance</div>
                <div style={{ fontSize: 13, color: warmGray, fontFamily: sans }}>
                  {items.length} product{items.length > 1 ? "s" : ""} expiring
                  {expCount > 0 && <span style={{ color: "#9B2C2C" }}> · {expCount} already expired</span>}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {tab === "calendar" && (
        <div style={{ paddingBottom: 100, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 10px" }}>
            <NavArrow onClick={() => shiftM(-1)}>‹</NavArrow>
            <div style={{ fontSize: 18, fontWeight: 500, fontFamily: serif, color: greenDark }}>{calStr}</div>
            <NavArrow onClick={() => shiftM(1)}>›</NavArrow>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, padding: "0 16px" }}>
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, i) => (
              <div key={i} style={{ fontSize: 9.5, fontWeight: 700, color: warmGray, textAlign: "center", padding: "8px 0", letterSpacing: 1.2, fontFamily: sans }}>
                {d}
              </div>
            ))}
            {calDays().map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const ds = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dp = forDate(ds);
              const isTd = ds === today;
              const isSel = selCalDay === ds;
              return (
                <div key={ds}
                  onClick={() => dp.length > 0 && setSelCalDay(isSel ? null : ds)}
                  style={{
                    aspectRatio: "1", borderRadius: 12, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: dp.length > 0 ? "pointer" : "default",
                    background: isSel ? "rgba(192,57,43,0.08)" : isTd ? green : dp.length > 0 ? "#FFF" : "transparent",
                    border: isSel ? `1.5px solid ${red}` : isTd ? `1px solid ${green}` : dp.length > 0 ? "1px solid #E8E2D8" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 14, fontWeight: isTd ? 700 : 500, color: isTd ? "#FFF" : dp.length > 0 ? greenDark : "#C8BEB0", fontFamily: sans }}>
                    {day}
                  </span>
                  {dp.length > 0 && !isTd && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {dp.slice(0, 3).map((_, j) => (
                        <div key={j} style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: dp.some(p => daysUntil(p.expiryDate) < 0) ? "#D46A6A" :
                            dp.some(p => daysUntil(p.expiryDate) === 0) ? red :
                            daysUntil(ds) <= 7 ? "#B8A44A" : green,
                        }} />
                      ))}
                      {dp.length > 3 && <span style={{ fontSize: 7, color: warmGray }}>+{dp.length - 3}</span>}
                    </div>
                  )}
                  {dp.length > 0 && isTd && (
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.6)", marginTop: 2 }} />
                  )}
                </div>
              );
            })}
          </div>

          {selCalDay && (
            <div style={{ padding: "16px 20px 0", animation: "fadeUp 0.25s ease both" }}>
              <SectionHeader>
                {parseD(selCalDay).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </SectionHeader>
              {forDate(selCalDay).map((p, i) => <Card key={p.id} p={p} delay={i * 40} />)}
            </div>
          )}

          <div style={{ padding: "20px 20px 0", display: "flex", gap: 18, flexWrap: "wrap" }}>
            {[{ c: "#D46A6A", l: "Expired" }, { c: red, l: "Today" }, { c: "#B8A44A", l: "This week" }, { c: green, l: "Later" }].map(l => (
              <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.c }} />
                <span style={{ fontSize: 11, color: warmGray, fontFamily: sans }}>{l.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ALL ── */}
      {tab === "all" && (
        <div style={{ paddingBottom: 100, position: "relative", zIndex: 1 }}>
          {sortedAll.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 40px", fontSize: 13, color: warmGray, fontFamily: sans }}>No items yet</div>
            : <div style={{ padding: "16px 20px 0" }}>
                <SectionHeader>All Items · by expiry date</SectionHeader>
                {sortedAll.map((p, i) => <Card key={p.id} p={p} delay={i * 30} />)}
              </div>
          }
        </div>
      )}

      {/* ── FAB ── */}
      <button
        className="gails-fab"
        onClick={() => setShowAdd(true)}
        style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          width: 58, height: 58, borderRadius: 18, background: green,
          border: "none", color: cream, fontSize: 30, fontWeight: 300,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 6px 24px rgba(192,57,43,0.35), 0 0 0 5px rgba(192,57,43,0.08)`,
          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)", zIndex: 50, fontFamily: sans,
        }}
      >+</button>

      {/* ── MODAL ── */}
      {showAdd && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(90,20,15,0.50)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100,
          }}
        >
          <div
            className="modal-sheet"
            style={{
              width: "100%", maxWidth: 430, background: cream,
              borderRadius: "28px 28px 0 0", padding: "8px 0 36px",
              maxHeight: "88vh", overflowY: "auto",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#D0C8BC", margin: "8px auto 20px" }} />

            {/* ── Choose mode ── */}
            {!addMode && (
              <div style={{ padding: "0 24px" }}>
                <div style={{ fontSize: 24, fontWeight: 600, fontFamily: serif, color: greenDark, marginBottom: 4 }}>Add Product</div>
                <div style={{ fontSize: 14, color: warmGray, fontFamily: sans, marginBottom: 24 }}>How would you like to add?</div>
                {[
                  { mode: "gails", icon: "🍪", title: "GAIL's Pantry", desc: "Packaged sweets, crisps & grocery" },
                  { mode: "custom", icon: "✏️", title: "My Own Product", desc: "Custom name & date" },
                  { mode: "camera", icon: "📷", title: "Scan with Camera", desc: "Read the sell-by date from a label" },
                ].map((m, i) => (
                  <button
                    key={m.mode}
                    onClick={() => {
                      if (m.mode === "camera") {
                        setAddMode("custom");
                        setTimeout(() => fileRef.current?.click(), 100);
                      } else {
                        setAddMode(m.mode);
                      }
                    }}
                    className="gails-card"
                    style={{
                      display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "18px 20px",
                      marginBottom: 10, background: "#FFF", border: "1px solid #E0D8CD",
                      borderRadius: 16, color: greenDark, cursor: "pointer", textAlign: "left",
                      fontFamily: sans, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      animation: `fadeUp 0.3s ease ${i * 60}ms both`,
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: parchment, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {m.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: warmGray, marginTop: 2 }}>{m.desc}</div>
                    </div>
                    <span style={{ color: "#C8BEB0", fontSize: 18 }}>›</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── GAIL's category list ── */}
            {addMode === "gails" && !selCat && (
              <div style={{ padding: "0 24px" }}>
                <BackBtn onClick={() => setAddMode(null)}>← Back</BackBtn>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: serif, color: greenDark, marginBottom: 18 }}>GAIL's Pantry</div>
                {Object.keys(GAILS_PRODUCTS).map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => setSelCat(cat)}
                    className="gails-card"
                    style={{
                      display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 18px",
                      marginBottom: 8, background: "#FFF", border: "1px solid #E0D8CD",
                      borderRadius: 14, color: greenDark, fontSize: 15, fontWeight: 500,
                      cursor: "pointer", textAlign: "left", fontFamily: sans,
                      animation: `fadeUp 0.25s ease ${i * 50}ms both`,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{CAT_ICONS[cat]}</span>
                    <span>{cat}</span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: warmGray }}>{GAILS_PRODUCTS[cat].length} ›</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── GAIL's product grid ── */}
            {addMode === "gails" && selCat && !selProd && (
              <div style={{ padding: "0 24px" }}>
                <BackBtn onClick={() => setSelCat(null)}>← Back</BackBtn>
                <SectionHeader>{CAT_ICONS[selCat]} {selCat}</SectionHeader>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {GAILS_PRODUCTS[selCat].map((prod, i) => (
                    <button
                      key={prod.name}
                      onClick={() => { setSelProd(prod); setCDate(sugDate(prod)); }}
                      className="gails-card"
                      style={{
                        padding: "16px 12px", background: "#FFF", border: "1px solid #E0D8CD",
                        borderRadius: 14, color: greenDark, fontSize: 13, fontWeight: 500,
                        cursor: "pointer", textAlign: "center", fontFamily: sans, lineHeight: 1.35,
                        animation: `fadeUp 0.25s ease ${i * 30}ms both`,
                      }}
                    >
                      {prod.name}
                      <div style={{ fontSize: 11, color: red, fontWeight: 700, marginTop: 6 }}>{prod.price}</div>
                      <div style={{ fontSize: 10, color: warmGray, marginTop: 2 }}>~{prod.shelfDays}d shelf life</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── GAIL's product confirm ── */}
            {addMode === "gails" && selProd && (
              <div style={{ padding: "0 24px" }}>
                <BackBtn onClick={() => { setSelProd(null); setCDate(""); }}>← Back</BackBtn>
                <div style={{
                  background: "#FFF", borderRadius: 18, padding: 24, marginBottom: 24,
                  textAlign: "center", border: "1px solid #E0D8CD",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 38 }}>{CAT_ICONS[selCat]}</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: greenDark, fontFamily: serif, marginTop: 10 }}>{selProd.name}</div>
                  <div style={{ fontSize: 16, color: red, fontWeight: 700, fontFamily: sans, marginTop: 6 }}>{selProd.price}</div>
                  <div style={{ fontSize: 12, color: warmGray, fontFamily: sans, marginTop: 4 }}>Typical shelf life: {selProd.shelfDays} days</div>
                </div>
                <SectionHeader>Sell-by Date</SectionHeader>
                <input
                  type="date" value={cDate}
                  onChange={e => setCDate(e.target.value)}
                  className="gails-input"
                  style={{ width: "100%", padding: "14px 16px", background: "#FFF", border: "1px solid #E0D8CD", borderRadius: 12, color: greenDark, fontSize: 16, fontFamily: sans, transition: "all 0.2s" }}
                />
                <PrimaryBtn onClick={() => { add(selProd.name, selCat, cDate, selProd.price); closeModal(); }} disabled={!cDate}>
                  Add to Tracker
                </PrimaryBtn>
              </div>
            )}

            {/* ── Custom / Camera ── */}
            {addMode === "custom" && (
              <div style={{ padding: "0 24px" }}>
                <BackBtn onClick={() => { setAddMode(null); setCName(""); setCDate(""); setScanResult(null); }}>← Back</BackBtn>
                <div style={{ fontSize: 22, fontWeight: 600, fontFamily: serif, color: greenDark, marginBottom: 18 }}>Add Your Product</div>

                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleCam} style={{ display: "none" }} />

                <button
                  onClick={() => fileRef.current?.click()}
                  className="gails-card"
                  style={{
                    width: "100%", padding: "18px", marginBottom: 18,
                    background: "#FFF", border: "1.5px dashed #F5C6C0",
                    borderRadius: 16, color: green, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: sans,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  {scanning
                    ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Reading date...</>
                    : <><span style={{ fontSize: 20 }}>📷</span> Scan sell-by date with camera</>}
                </button>

                {scanResult && !scanResult.error && scanResult.date && (
                  <div style={{
                    background: "#FEF0EE", border: "1px solid #F5C6C0", borderRadius: 14,
                    padding: "14px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>✓</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: green, fontFamily: sans }}>Date detected</div>
                      <div style={{ fontSize: 12, color: warmGray, fontFamily: sans }}>
                        {parseD(scanResult.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                        {scanResult.product ? ` · "${scanResult.product}"` : ""}
                      </div>
                    </div>
                  </div>
                )}

                {scanResult && (scanResult.error || !scanResult.date) && (
                  <div style={{
                    background: redLight, border: `1px solid ${redBorder}`, borderRadius: 14,
                    padding: "14px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>✗</span>
                    <div style={{ fontSize: 13, color: red, fontFamily: sans }}>Couldn't read a date — enter it manually below.</div>
                  </div>
                )}

                <SectionHeader>Product Name</SectionHeader>
                <input
                  type="text" value={cName}
                  onChange={e => setCName(e.target.value)}
                  placeholder="e.g. Almond butter, Oat milk..."
                  className="gails-input"
                  style={{ width: "100%", padding: "14px 16px", background: "#FFF", border: "1px solid #E0D8CD", borderRadius: 12, color: greenDark, fontSize: 16, fontFamily: sans, transition: "all 0.2s", marginBottom: 18 }}
                />
                <SectionHeader>Sell-by / Best Before Date</SectionHeader>
                <input
                  type="date" value={cDate}
                  onChange={e => setCDate(e.target.value)}
                  className="gails-input"
                  style={{ width: "100%", padding: "14px 16px", background: "#FFF", border: "1px solid #E0D8CD", borderRadius: 12, color: greenDark, fontSize: 16, fontFamily: sans, transition: "all 0.2s" }}
                />
                <PrimaryBtn onClick={() => { if (cName && cDate) { add(cName, "My Products", cDate, null); closeModal(); } }} disabled={!cName || !cDate}>
                  Add to Tracker
                </PrimaryBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
