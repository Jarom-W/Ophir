import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // adjust path as needed

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}

