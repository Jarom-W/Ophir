import React, { useState, useEffect } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import "../styles/FinanceDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

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
  dataSource?: string;
  ticker?: string;
  body?: string;
  onUpdate?: (id: string, updates: Partial<DataNodeData>) => void;
};

export default function CodeNode({ id, data }: NodeProps<CodeNodeData>) {
  return (
    <div className="node-main" style={{ background: "#f0f4ff", border: "2px solid #3b82f6", borderRadius: "8px", padding: "10px", minWidth: "160px" }}>
      <div className="node-header" style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "6px" }}>{data.label}</div>
      <button
        style={{
          padding: "6px 12px",
          borderRadius: "4px",
          border: "1px solid #666",
          cursor: "pointer",
          background: "#3b82f6",
          color: "#fff",
          fontWeight: "bold",
        }}
        onClick={() => (data.isStart ? data.onRunChain?.(id) : data.onRun?.(data.code))}
      >
        ▶ {data.isStart ? "Run All" : "Run"}
      </button>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function DataNode({ id, data }: NodeProps<DataNodeData>) {
  const [dataSource, setDataSource] = useState(data.dataSource || "");
  const [ticker, setTicker] = useState(data.ticker || "");
  const [endpoint, setEndpoint] = useState(data.endpoint || "");

  const colors: Record<string, string> = {
    GET: "#4CAF50",
    POST: "#2196F3",
    PUT: "#FFC107",
    DELETE: "#F44336",
  };

  const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDataSource(value);
    data.onUpdate?.(id, { dataSource: value });
  };

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTicker(value);
    data.onUpdate?.(id, { ticker: value });
  };

  useEffect(() => {
    if (!dataSource) return;

    let newEndpoint = "";
    switch (dataSource) {
      case "stock":
        newEndpoint = `${API_URL}/quote/${ticker}`;
        break;
      case "fundamentals":
        newEndpoint = `${API_URL}/fundamentals?ticker=${ticker}`;
        break;
      case "sec":
        newEndpoint = `${API_URL}/search?ticker=${ticker}`;
        break;
      case "options":
        newEndpoint = `https://api.example.com/options/${ticker}`;
        break;
      case "econ":
        newEndpoint = `https://api.example.com/econ`;
        break;
    }

    setEndpoint(newEndpoint);
    data.onUpdate?.(id, { endpoint: newEndpoint });
  }, [dataSource, ticker]);

  return (
    <div
      className="node-main"
      style={{
        border: `2px solid ${colors[data.method]}`,
        borderRadius: "8px",
        padding: "10px",
        background: `${colors[data.method]}20`,
        minWidth: "200px",
      }}
    >
      <div className="node-body">
        <div className="node-header" style={{ fontWeight: "bold", color: colors[data.method], marginBottom: "6px" }}>
          {data.method} DATA FROM:
        </div>

        <select
          value={dataSource}
          onChange={handleDataSourceChange}
          style={{ marginTop: "6px", width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">-- Select Data Source --</option>
          <option value="sec">SEC Filings</option>
          <option value="stock">Stock Data</option>
          <option value="options">Options Data</option>
          <option value="fundamentals">Company Fundamentals</option>
          <option value="econ">Economic Data</option>
        </select>

        {!["", "econ"].includes(dataSource) && (
          <input
            type="text"
            placeholder="Enter ticker"
            value={ticker}
            onChange={handleTickerChange}
            style={{
              marginTop: "6px",
              width: "100%",
              padding: "4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        )}

        {data.method !== "GET" && data.body && (
          <pre
            style={{
              marginTop: "6px",
              fontSize: "12px",
              background: "#f5f5f5",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            {data.body}
          </pre>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
