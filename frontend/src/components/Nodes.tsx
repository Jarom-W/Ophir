import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import "../styles/FinanceDashboard.css";

type CodeNodeData = {
  label: string;
  code: string;
  isStart?: boolean;
  onRun?: (code: string) => void;
  onRunChain?: (id: string) => void;
};

type DataNodeData = {
	label: string;
	method: "GET" | "POST" | "PUT" | "DELETE";
	endpoint: string;
	body?: string;
  headers?: string;
	onExecute: (method: string, endpoint: string, body?: string) => void;
};

export default function CodeNode({ id, data }: NodeProps<CodeNodeData>) {
  return (
    <div className="node-main">
      <div className="node-header">{data.label}</div>

      {data.isStart ? (
        <button
          style={{ padding: "4px 8px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #666", cursor: "pointer" }}
          onClick={() => data.onRunChain?.(id)}
        >
          ▶ Run All
        </button>
      ) : (
        <button
          style={{ padding: "4px 8px", marginBottom: "6px", borderRadius: "4px", border: "1px solid #666", cursor: "pointer" }}
          onClick={() => data.onRun?.(data.code)}
        >
          ▶ Run
        </button>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function DataNode({ id, data }: NodeProps<DataNodeData>) {
	const colors: Record<string, string> = {
		GET: "#4CAF50",
		POST: "#2196F3",
		PUT: "#FFC107",
		DELETE: "#F44336",
	};

	return (
    <div
      className="node-main"
      style={{
        border: `2px solid ${colors[data.method]}`,
        borderRadius: "6px",
        padding: "10px",
        background: `${colors[data.method]}20`,
        minWidth: "180px",
      }}
    >
      <div className="node-header" style={{ marginBottom: "4px", color: colors[data.method] }}>
        {data.label}
      </div>
      <div>
        <span style={{ fontWeight: "bold", color: colors[data.method] }}>
          {data.method}
        </span>{" "}
        {data.endpoint}
      </div>

      {data.method !== "GET" && data.body && (
        <pre style={{ marginTop: "6px", fontSize: "12px", background: "#f5f5f5", padding: "4px" }}>
          {data.body}
        </pre>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}