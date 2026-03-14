import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Trash2, Clock, Mail, Zap, DollarSign,
  TrendingUp, BarChart2, Target, FileText, CheckCircle2,
  AlertCircle, Loader2, Sparkles, Send, Eye, Hash,
  Bot, X, Info, ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Criterion {
  id: number;
  type: "price" | "dividend" | "technical" | "fundamental";
  field: string;
  condition: string;
  value: string;
  value2?: string;
}

type SaveState = "idle" | "loading" | "success" | "error";
type AiState   = "idle" | "loading" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DATA
// ─────────────────────────────────────────────────────────────────────────────
const FUNDAMENTAL_FIELDS = [
  { group: "Balance Sheet", fields: ["Total Assets","Current Assets","Cash & Equivalents","Accounts Receivable","Inventory","Marketable Securities (Current)","Marketable Securities (Noncurrent)","Property, Plant & Equipment","Accumulated Depreciation","Goodwill","Intangible Assets","Total Liabilities","Current Liabilities","Long-Term Debt","Accounts Payable","Accrued Expenses","Total Equity","Retained Earnings","Common Stock","Preferred Stock"] },
  { group: "Income Statement", fields: ["Revenue","Cost of Revenue","Gross Profit","Operating Expenses","R&D Expense","SG&A Expense","Operating Income","Interest Expense","Income Before Tax","Income Tax Expense","Net Income","EPS (Basic)","EPS (Diluted)","Shares Outstanding"] },
  { group: "Cash Flow", fields: ["Operating Cash Flow","Investing Cash Flow","Financing Cash Flow","Free Cash Flow","CapEx","Dividends Paid","Stock Repurchases","Debt Issuance","Equity Issuance"] },
  { group: "Key Ratios", fields: ["P/E Ratio","P/B Ratio","P/S Ratio","EV/EBITDA","Current Ratio","Quick Ratio","Debt-to-Equity","Gross Margin","Operating Margin","Net Margin","ROE","ROA","ROIC","Dividend Yield","Payout Ratio"] },
];
const TECHNICAL_FIELDS = ["RSI (14)","MACD Line","MACD Signal","MACD Histogram","50-Day SMA","200-Day SMA","20-Day EMA","Bollinger Upper","Bollinger Lower","Average Volume (30D)","Relative Volume","ATR (14)","Beta (1Y)","52-Week High","52-Week Low"];
const PRICE_FIELDS     = ["Current Price","Market Cap","Enterprise Value","Day Change %","Week Change %","Month Change %","YTD Change %"];
const DIVIDEND_FIELDS  = ["Dividend Yield","Annual Dividend","Payout Ratio","Dividend Growth Rate (5Y)","Years of Dividend Growth"];

