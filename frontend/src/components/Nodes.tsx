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
