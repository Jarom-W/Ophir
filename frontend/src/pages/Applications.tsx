import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type Connection,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "reactflow";
import "reactflow/dist/style.css";
import "../styles/FinanceDashboard.css";

import Sidebar from "../components/Sidebar.tsx";
import type { NodeTemplate } from "../components/Sidebar.tsx";
import CodeNode, { DataNode, IfNode } from "../components/Nodes.tsx";


const initialNodes: Node[] = [
  {
    id: "1",
    type: "codeNode",
    data: { label: "App Start", code: `console.log("Start");`, isStart: true },
    position: { x: 300, y: 0 },
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = { codeNode: CodeNode, dataNode: DataNode, ifNode: IfNode};

export default function Applications() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
  (params: Edge | Connection) => {
    if (!params.source || !params.target) return;

    // preserve handles if they exist
    const edge = {
      ...params,
      id: `reactflow__edge-${params.source}-${params.target}${params.sourceHandle ? '-' + params.sourceHandle : ''}${params.targetHandle ? '-' + params.targetHandle : ''}`
    };

    setEdges((eds) => addEdge(edge, eds));
  },
  [setEdges]
);

const updateNode = (id: string, updates: any) => {
  setNodes(nds =>
    nds.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
    )
  );
};
  // Execute one code snippet
  const runCode = (code: string) => {
    try {
      // eslint-disable-next-line no-eval
      eval(code);
    } catch (err) {
      console.error("Execution error:", err);
    }
  };

 // Execute all nodes in chain starting from given nodeId

  const runChain = (startId: string) => {
  console.log("Running chain from:", startId);

  const visited = new Set<string>();

  const executeNode = async (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);

    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    // highlight current node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, style: { ...n.style, border: "5px solid green", borderRadius: "8px" } }
          : n
      )
    );

    // branch by type
    if (node.type === "codeNode") {
      const code = (node.data as any).code;
      if (code) {
        try {
          eval(code);
        } catch (err) {
          console.error("Execution error:", err);
        }
      }
    } else if (node.type === "dataNode") {
      const { method, endpoint, body } = node.data as any;
      try {
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: method !== "GET" ? body : undefined,
        });
        const json = await res.json().catch(() => null);
        console.log(`📡 ${method} ${endpoint}`, json || res.status);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    } else if (node.type === "ifNode") {
      const condition = (node.data as any).condition?.trim();
      if (!condition) {
        console.log(`⚠️ IF node ${node.id} has no condition, passing by default.`);
        return;
      }

      let result = false;
      try {
        const context: Record<string, any> = { x: 11 };
        const argNames = Object.keys(context);
        const argValues = Object.values(context);

        const func = new Function(...argNames, `return ${condition};`);
        result = !!func(...argValues);
      } catch (err) {
        console.error(`IF node ${node.id} evaluation error:`, err);
      }

      if (!result) {
        console.log(`⛔ IF node ${node.id} stopped execution.`);
        return; // STOP chain
      } else {
        console.log(`✅ IF node ${node.id} passed.`);
      }
    }

    // continue chain with outgoing edges
    const outgoing = edges.filter((e) => e.source === id);
    for (const e of outgoing) {
      await executeNode(e.target);
    }
  };

  // **Call executeNode outside its definition**
  executeNode(startId);
};

const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const raw = event.dataTransfer.getData("application/reactflow");
    if (!raw) return;

    const tpl = JSON.parse(raw);
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      type: tpl.type,
      position,
      data: {
        ...tpl,
        onRun: runCode,
        onRunChain: runChain,
        onUpdate: updateNode,
      },
    };

    setNodes(nds => nds.concat(newNode));
  }, [nodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
const onNodesDelete = useCallback(
  (deleted: Node[]) => {
    const allowedToDelete = deleted.filter(
      (node) => !(node.data as any)?.isStart
    );

    let remainingNodes = [...nodes];

    const newEdges = allowedToDelete.reduce((acc, node) => {
      const incomers = getIncomers(node, remainingNodes, acc);
      const outgoers = getOutgoers(node, remainingNodes, acc);
      const connectedEdges = getConnectedEdges([node], acc);

      const remainingEdges = acc.filter(
        (edge) => !connectedEdges.includes(edge)
      );

      const createdEdges = incomers.flatMap(({ id: source }) =>
        outgoers.map(({ id: target }) => ({
          id: `${source}->${target}`,
          source,
          target,
        }))
      );

      remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

      return [...remainingEdges, ...createdEdges];
    }, edges);

    setNodes(remainingNodes);
    setEdges(newEdges);
  },
  [nodes, edges]
);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only act if the focus is NOT in an input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    const isInputFocused =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    if (isInputFocused) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      const selected = nodes.filter((n: any) => n.selected);

      // Block deletion if start node is selected
      if (selected.some((n) => (n.data as any)?.isStart)) {
        console.log("🚫 Cannot delete start node.");
        e.preventDefault();
        return;
      }

      // Delete selected nodes
      const remainingNodes = nodes.filter((n) => !selected.includes(n));
      const remainingEdges = edges.filter(
        (edge) => !selected.some((n) => n.id === edge.source || n.id === edge.target)
      );

      setNodes(remainingNodes);
      setEdges(remainingEdges);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [nodes, edges]);


const nodeSet1: NodeTemplate[] = [
  
  { type: "dataNode", label: "GET Data", method: "GET", endpoint: "" },
  { type: "dataNode", label: "POST Data", method: "POST", endpoint: "", body: `{"key":"value"}` },
  { type: "dataNode", label: "DELETE Data", method: "DELETE", endpoint: "" },
];

const nodeSet2: NodeTemplate[] = [
  { type: "ifNode", label: "If", condition: "x > 10"},
  { type: "codeNode", label: "Logger", code: `console.log("Logging");` },
  
];

const [currentNodeSet, setCurrentNodeSet] = useState<"set1" | "set2">("set1");

// Choose which nodes to display
const nodesToShow = currentNodeSet === "set1" ? nodeSet1 : nodeSet2;

  return (
    <div className="main-container">
            <div className="sidebar-wrapper">
              <Sidebar nodes={nodesToShow} />
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <button onClick={() => setCurrentNodeSet("set1")}>Data Sourcing</button>
                <button onClick={() => setCurrentNodeSet("set2")}>App Logic</button>
              </div>
            </div>

            <div className="reactflow-wrapper">
              <ReactFlow
                nodes={nodes.map(n => ({
                  ...n,
                  data: { ...n.data, onRun: runCode, onRunChain: runChain, onUpdate: updateNode },
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                deleteKeyCode={null}
                fitView
                nodeTypes={nodeTypes}
                style={{ width: "100%", height: "100%" }}
              >
                <MiniMap />
                <Background />
              </ReactFlow>
            </div>
      </div>
  );
}