const CONDITIONS = [
  { value: "greater_than",  label: "greater than",  symbol: ">"  },
  { value: "less_than",     label: "less than",     symbol: "<"  },
  { value: "equal_to",      label: "equal to",      symbol: "="  },
  { value: "gte",           label: "at least",      symbol: ">=" },
  { value: "lte",           label: "at most",       symbol: "<=" },
  { value: "between",       label: "between",       symbol: "↔"  },
  { value: "crosses_above", label: "crosses above", symbol: "↑×" },
  { value: "crosses_below", label: "crosses below", symbol: "↓×" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  price:       { label: "Price",       icon: DollarSign, color: "#F5B830", bg: "rgba(240,165,0,0.07)",    border: "rgba(240,165,0,0.22)",    headerBg: "rgba(240,165,0,0.1)",    fields: PRICE_FIELDS,    grouped: false },
  dividend:    { label: "Dividend",    icon: Target,     color: "#2DDBA8", bg: "rgba(45,219,168,0.07)",   border: "rgba(45,219,168,0.22)",   headerBg: "rgba(45,219,168,0.09)",  fields: DIVIDEND_FIELDS, grouped: false },
  technical:   { label: "Technical",   icon: BarChart2,  color: "#818CF8", bg: "rgba(129,140,248,0.07)",  border: "rgba(129,140,248,0.22)",  headerBg: "rgba(129,140,248,0.09)", fields: TECHNICAL_FIELDS, grouped: false },
  fundamental: { label: "Fundamental", icon: FileText,   color: "#C8D4E3", bg: "rgba(200,212,227,0.05)",  border: "rgba(200,212,227,0.16)",  headerBg: "rgba(200,212,227,0.07)", fields: null,            grouped: true  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INLINE STYLES
// ─────────────────────────────────────────────────────────────────────────────
const sel: React.CSSProperties = {
  flex: 1, padding: "0.42rem 0.7rem",
  background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "7px", color: "var(--white)", fontFamily: "var(--font-body)",
  fontSize: "0.775rem", outline: "none", cursor: "pointer",
  appearance: "none", WebkitAppearance: "none",
};
const inp: React.CSSProperties = {
  flex: 1, padding: "0.42rem 0.7rem",
  background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "7px", color: "var(--white)",
  fontFamily: "var(--font-mono)", fontSize: "0.775rem",
  outline: "none", minWidth: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// AI EXAMPLE PROMPTS
// ─────────────────────────────────────────────────────────────────────────────
const AI_EXAMPLES = [
  "Stocks with P/E under 15, dividend yield above 3%, and RSI between 30–50",
  "Large-cap tech with revenue growth > 20% and debt-to-equity under 0.5",
  "Undervalued dividend growers: P/B < 2, payout ratio < 60%, 5yr div growth > 8%",
  "High free cash flow, operating margin > 25%, and low beta under 1",
];

// ─────────────────────────────────────────────────────────────────────────────
// CRITERION ROW
// ─────────────────────────────────────────────────────────────────────────────
function CriterionRow({ criterion, update, remove, index }: {
  criterion: Criterion;
  update: (id: number, field: keyof Criterion, value: string) => void;
  remove: (id: number) => void;
  index: number;
}) {
  const cfg = TYPE_CONFIG[criterion.type];
  const Icon = cfg.icon;
  const isBetween = criterion.condition === "between";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 10, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        display: "flex", alignItems: "center", gap: "0.55rem",
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: "9px", padding: "0.65rem 0.8rem",
      }}
    >
      {/* Index */}
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: cfg.color, opacity: 0.5, minWidth: "1.25rem", textAlign: "right", flexShrink: 0 }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Type pill */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.18rem 0.55rem", background: cfg.headerBg, border: `1px solid ${cfg.border}`, borderRadius: "99px", flexShrink: 0 }}>
        <Icon size={10} color={cfg.color} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", fontWeight: 700, color: cfg.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {cfg.label}
        </span>
      </div>

      {/* Field */}
      {criterion.type === "fundamental" ? (
        <select value={criterion.field} onChange={e => update(criterion.id, "field", e.target.value)} style={sel}>
          <option value="" disabled>Field…</option>
          {FUNDAMENTAL_FIELDS.map(g => (
            <optgroup label={g.group} key={g.group}>
              {g.fields.map(f => <option key={f} value={f}>{f}</option>)}
            </optgroup>
          ))}
        </select>
      ) : (
        <select value={criterion.field} onChange={e => update(criterion.id, "field", e.target.value)} style={sel}>
          <option value="" disabled>Field…</option>
          {(cfg.fields as string[]).map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      )}

      {/* Condition */}
      <select value={criterion.condition} onChange={e => update(criterion.id, "condition", e.target.value)} style={{ flex: "0 0 auto", maxWidth: 130, padding: "0.42rem 0.7rem", background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "var(--white)", fontFamily: "var(--font-body)", fontSize: "0.775rem", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
        <option value="" disabled>Condition…</option>
        {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.symbol}  {c.label}</option>)}
      </select>

      {/* Value(s) */}
      <input type="text" placeholder={isBetween ? "Min" : "Value"} value={criterion.value} onChange={e => update(criterion.id, "value", e.target.value)} style={{ flex: 1, padding: "0.42rem 0.7rem", background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: "0.775rem", outline: "none", minWidth: 0, maxWidth: 100 }} />
      {isBetween && <>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--slate-300)", flexShrink: 0 }}>–</span>
        <input type="text" placeholder="Max" value={criterion.value2 || ""} onChange={e => update(criterion.id, "value2", e.target.value)} style={{ flex: 1, padding: "0.42rem 0.7rem", background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: "0.775rem", outline: "none", minWidth: 0, maxWidth: 100 }} />
      </>}

      {/* Remove */}
      <button
        onClick={() => remove(criterion.id)}
        title="Remove"
        style={{ padding: "0.3rem", background: "transparent", border: "1px solid transparent", borderRadius: "6px", color: "var(--slate-300)", cursor: "pointer", display: "flex", flexShrink: 0, transition: "all 0.15s" }}
        onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#F06070"; el.style.background = "rgba(240,96,112,0.1)"; el.style.borderColor = "rgba(240,96,112,0.2)"; }}
        onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--slate-300)"; el.style.background = "transparent"; el.style.borderColor = "transparent"; }}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRITERIA GROUP
// ─────────────────────────────────────────────────────────────────────────────
function CriteriaGroup({ type, criteria, update, remove, allCriteria }: {
  type: Criterion["type"]; criteria: Criterion[];
  update: (id: number, field: keyof Criterion, value: string) => void;
  remove: (id: number) => void; allCriteria: Criterion[];
}) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  if (criteria.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      style={{ borderRadius: "12px", border: `1px solid ${cfg.border}`, overflow: "hidden" }}
    >
      {/* Group header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.55rem 0.9rem", background: cfg.headerBg, borderBottom: `1px solid ${cfg.border}` }}>
        <Icon size={11} color={cfg.color} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {cfg.label} Rules
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: cfg.color, opacity: 0.55 }}>
          {criteria.length} {criteria.length === 1 ? "rule" : "rules"}
        </span>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0.5rem", background: "var(--navy-900)" }}>
        <AnimatePresence mode="popLayout">
          {criteria.map(c => (
            <CriterionRow
              key={c.id} criterion={c} update={update} remove={remove}
              index={allCriteria.findIndex(ac => ac.id === c.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
function EmailPreview({ alertName, frequency, criteria, stockLimit, emailSubject, emailIntro, onClose }: {
  alertName: string; frequency: string; criteria: Criterion[];
  stockLimit: number; emailSubject: string; emailIntro: string; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(8,12,20,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", width: "100%", maxWidth: 560, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.65)" }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 1.1rem", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Eye size={13} color="var(--amber-400)" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 600, color: "var(--slate-200)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Email Preview</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--slate-300)", cursor: "pointer", padding: "0.2rem", display: "flex" }}><X size={15} /></button>
        </div>

        {/* Email mockup */}
        <div style={{ padding: "1.25rem" }}>
          <div style={{ background: "#0D1421", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", overflow: "hidden" }}>
            {/* Email headers */}
            <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(240,165,0,0.05)" }}>
              {[
                { l: "From", v: "alerts@tradestep.io" },
                { l: "To",   v: "you@example.com" },
                { l: "Sub",  v: emailSubject || `[TradeStep] ${alertName || "Your Alert"} — ${frequency === "daily" ? "Daily" : "Weekly"} Digest`, bold: true },
              ].map(({ l, v, bold }) => (
                <div key={l} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.2rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--slate-300)", minWidth: 32 }}>{l}</span>
                  <span style={{ fontSize: "0.775rem", color: bold ? "var(--white)" : "var(--slate-100)", fontWeight: bold ? 600 : 400 }}>{v}</span>
                </div>
              ))}
            </div>
            {/* Email body */}
            <div style={{ padding: "1.1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.875rem" }}>
                <TrendingUp size={12} color="var(--amber-400)" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, color: "var(--amber-400)", letterSpacing: "0.08em" }}>TRADESTEP</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--white)", fontWeight: 600, marginBottom: "0.3rem" }}>
                {alertName || "Your Alert"} — {frequency === "daily" ? "Daily" : "Weekly"} Report
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--slate-300)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
                {emailIntro || `Here are up to ${stockLimit} stocks that matched your "${alertName || "alert"}" criteria as of today.`}
              </p>
              {/* Mock table */}
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: "7px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "0.875rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px", padding: "0.45rem 0.75rem", background: "rgba(240,165,0,0.06)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Ticker","Company","Rules Matched"].map(h => (
                    <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.53rem", color: "var(--slate-300)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                  ))}
                </div>
                {[["AAPL","Apple Inc."],["MSFT","Microsoft Corp."],["JNJ","Johnson & Johnson"]].slice(0, Math.min(3, stockLimit)).map(([t, n], i) => (
                  <div key={t} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px", padding: "0.45rem 0.75rem", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--amber-400)", fontWeight: 600 }}>{t}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--slate-100)" }}>{n}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#2DDBA8" }}>{criteria.length}/{criteria.length} ✓</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.65rem", color: "var(--slate-300)", lineHeight: 1.55 }}>
                Automated report from TradeStep. Not financial advice.{" "}
                <span style={{ color: "var(--amber-400)", cursor: "pointer" }}>Unsubscribe</span> · <span style={{ color: "var(--amber-400)", cursor: "pointer" }}>Manage Alerts</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────
