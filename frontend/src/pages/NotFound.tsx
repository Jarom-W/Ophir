import React from "react";
import { Link } from "react-router-dom";
import { TrendingDown, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy-950)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
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

      {/* Amber glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(240,165,0,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 520 }}>
        {/* Giant 404 */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(6rem, 18vw, 10rem)",
            fontWeight: 700,
            lineHeight: 1,
            color: "transparent",
            backgroundImage: "linear-gradient(135deg, rgba(240,165,0,0.15), rgba(240,165,0,0.04))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            userSelect: "none",
            marginBottom: "0.25rem",
            letterSpacing: "-0.04em",
          }}
        >
          404
        </div>

        {/* Icon */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "var(--radius-lg)",
            background: "rgba(240,165,0,0.08)",
            border: "1px solid rgba(240,165,0,0.2)",
            marginBottom: "1.5rem",
          }}
        >
          <TrendingDown size={22} color="var(--amber-400)" />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            color: "var(--white)",
            marginBottom: "0.75rem",
          }}
        >
          Page not found.
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--slate-200)",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          This page doesn't exist or may have been moved.
          Check the URL or navigate back to the dashboard.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/welcome"
            style={{ textDecoration: "none" }}
          >
            <button
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ArrowLeft size={15} />
              Back to Home
            </button>
          </Link>
          <Link to="/finance" style={{ textDecoration: "none" }}>
            <button
              className="btn btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Search size={15} />
              Open Dashboard
            </button>
          </Link>
        </div>

        {/* Mono footnote */}
        <p
          style={{
            marginTop: "2.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--slate-300)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Error 404 · Page Not Found
        </p>
      </div>
    </div>
  );
}
