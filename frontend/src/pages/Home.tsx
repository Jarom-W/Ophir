import React, { useEffect, useRef } from "react";
import {
  ArrowRight,
  TrendingUp,
  Bell,
  FileDown,
  Shield,
  Zap,
  Database,
  BarChart2,
  Mail,
  ChevronRight,
} from "lucide-react";

//Animated Tickers
//Logic: Refresh every 5 seconds. Compare previous value 

const API_URL = `http://127.0.0.1:8000`

type Quotes = {
  [ticker: string]: number;
};

const TICKER_DATA = [
  { sym: "AAPL",  price: "189.42",  chg: "+1.23%",  up: true },
  { sym: "MSFT",  price: "412.18",  chg: "+0.87%",  up: true },
  { sym: "NVDA",  price: "875.30",  chg: "-2.41%",  up: false },
  { sym: "GOOGL", price: "174.65",  chg: "+0.52%",  up: true },
  { sym: "TSLA",  price: "247.10",  chg: "-1.08%",  up: false },
  { sym: "JPM",   price: "209.34",  chg: "+0.31%",  up: true },
  { sym: "AMZN",  price: "196.88",  chg: "+1.74%",  up: true },
  { sym: "META",  price: "528.01",  chg: "+2.10%",  up: true },
  { sym: "BRK.B", price: "396.22",  chg: "-0.12%",  up: false },
  { sym: "XOM",   price: "115.47",  chg: "+0.68%",  up: true },
];

function TickerItem({ sym, price, chg, up }: typeof TICKER_DATA[0]) {
  return (
    <span className="ticker-item">
      <span className="ticker-symbol">{sym}</span>
      <span className="ticker-price">{price}</span>
      <span className={`ticker-change ${up ? "up" : "down"}`}>{chg}</span>
    </span>
  );
}

// ─── Feature card data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BarChart2,
    title: "Granular Screening",
    description:
      "Filter by balance sheet line items, income statement metrics, cash flow ratios, options greeks, and technical signals — all in one unified query builder.",
  },
  {
    icon: Mail,
    title: "Scheduled Digests",
    description:
      "Configure custom alert criteria and receive a curated list of matching stocks in your inbox, daily or weekly. Set it once, stay informed forever.",
  },
  {
    icon: FileDown,
    title: "Export Anywhere",
    description:
      "Dump filtered results directly into a structured Excel workbook or export a formatted PDF report — no more copy-pasting from Yahoo Finance.",
  },
  {
    icon: Zap,
    title: "Rust-Powered Backend",
    description:
      "Sub-millisecond query resolution on live and historical financial data, backed by a high-performance Rust API designed for institutional load.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "JWT authentication with httpOnly cookies, row-level data isolation, and audit logs baked in from day one.",
  },
  {
    icon: Database,
    title: "Comprehensive Data",
    description:
      "Real-time price feeds, full fundamental datasets going back 10+ years, and technical indicators computed fresh on every query.",
  },
];

// ─── Workflow steps ───────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Build Your Screen",
    body: "Combine price targets, fundamental thresholds, technical signals, and dividend criteria using our visual rule builder.",
  },
  {
    num: "02",
    title: "Set Your Schedule",
    body: "Choose daily or weekly delivery. We scan the full market against your rules and compile only the stocks that qualify.",
  },
  {
    num: "03",
    title: "Receive & Export",
    body: "Get a clean email digest, then export matching stocks to Excel or PDF with exactly the columns you care about.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {

  const [quotes, setQuotes] = useState<Quotes>({});

  const fetchQuotes = async () => {
    try {
      const res = await fetch(
        `${API_URL}/v1/quote?ticker=AAPL&ticker=MSFT`
      );

      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      console.error("Failed to fetch quotes", err);
    }
  };

  useEffect(() => {
    fetchQuotes();

    const interval = setInterval(fetchQuotes, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "var(--navy-950)", minHeight: "100vh" }}>
      {/* ── Ticker Tape ── */}
      <div className="ticker-tape">
        <div className="ticker-tape-inner">
          {[...TICKER_DATA, ...TICKER_DATA].map((t, i) => (
            <TickerItem key={i} {...t} />
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "5rem 3rem 4rem",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Background grid texture */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 780 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge badge-amber">
              <TrendingUp size={10} />
              Now in Beta
            </span>
            <span
              className="font-mono"
              style={{ fontSize: "0.7rem", color: "var(--slate-300)" }}
            >
              Rust API · Real-time Data · Institutional Grade
            </span>
          </div>

          <h1 className="display" style={{ marginBottom: "1.5rem" }}>
            Stop copy-pasting.<br />
            <em>Start screening.</em>
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--slate-200)",
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: "2.5rem",
            }}
          >
            Build custom stock filters using balance sheet line items, technicals,
            and options data. Schedule email digests of matching stocks. Export to
            Excel or PDF in one click.
          </p>

          <div className="flex items-center gap-3">
            <button className="btn btn-primary btn-lg">
              Build Your First Alert
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-lg">
              View Demo
            </button>
          </div>

          {/* Social proof micro-line */}
          <p
            style={{
              marginTop: "2rem",
              fontSize: "0.75rem",
              color: "var(--slate-300)",
              fontFamily: "var(--font-mono)",
            }}
          >
            No credit card required · Free during beta
          </p>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "var(--navy-900)",
          padding: "2rem 3rem",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}
        >
          {[
            { v: "8,000+",  l: "Equities Screened"     },
            { v: "120+",    l: "Fundamental Fields"     },
            { v: "<5ms",    l: "Avg. Query Response"    },
            { v: "10yr",    l: "Historical Data Depth"  },
          ].map(({ v, l }) => (
            <div key={l} className="stat-block">
              <span className="stat-value">{v}</span>
              <span className="stat-label">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: "5rem 3rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p className="label-xs" style={{ marginBottom: "0.75rem" }}>
            Platform Capabilities
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              color: "var(--white)",
            }}
          >
            Everything your spreadsheet can't do.
          </h2>
        </div>

        <div className="grid-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card" style={{ cursor: "default" }}>
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(240,165,0,0.1)",
                  border: "1px solid rgba(240,165,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <Icon size={18} color="var(--amber-400)" />
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--white)",
                  marginBottom: "0.5rem",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--slate-200)", lineHeight: 1.65 }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        style={{
          padding: "5rem 3rem",
          background: "var(--navy-900)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <p className="label-xs" style={{ marginBottom: "0.75rem" }}>
              Workflow
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                color: "var(--white)",
              }}
            >
              Three steps to a smarter inbox.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {STEPS.map(({ num, title, body }) => (
              <div key={num} style={{ position: "relative" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "3.5rem",
                    fontWeight: 700,
                    color: "rgba(240,165,0,0.12)",
                    lineHeight: 1,
                    marginBottom: "1rem",
                    userSelect: "none",
                  }}
                >
                  {num}
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "var(--white)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--slate-200)", lineHeight: 1.65 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 3rem", maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="card card-accent"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <p className="label-xs" style={{ marginBottom: "1rem" }}>
            Get Started Today
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              marginBottom: "1rem",
              color: "var(--white)",
            }}
          >
            Your analyst. Automated.
          </h2>
          <p
            style={{
              color: "var(--slate-200)",
              maxWidth: 480,
              margin: "0 auto 2rem",
              fontSize: "1rem",
              lineHeight: 1.7,
            }}
          >
            Join investors who stopped copy-pasting data and started receiving
            exactly what they needed, when they needed it.
          </p>
          <button className="btn btn-primary btn-lg">
            Create Your Free Account
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
