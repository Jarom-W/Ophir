import React from "react";
import { TrendingUp, Zap, Shield, BarChart2, Users, Globe } from "lucide-react";

const TEAM = [
  {
    initials: "JD",
    name: "Founder & CEO",
    bio: "Financial Economics background. Built this after watching too many people copy-paste Yahoo Finance data into Excel for hours each week.",
  },
  {
    initials: "RS",
    name: "Lead Engineer",
    bio: "Systems engineer with a focus on high-performance data pipelines. Designed the Rust backend to handle institutional query loads at sub-millisecond speed.",
  },
  {
    initials: "MK",
    name: "Data & Quant",
    bio: "Former sell-side analyst. Owns the fundamental data model, ratio definitions, and the accuracy of every number you see on this platform.",
  },
];

const VALUES = [
  {
    icon: BarChart2,
    title: "Data Integrity First",
    body: "Every field is sourced, defined, and verified. We'd rather show nothing than show a wrong number.",
  },
  {
    icon: Zap,
    title: "Speed as a Feature",
    body: "Our Rust API isn't a flex — it's a promise. Screens that used to take minutes should feel instant.",
  },
  {
    icon: Shield,
    title: "No Noise",
    body: "We don't sell your data, serve ads, or surface sponsored results. Your screen, your signal.",
  },
  {
    icon: Globe,
    title: "Built for Everyone",
    body: "From retail investors to portfolio managers. If you care about fundamentals, this tool is for you.",
  },
];

export default function About() {
  return (
    <div style={{ background: "var(--navy-950)", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "4.5rem 3rem 3.5rem",
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Grid texture */}
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

        <div style={{ position: "relative", maxWidth: 680 }}>
          <div style={{ marginBottom: "1rem" }}>
            <span
              className="badge badge-amber"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Users size={10} />
              Our Story
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              color: "var(--white)",
              lineHeight: 1.08,
              marginBottom: "1.5rem",
            }}
          >
            Built out of frustration<br />
            with <span style={{ color: "var(--amber-400)", fontStyle: "italic" }}>manual data work.</span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--slate-200)",
              lineHeight: 1.75,
              maxWidth: 580,
            }}
          > Lorem Ipsum
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* ── Values ── */}
      <section style={{ padding: "4rem 3rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p
            className="label-xs"
            style={{ marginBottom: "0.625rem" }}
          >
            What We Stand For
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              color: "var(--white)",
            }}
          >
            Principles that ship in the product.
          </h2>
        </div>

        <div className="grid-2">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="card"
              style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(240,165,0,0.1)",
                  border: "1px solid rgba(240,165,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                <Icon size={15} color="var(--amber-400)" />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "0.975rem",
                    fontWeight: 600,
                    color: "var(--white)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--slate-200)", lineHeight: 1.65 }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* ── Team ── */}
      <section
        style={{
          padding: "4rem 3rem",
          background: "var(--navy-900)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <p className="label-xs" style={{ marginBottom: "0.625rem" }}>
              The Team
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                color: "var(--white)",
              }}
            >
              Small team. Serious product.
            </h2>
          </div>

          <div className="grid-3">
            {TEAM.map(({ initials, name, bio }) => (
              <div key={name} className="card card-sm">
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--amber-500), var(--amber-300))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--navy-900)",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--white)",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--amber-400)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      TradeStep
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: "0.825rem", color: "var(--slate-200)", lineHeight: 1.65 }}>
                  {bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack transparency ── */}
      <section style={{ padding: "4rem 3rem", maxWidth: 1100, margin: "0 auto" }}>
        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div>
            <p className="label-xs" style={{ marginBottom: "0.75rem" }}>
              Tech Stack
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 2vw, 1.875rem)",
                color: "var(--white)",
                marginBottom: "1rem",
              }}
            >
              Built for performance,<br />not just aesthetics.
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-200)", lineHeight: 1.7 }}>
              The backend is written entirely in Rust for maximum throughput and
              memory safety. The frontend is React + TypeScript. Data is refreshed
              continuously from primary sources — no stale cache, no third-party
              data laundering.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Backend",   value: "Rust (Axum / Tokio)"        },
              { label: "Frontend",  value: "React + TypeScript"         },
              { label: "Auth",      value: "Supabase (JWT / RLS)"       },
              { label: "Data",      value: "SEC EDGAR + Market Feeds"   },
              { label: "Delivery",  value: "Scheduled Email Digests"    },
              { label: "Export",    value: "Excel (.xlsx) · PDF"        },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--slate-300)",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--white)",
                    fontWeight: 500,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
