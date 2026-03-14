import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Newspaper,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Company {
  cik_str: string;
  ticker: string;
  title: string;
}

// ── Placeholder stat data (replace with real API data) ─────────────────────
const PLACEHOLDER_STATS = [
  { label: "Price",        value: "$145.32", sub: "+2.34 (1.63%)", up: true,  icon: DollarSign },
  { label: "Market Cap",   value: "$2.34T",  sub: "Large Cap",     up: null,  icon: BarChart2  },
  { label: "Volume",       value: "85.2M",   sub: "Avg: 72.1M",    up: true,  icon: Activity   },
  { label: "52W High",     value: "$179.45", sub: "–18.9% below",  up: false, icon: TrendingUp },
  { label: "52W Low",      value: "$125.20", sub: "+16.1% above",  up: true,  icon: TrendingDown},
  { label: "P/E Ratio",    value: "28.3x",   sub: "Sector: 24.1x", up: null,  icon: BarChart2  },
];

const PLACEHOLDER_NEWS = [
  { headline: "Apple announces new iPhone model release date ahead of annual event.", time: "2h ago" },
  { headline: "Market reacts positively to quarterly earnings beat on revenue and EPS.", time: "5h ago" },
  { headline: "Analysts raise price targets following stronger-than-expected guidance.", time: "1d ago" },
];

