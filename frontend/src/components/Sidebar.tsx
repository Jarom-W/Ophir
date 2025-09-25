// Sidebar.tsx
import React from "react";

export type NodeTemplate = {
  type: string;
  label: string;
  code?: string;
  method?: string;
  endpoint?: string;
  body?: string;
};

const methodColors: Record<string, string> = {
  GET: "#4CAF50",
  POST: "#2196F3",
  PUT: "#FFC107",
  DELETE: "#F44336",
};

interface SidebarProps {
  nodes: NodeTemplate[];
}

export default function Sidebar({ nodes }: SidebarProps) {
  return (
    <aside
      style={{
        padding: "1rem",
        display: "flex",
        width: "20vw",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h4 style={{ marginBottom: "8px", color: "white", textAlign: "center" }}>
        Available Blocks
      </h4>
      {nodes.map((tpl, i) => (
        <div
          key={i}
          draggable
          onDragStart={(event) =>
            event.dataTransfer.setData("application/reactflow", JSON.stringify(tpl))
          }
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: `2px solid ${tpl.method ? methodColors[tpl.method] : "#666"}`,
            background: tpl.method ? `${methodColors[tpl.method]}20` : "#f0f0f0",
            cursor: "grab",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            fontWeight: 600,
            fontSize: "14px",
            color: tpl.method ? methodColors[tpl.method] : "#333",
            transition: "transform 0.1s ease",
            textAlign: "center",
            height: "5vh",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {tpl.label}
          {tpl.endpoint && (
            <div style={{ fontSize: "10px", color: "#555", marginTop: "4px", wordBreak: "break-word" }}>
              {tpl.endpoint}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}
