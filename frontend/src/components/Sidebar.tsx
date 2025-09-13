// Sidebar.tsx
import React from "react";

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, code: string) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ type: nodeType, label, code }));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside style={{ padding: "1rem", borderRight: "1px solid #ccc" }}>
      <h4 className="blocks-heading">Drag Nodes</h4>
      <div
        onDragStart={(e) => onDragStart(e, "codeNode", "Print 'Hello World'", `console.log("Hello World");`)}
        draggable
        style={{ padding: "8px", margin: "4px 0", background: "#eee", cursor: "grab" }}
      >
        Print Node
      </div>

      <div
        onDragStart={(e) => onDragStart(e, "codeNode", "Set x = 5", `let x = 5; console.log("x =", x);`)}
        draggable
        style={{ padding: "8px", margin: "4px 0", background: "#eee", cursor: "grab" }}
      >
        Variable Node
      </div>
    </aside>
  );
}