export default function Dash() {
  const [ticker, setTicker]               = useState<string>("");
  const [companies, setCompanies]         = useState<Company[]>([]);
  const [loading, setLoading]             = useState<boolean>(false);
  const [suggestions, setSuggestions]     = useState<Company[]>([]);
  const [companyNotFound, setCompanyNotFound] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced suggestions fetch
  useEffect(() => {
    if (ticker.length < 1) { setSuggestions([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/search?ticker=${ticker}`);
        if (res.ok) setSuggestions(await res.json());
      } catch (err) {
        console.error("Suggestion fetch failed:", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [ticker]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSuggestionClick = (symbol: string, title: string, cik_str: string) => {
    setCompanyNotFound(false);
    setSuggestions([]);
    setCompanies([{ cik_str, ticker: symbol, title }]);
    setTicker("");
    inputRef.current?.blur();
  };

  const searchTicker = async () => {
    if (!ticker.trim()) return;
    setCompanyNotFound(false);
    setLoading(true);
    setCompanies([]);
    setSuggestions([]);
    try {
      const res = await fetch(`${API_URL}/search?ticker=${ticker}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCompanies(data);
      setTicker("");
    } catch (err) {
      console.error("Fetch error:", err);
      setCompanyNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") searchTicker();
    if (e.key === "Escape") { setSuggestions([]); inputRef.current?.blur(); }
  };

  const clearSearch = () => {
    setTicker("");
    setCompanies([]);
    setCompanyNotFound(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const hasResult = companies.length > 0;

  return (
    <div style={{ background: "var(--navy-950)", minHeight: "100vh", padding: "2.5rem 3rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="label-xs" style={{ marginBottom: "0.5rem" }}>Finance Dashboard</p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              color: "var(--white)",
            }}
          >
            {hasResult ? companies[0].title : "Stock Research"}
          </h1>
          {hasResult && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
              <span className="badge badge-amber">{companies[0].ticker}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--slate-300)",
                }}
              >
                CIK: {companies[0].cik_str}
              </span>
            </div>
          )}
        </div>

        {/* ── Search Bar ── */}
        <div style={{ position: "relative", marginBottom: "2rem", maxWidth: 560 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--navy-800)",
              border: `1px solid ${searchFocused ? "var(--amber-500)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "var(--radius-lg)",
              boxShadow: searchFocused ? "0 0 0 3px rgba(240,165,0,0.12)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              overflow: "visible",
            }}
          >
            <span style={{ padding: "0 0.875rem", color: "var(--slate-300)", display: "flex" }}>
              {loading
                ? <Loader2 size={16} style={{ animation: "spin 0.9s linear infinite" }} color="var(--amber-400)" />
                : <Search size={16} />
              }
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search ticker or company name (e.g. AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--white)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                fontWeight: 500,
                padding: "0.8rem 0",
                letterSpacing: "0.04em",
              }}
            />
            {ticker && (
              <button
                onClick={clearSearch}
                style={{
                  padding: "0 0.875rem",
                  color: "var(--slate-300)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--white)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--slate-300)")}
              >
                <X size={15} />
              </button>
            )}
            <button
              onClick={searchTicker}
              disabled={!ticker.trim() || loading}
              style={{
                margin: "0.3rem",
                padding: "0.5rem 1.25rem",
                background: ticker.trim() ? "var(--amber-500)" : "rgba(255,255,255,0.06)",
                color: ticker.trim() ? "var(--navy-900)" : "var(--slate-300)",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: ticker.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>

          {/* ── Suggestions Dropdown ── */}
          {suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "var(--navy-800)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                zIndex: 50,
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {suggestions.slice(0, 8).map((s, i) => (
                <div
                  key={s.ticker}
                  onClick={() => handleSuggestionClick(s.ticker, s.title, s.cik_str)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    borderBottom: i < suggestions.slice(0, 8).length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="badge badge-amber" style={{ fontSize: "0.6rem" }}>
                      {s.ticker}
                    </span>
                    <span style={{ fontSize: "0.825rem", color: "var(--slate-100)" }}>
                      {s.title}
                    </span>
                  </div>
                  <ChevronRight size={13} color="var(--slate-300)" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Not Found ── */}
        {companyNotFound && (
          <div
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              padding: "1.25rem 1.5rem",
              background: "rgba(240,96,112,0.08)",
              borderColor: "rgba(240,96,112,0.2)",
              marginBottom: "2rem",
            }}
          >
            <X size={16} color="var(--red-400)" />
            <p style={{ fontSize: "0.875rem", color: "var(--red-400)" }}>
              We couldn't find a company matching that ticker. Double-check the symbol and try again.
            </p>
          </div>
        )}

        {/* ── Content (shown once a company is selected) ── */}
        {hasResult && (
          <>
            {/* ── Stat Cards ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {PLACEHOLDER_STATS.map(({ label, value, sub, up, icon: Icon }) => (
                <div key={label} className="card card-sm">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span className="stat-label">{label}</span>
                    <div
                      style={{
                        width: "1.75rem",
                        height: "1.75rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(240,165,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={12} color="var(--amber-400)" />
                    </div>
                  </div>
                  <div className="stat-value" style={{ fontSize: "1.4rem" }}>{value}</div>
                  {sub && (
                    <div
                      style={{
                        marginTop: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color:
                          up === true
                            ? "var(--green-400)"
                            : up === false
                            ? "var(--red-400)"
                            : "var(--slate-300)",
                      }}
                    >
                      {up === true && <ArrowUpRight size={11} />}
                      {up === false && <ArrowDownRight size={11} />}
                      {sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Profile + Chart ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.6fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Company Profile */}
              <div className="card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <Building2 size={14} color="var(--amber-400)" />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--slate-300)",
                    }}
                  >
                    Company Profile
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--white)",
                    marginBottom: "0.625rem",
                  }}
                >
                  {companies[0].title}
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--slate-200)", lineHeight: 1.7 }}>
                  Description and business summary will appear here once connected to
                  the company profile endpoint.
                </p>
              </div>

              {/* Chart Placeholder */}
              <div className="card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <BarChart2 size={14} color="var(--amber-400)" />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--slate-300)",
                    }}
                  >
                    Price Chart
                  </span>
                </div>
                <div
                  style={{
                    height: 180,
                    background: "var(--navy-900)",
                    borderRadius: "var(--radius-md)",
                    border: "1px dashed rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <BarChart2 size={28} color="rgba(136,153,180,0.25)" />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--slate-300)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Chart integration pending
                  </span>
                </div>
              </div>
            </div>

            {/* ── News ── */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                <Newspaper size={14} color="var(--amber-400)" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--slate-300)",
                  }}
                >
                  Latest News
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {PLACEHOLDER_NEWS.map(({ headline, time }, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "0.875rem 0",
                      borderBottom:
                        i < PLACEHOLDER_NEWS.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                    onMouseOver={(e) =>
                      ((e.currentTarget.querySelector(".news-hl") as HTMLElement).style.color =
                        "var(--white)")
                    }
                    onMouseOut={(e) =>
                      ((e.currentTarget.querySelector(".news-hl") as HTMLElement).style.color =
                        "var(--slate-100)")
                    }
                  >
                    <p
                      className="news-hl"
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--slate-100)",
                        lineHeight: 1.55,
                        transition: "color 0.15s",
                      }}
                    >
                      {headline}
                    </p>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--slate-300)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        marginTop: "0.15rem",
                      }}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Empty state (no search yet) ── */}
        {!hasResult && !companyNotFound && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              color: "var(--slate-300)",
            }}
          >
            <Search size={36} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.5,
              }}
            >
              Search a ticker above to load company data
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
