import React from "react";
import "../styles/FinanceDashboard.css";

export default function Sidebar() {
  // define onDragStart once
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    payload: Record<string, any>
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: nodeType, ...payload })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="nodes-sidebar">
      <h4 className="blocks-heading">Drag Nodes</h4>

      {/* Code Nodes */}
      <div
        onDragStart={(e) =>
          onDragStart(e, "codeNode", {
            label: "Print 'Hello World'",
            code: `console.log("Hello World");`,
          })
        }
        draggable
        className="sidebar-node-label"
      >
        Print Node
      </div>

      <div
        onDragStart={(e) =>
          onDragStart(e, "codeNode", {
            label: "Set x = 5",
            code: `let x = 5; console.log("x =", x);`,
          })
        }
        draggable
        className="sidebar-node-label"
      >
        Variable Node
      </div>

      <div
        onDragStart={(e) =>
          onDragStart(e, "codeNode", {
            label: 'Print "Working"',
            code: `let x = "Working"; console.log("x =", x);`,
          })
        }
        draggable
        className="sidebar-node-label"
      >
        Print "Working"
      </div>

      <div
        onDragStart={(e) =>
          onDragStart(e, "dataNode", {
              label: "Pull SEC Data",
              method: "GET",
              endpoint: "https://data.sec.gov/submissions/CIK0000320193.json",
              headers: {
                "User-Agent": "JaromWardwell (jaromwardwell@gmail.com)",
              },
            })
        }
        draggable
        className="sidebar-node-label"
      >
        Pull SEC Data
      </div>

      <div
        onDragStart={(e) =>
          onDragStart(e, "dataNode", {
            label: "POST User",
            method: "POST",
            endpoint: "https://data.sec.gov/submissions/CIK0000320193.json",
            body: JSON.stringify({ name: "New User" }),
          })
        }
        draggable
        className="sidebar-node-label"
      >
        Data: POST User
      </div>
    </aside>
  );
}
