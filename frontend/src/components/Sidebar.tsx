import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  BarChart2,
  Briefcase,
  Info,
  LogOut,
  TrendingUp,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/welcome",  label: "Home",        icon: LayoutDashboard },
  { to: "/finance",  label: "Dashboard",   icon: BarChart2       },
  { to: "/services", label: "Alerts",      icon: Bell            },
  { to: "/apps",     label: "Tools",       icon: Briefcase       },
  { to: "/about",    label: "About",       icon: Info            },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session, redirect to login
    navigate("/");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <TrendingUp size={18} color="var(--amber-400)" />
          Trade<span className="accent">Step</span>
        </div>
        <p className="sidebar-tagline">Institutional Screening</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-section">
        <p className="sidebar-section-label">Navigation</p>
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-plan">Pro Plan</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link btn-ghost"
          style={{
            width: "100%",
            marginTop: "0.5rem",
            color: "var(--slate-300)",
            fontSize: "0.8rem",
          }}
        >
          <LogOut size={14} className="nav-icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