function AiAssistant({ onCriteriaGenerated }: { onCriteriaGenerated: (c: Criterion[]) => void }) {
  const [prompt, setPrompt]   = useState("");
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [exIdx, setExIdx]     = useState(0);

  useEffect(() => {
    const t = setInterval(() => setExIdx(i => (i + 1) % AI_EXAMPLES.length), 4200);
    return () => clearInterval(t);
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setAiState("loading");
    setAiError(null);

    // ── Replace this block with: fetch(`${API_URL}/alerts/ai-parse`, { method:"POST", body: JSON.stringify({prompt}) })
    // Your Rust endpoint should: call OpenAI chat completions with a strict system prompt
    // that maps plain English to your Criterion[] schema, then return { criteria: Criterion[] }
    await new Promise(r => setTimeout(r, 1700));
    const lower = prompt.toLowerCase();
    const result: Criterion[] = [];

    if (lower.includes("p/e") || lower.includes("pe ratio")) {
      const val = lower.match(/p\/e[^0-9]*(\d+)/)?.[1] || "15";
      result.push({ id: Date.now() + 1, type: "fundamental", field: "P/E Ratio", condition: (lower.includes("under") || lower.includes("below") || lower.includes("less")) ? "less_than" : "greater_than", value: val });
    }
    if (lower.includes("dividend yield") || (lower.includes("dividend") && lower.includes("%"))) {
      const val = lower.match(/yield[^0-9]*(\d+\.?\d*)/)?.[1] || lower.match(/dividend[^0-9]*(\d+\.?\d*)/)?.[1] || "3";
      result.push({ id: Date.now() + 2, type: "dividend", field: "Dividend Yield", condition: "greater_than", value: val });
    }
    if (lower.includes("rsi")) {
      const range = lower.match(/rsi[^0-9]*(\d+)[^0-9]+(\d+)/);
      if (range) {
        result.push({ id: Date.now() + 3, type: "technical", field: "RSI (14)", condition: "between", value: range[1], value2: range[2] });
      } else {
        const val = lower.match(/rsi[^0-9]*(\d+)/)?.[1] || "40";
        const cond = lower.includes("over") || lower.includes("above") ? "greater_than" : "less_than";
        result.push({ id: Date.now() + 3, type: "technical", field: "RSI (14)", condition: cond, value: val });
      }
    }
    if (lower.includes("debt") && (lower.includes("equity") || lower.includes("leverage"))) {
      const val = lower.match(/debt[^0-9]*(\d+\.?\d*)/)?.[1] || "0.5";
      result.push({ id: Date.now() + 4, type: "fundamental", field: "Debt-to-Equity", condition: "less_than", value: val });
    }
    if (lower.includes("market cap") || lower.includes("large cap") || lower.includes("large-cap")) {
      result.push({ id: Date.now() + 5, type: "price", field: "Market Cap", condition: "greater_than", value: "10B" });
    }
    if (lower.includes("free cash flow") || lower.includes("fcf")) {
      result.push({ id: Date.now() + 6, type: "fundamental", field: "Free Cash Flow", condition: "greater_than", value: "0" });
    }
    if (lower.includes("operating margin")) {
      const val = lower.match(/margin[^0-9]*(\d+)/)?.[1] || "20";
      result.push({ id: Date.now() + 7, type: "fundamental", field: "Operating Margin", condition: "greater_than", value: val });
    }
    if (lower.includes("revenue") && (lower.includes("growth") || lower.includes(">"))) {
      const val = lower.match(/revenue[^0-9]*(\d+)/)?.[1] || "20";
      result.push({ id: Date.now() + 8, type: "fundamental", field: "Revenue", condition: "greater_than", value: val + "B" });
    }
    if (lower.includes("beta") && lower.includes("low")) {
      result.push({ id: Date.now() + 9, type: "technical", field: "Beta (1Y)", condition: "less_than", value: "1" });
    }
    if (lower.includes("p/b") || lower.includes("price to book")) {
      const val = lower.match(/p\/b[^0-9]*(\d+\.?\d*)/)?.[1] || "2";
      result.push({ id: Date.now() + 10, type: "fundamental", field: "P/B Ratio", condition: "less_than", value: val });
    }
    if (lower.includes("payout ratio")) {
      const val = lower.match(/payout[^0-9]*(\d+)/)?.[1] || "60";
      result.push({ id: Date.now() + 11, type: "dividend", field: "Payout Ratio", condition: "less_than", value: val });
    }

    if (result.length === 0) {
      setAiState("error");
      setAiError("Couldn't extract specific criteria. Try mentioning P/E, dividend yield, RSI, revenue growth, or debt-to-equity.");
      return;
    }
    setAiState("idle");
    setPrompt("");
    onCriteriaGenerated(result);
  };

  return (
    <div style={{ background: "linear-gradient(135deg, rgba(129,140,248,0.06), rgba(129,140,248,0.02))", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "13px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 1rem", borderBottom: "1px solid rgba(129,140,248,0.15)", background: "rgba(129,140,248,0.07)" }}>
        <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "7px", background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={13} color="#818CF8" />
        </div>
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--white)" }}>AI Criteria Builder</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#818CF8", opacity: 0.7 }}>Describe your screen in plain English</p>
        </div>
        <span style={{ marginLeft: "auto", background: "rgba(129,140,248,0.12)", color: "#818CF8", border: "1px solid rgba(129,140,248,0.25)", fontFamily: "var(--font-mono)", fontSize: "0.53rem", padding: "0.15rem 0.5rem", borderRadius: "99px", letterSpacing: "0.06em" }}>
          BETA
        </span>
      </div>

      <div style={{ padding: "0.9rem" }}>
        {/* Rotating example */}
        <div style={{ marginBottom: "0.6rem", padding: "0.45rem 0.7rem", background: "rgba(255,255,255,0.025)", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
            <Info size={10} color="#818CF8" style={{ marginTop: "0.1rem", flexShrink: 0 }} />
            <AnimatePresence mode="wait">
              <motion.p
                key={exIdx}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28 }}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--slate-300)", fontStyle: "italic", lineHeight: 1.5 }}
              >
                "{AI_EXAMPLES[exIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Input */}
        <div style={{ position: "relative" }}>
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); setAiError(null); }}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
            placeholder="Describe the type of stocks you want to find…"
            rows={3}
            style={{
              width: "100%", padding: "0.7rem 2.75rem 0.7rem 0.8rem",
              background: "var(--navy-900)",
              border: `1px solid ${aiError ? "rgba(240,96,112,0.35)" : "rgba(129,140,248,0.2)"}`,
              borderRadius: "8px", color: "var(--white)",
              fontFamily: "var(--font-body)", fontSize: "0.8rem",
              resize: "none", outline: "none", lineHeight: 1.6,
              transition: "border-color 0.2s",
            }}
          />
          <button
            onClick={generate}
            disabled={!prompt.trim() || aiState === "loading"}
            style={{
              position: "absolute", bottom: "0.45rem", right: "0.45rem",
              width: "1.9rem", height: "1.9rem",
              background: prompt.trim() ? "#818CF8" : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: "6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: prompt.trim() ? "pointer" : "not-allowed", transition: "all 0.2s",
            }}
            title="Generate (⌘+Enter)"
          >
            {aiState === "loading"
              ? <Loader2 size={12} color="white" style={{ animation: "spin 0.9s linear infinite" }} />
              : <Send size={12} color={prompt.trim() ? "white" : "var(--slate-300)"} />
            }
          </button>
        </div>

        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "0.45rem", display: "flex", gap: "0.35rem", alignItems: "flex-start", padding: "0.45rem 0.65rem", background: "rgba(240,96,112,0.07)", borderRadius: "7px", border: "1px solid rgba(240,96,112,0.18)" }}
          >
            <AlertCircle size={11} color="#F06070" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
            <p style={{ fontSize: "0.7rem", color: "#F06070", lineHeight: 1.5 }}>{aiError}</p>
          </motion.div>
        )}
        <p style={{ marginTop: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: "var(--slate-300)", opacity: 0.55 }}>
          ⌘+Enter to generate · Rules are appended to your existing criteria
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function Step({ number, title, subtitle, children, delay = 0 }: {
  number: string; title: string; subtitle?: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay }}
      style={{ background: "var(--navy-800)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.625rem", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.22), transparent)" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", marginBottom: "1.375rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 700, color: "var(--amber-400)", background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.2)", borderRadius: "5px", padding: "0.18rem 0.48rem", letterSpacing: "0.08em", flexShrink: 0, marginTop: "0.15rem" }}>
          {number}
        </div>
        <div>
          <h2 style={{ fontSize: "0.975rem", fontWeight: 600, color: "var(--white)", marginBottom: subtitle ? "0.18rem" : 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: "0.75rem", color: "var(--slate-300)", lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_ORDER: Criterion["type"][] = ["price", "dividend", "technical", "fundamental"];

export default function Services() {
  const [alertName, setAlertName]       = useState("");
  const [frequency, setFrequency]       = useState<"daily" | "weekly">("daily");
  const [stockLimit, setStockLimit]     = useState(25);
  const [criteria, setCriteria]         = useState<Criterion[]>([]);
  const [saveState, setSaveState]       = useState<SaveState>("idle");
  const [showPreview, setShowPreview]   = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailIntro, setEmailIntro]     = useState("");

  const addCriterion  = (type: Criterion["type"]) => setCriteria(p => [...p, { id: Date.now(), type, field: "", condition: "", value: "" }]);
  const updateCriterion = (id: number, field: keyof Criterion, value: string) => setCriteria(p => p.map(c => c.id === id ? { ...c, [field]: value } : c));
  const removeCriterion = (id: number) => setCriteria(p => p.filter(c => c.id !== id));
  const handleAiCriteria = (nc: Criterion[]) => setCriteria(p => [...p, ...nc]);
  const clearAll = () => setCriteria([]);

  const handleSave = () => {
    if (!canSave) return;
    setSaveState("loading");
    setTimeout(() => { setSaveState("success"); setTimeout(() => setSaveState("idle"), 3500); }, 1600);
  };

  const canSave = alertName.trim() !== "" && criteria.length > 0;

  return (
    <div style={{ background: "var(--navy-950)", minHeight: "100vh", padding: "2.5rem 3rem" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.18rem 0.55rem", borderRadius: "99px", background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.2)", fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 600, color: "var(--amber-400)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            <Zap size={9} /> Alert Builder
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "var(--white)", marginBottom: "0.35rem" }}>
            Build an Intelligent Alert
          </h1>
          <p style={{ color: "var(--slate-300)", fontSize: "0.85rem", maxWidth: 520, lineHeight: 1.65 }}>
            Define screening criteria, configure your digest, and receive a curated list of qualifying stocks in your inbox automatically.
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

          {/* 01 — Name */}
          <Step number="01" title="Name Your Alert" delay={0.05}>
            <input
              type="text" value={alertName}
              onChange={e => setAlertName(e.target.value)}
              placeholder='"Deep Value Dividends" or "High-Growth Tech"'
              style={{ width: "100%", maxWidth: 460, padding: "0.65rem 1rem", background: "var(--navy-900)", borderRadius: "8px", color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none", border: `1px solid ${alertName ? "rgba(240,165,0,0.3)" : "rgba(255,255,255,0.1)"}`, boxShadow: alertName ? "0 0 0 3px rgba(240,165,0,0.07)" : "none" }}
            />
          </Step>

          {/* 02 — Delivery */}
          <Step number="02" title="Delivery Configuration" subtitle="Set frequency, result limit, and customise the email you receive." delay={0.09}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>

              {/* Frequency */}
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate-300)", marginBottom: "0.45rem" }}>Frequency</p>
                <div style={{ display: "flex", gap: "0.45rem" }}>
                  {(["daily","weekly"] as const).map(f => (
                    <button key={f} onClick={() => setFrequency(f)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", padding: "0.55rem 0.8rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600, border: `1px solid ${frequency === f ? "rgba(240,165,0,0.4)" : "rgba(255,255,255,0.09)"}`, background: frequency === f ? "rgba(240,165,0,0.12)" : "transparent", color: frequency === f ? "var(--amber-400)" : "var(--slate-200)", cursor: "pointer", transition: "all 0.18s", fontFamily: "var(--font-body)" }}>
                      <Clock size={12} />{f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock limit */}
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate-300)", marginBottom: "0.45rem" }}>
                  Max Results  <span style={{ color: "var(--amber-400)", marginLeft: "0.25rem" }}>{stockLimit}</span>
                </p>
                <input type="range" min={1} max={100} value={stockLimit} onChange={e => setStockLimit(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--amber-500)", cursor: "pointer" }} />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: "var(--slate-300)", marginTop: "0.2rem", opacity: 0.7 }}>Top {stockLimit} matches, ranked by score</p>
              </div>

              {/* Custom subject */}
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate-300)", marginBottom: "0.45rem" }}>
                  Email Subject <span style={{ opacity: 0.45 }}>(optional)</span>
                </p>
                <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder={`[TradeStep] ${alertName || "Your Alert"} — ${frequency === "daily" ? "Daily" : "Weekly"} Digest`} style={{ flex: 1, width: "100%", padding: "0.55rem 0.8rem", background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "var(--white)", fontFamily: "var(--font-body)", fontSize: "0.775rem", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }} />
              </div>

            {/* Intro message */}
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate-300)", marginBottom: "0.45rem" }}>
                  Intro Message <span style={{ opacity: 0.45 }}>(optional)</span>
                </p>
                <input type="text" value={emailIntro} onChange={e => setEmailIntro(e.target.value)} placeholder={`Here are today's top ${stockLimit} matches…`} style={{ flex: 1, width: "100%", padding: "0.55rem 0.8rem", background: "var(--navy-900)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "var(--white)", fontFamily: "var(--font-body)", fontSize: "0.775rem", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }} />
              </div>
            </div>

            <button
              onClick={() => setShowPreview(true)}
              style={{ marginTop: "0.875rem", display: "inline-flex", agnItems: "center", gap: "0.35rem", padding: "0.42rem 0.875rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "var(--slate-200)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.18s", fontFamily: "var(--font-body)" }}
              onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.07)"; el.style.color = "var(--white)"; }}
              onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = "var(--slate-200)"; }}
            >
              <Eye size={12} /> Preview Email
            </button>
          </Step>

          {/* 03 — AI */}
          <Step number="03" title="AI-Assisted Builder" subtitle="Describe what you're looking for and the AI will generate rules automatically." delay={0.13}>
            <AiAssistant onCriteriaGenerated={handleAiCriteria} />
          </Step>

          {/*  — Manual rules */}
          <Step number="04" title="Screening Rules" subtitle="Add and refine rules manually. All rules must match for a stock to qualify." delay={0.17}>
            {/* Add buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "1.1rem" }}>
              {TYPE_ORDER.map(type => {
                const cfg = TYPE_CONFIG[type];
                const Icon = cfg.icon;
                return (
                  <button key={type} onClick={()=>addCriterion(type)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "7px", color: String(cfg.color), fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-body)" }}>
                    <Icon size={11} /> + {cfg.label}
                  </button>
                );
              })}
              {criteria.length > 0 && (
                <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.8rem", background: "rgba(240,96,112,0.07)", border: "1px solid rgba(240,96,112,0.2)", borderRadius: "7px", color: "#F06070", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-body)", marginLeft: "auto" }}>
                  <Trash2 size={11} /> Clear All
                </button>
              )}
            </div>

            {/* Grouped criteria */}
            <AnimatePresence mode="popLayout">
              {criteria.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {TYPE_ORDER.map(type => (
                    <CriteriaGroup key={type} type={type} criteria={criteria.filter(c => c.type === type)} update={updateCriterion} remove={removeCriterion} allCriteria={criteria} />
                  ))}
                </div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "2.25rem 1.5rem", background: "var(--navy-900)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.07)" }}>
                  <PlusCircle size={24} color="var(--slate-300)" style={{ margin: "0 auto 0.5rem", opacity: 0.3 }} />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--slate-300)", opacity: 0.6 }}>
                    No rules yet — use theI builder above or add manually.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary dots */}
            {criteria.length > 0 && (
              <div style={{ marginTop: "0.875rem", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                {TYPE_ORDER.map(type => {
                  const count = criteria.filter(c => c.type === type).length;
                  if (count === 0) return null;
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: String(cfg.color) }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--slate-300)" }}>{count} {cfg.label}</span>
                    </div>
                  );
                })}
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--slate-300)" }}>{criteria.length} total rule{criteria.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </Step>

          {/* 05 — Review */}
          <Step number="05" title="Review & Activate" delay={0.21}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
              <div style={{ displ: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {[
                  { v: alertName || "—",  l: "Alert Name",   hi: !!alertName },
                  { v: frequency.charAt(0).toUpperCase() + frequency.slice(1), l: "Frequency", hi: true },
                  { v: String(stockLimit), l: "Max Results",  hi: true },
                  { v: String(criteria.length), l: criteria.length === 1 ? "Rule" : "Rules", hi: criteria.length > 0 },
                ].map(({ v, l, hi }) => (
                  <div k={l} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700, color: hi ? "var(--white)" : "var(--slate-300)" }}>{v}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate-300)" }}>{l}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                <button
                  onClick={handleSave}
                  disabled={!canSave || saveState === "loading"}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.45rem",
                    padding: "0.7rem 1.625rem",
                    background: !canSave ? "rgba(255,255,255,0.05)" : saveState === "success" ? "rgba(45,219,168,0.12)" : "var(--amber-500)",
                    color: !canSave ? "var(--slate-300)" : saveState === "success" ? "#2DDBA8" : "var(--navy-900)",
                    border: saveState === "success" ? "1px solid rgba(45,219,168,0.3)" : "1px solid transparent",
                    borderRadius: "9px", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 700,
                    cursor: canSave && saveState !== "loading" ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: canSave && saveState !== "success" ? "0 6px 20px rgba(240,165,0,0.22)" : "none",
                  }}
                >
                  {saveState === "loading" && <Loader2 size={14} style={{ animation: "spin 0.9s linear infinite" }} />}
                  {saveState === "success" && <CheckCircle2 size={14} />}
                  {saveState === "idle"    && <Mail size={14} />}
                  {saveState === "loading" ? "Activating…" : saveState === "success" ? "Alert Activated!" : "Save & Activate"}
              </button>
                {!canSave && (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--slate-300)" }}>
                    {!alertName.trim() ? "⚠ Name required" : "⚠ Add at least one rule"}
                  </p>
                )}
              </div>
            </div>
          </Step>

        </div>
      </div>

      {/* Email preview modal */}
      <AnimatePresence>
        {showPreview && (
          <EmailPreview
            alertName={alertName} frequency={frequency} criteria={criteria}
            stockLimit={stockLimit} emailSubject={emailSubject} emailIntro={emailIntro}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
