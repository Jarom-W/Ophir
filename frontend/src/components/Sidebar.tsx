// Sidebar.tsx
import React from "react";
import "../styles/FinanceDashboard.css"

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, code: string) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ type: nodeType, label, code }));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="nodes-sidebar">
      <h4 className="blocks-heading">Drag Nodes</h4>
      <div
        onDragStart={(e) => onDragStart(e, "codeNode", "Print 'Hello World'", `console.log("Hello World");`)}
        draggable
        className="sidebar-node-label"
      >
        Print Node
      </div>

      <div
        onDragStart={(e) => onDragStart(e, "codeNode", "Set x = 5", `let x = 5; console.log("x =", x);`)}
        draggable
        className="sidebar-node-label"
      >
        Variable Node
      </div>

      <div
        onDragStart={(e) => onDragStart(e, "codeNode", "Print 'Working'", `let x = "Working"; console.log("x =", x);`)}
        draggable
        className="sidebar-node-label"
      >
        Print "Working"
      </div>
    </aside>
  );
}
