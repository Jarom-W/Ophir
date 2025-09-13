import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";

type CodeNodeData = {
  label: string;
  code: string;
  isStart?: boolean;
  onRun?: (code: string) => void;
  onRunChain?: (id: string) => void;
};

export default function CodeNode({ id, data }: NodeProps<CodeNodeData>) {
  return (
    <div style={{ padding: "10px", border: "1px solid #333", borderRadius: "8px", background: "#f9f9f9" }}>
      <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{data.label}</div>

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
