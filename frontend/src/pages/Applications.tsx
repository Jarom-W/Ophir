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
import CodeNode, { DataNode } from "../components/Nodes.tsx";


const initialNodes: Node[] = [
  {
    id: "1",
    type: "codeNode",
    data: { label: "App Start", code: `console.log("Start");`, isStart: true },
    position: { x: 300, y: 0 },
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = { codeNode: CodeNode, dataNode: DataNode,};

export default function Applications() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
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
    if (visited.has(id)) return; // prevent infinite loops
    visited.add(id);

    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    // highlight current node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, style: { ...n.style, border: "2px solid green" } }
          : n
      )
    );

    // branch by type
    if (node.type === "codeNode") {
      const code = (node.data as any).code;
      if (code) {
        try {
          // eslint-disable-next-line no-eval
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
    }

    // continue chain with outgoing edges
    const outgoing = edges.filter((e) => e.source === id);
    for (const e of outgoing) {
      await executeNode(e.target);
    }
  };

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
    if (e.key === "Delete" || e.key === "Backspace") {
      const selected = nodes.filter((n: any) => n.selected);

      // Block deletion if start node is selected
      if (selected.some((n) => (n.data as any)?.isStart)) {
        console.log("🚫 Cannot delete start node.");
        e.preventDefault();
        return;
      }

      // Otherwise, delete normally
      const remainingNodes = nodes.filter(
        (n) => !selected.includes(n)
      );

      const remainingEdges = edges.filter(
        (e) =>
          !selected.some(
            (n) => n.id === e.source || n.id === e.target
          )
      );

      setNodes(remainingNodes);
      setEdges(remainingEdges);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [nodes, edges]);


  return (
    <div className="main-container" style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar with draggable items */}
      

      <div className="container" style={{ flex: 1 }}>
        <div className="header">
          <h2>Custom Applications</h2>
        </div>
		<div className="menu">
				<div className="sidebar-container">
					<div className="app-container">
					<div className="new-application">
					+
					</div>
					<div className="blocks-container">
					<Sidebar />
					</div>
				</div>
				</div>
				</div>

        <div className="content">
          <div style={{ width: "100%", height: "90vh" }}>
            <ReactFlow
              nodes={nodes.map((n)=> ({
				...n,
				data: {
					...n.data,
					onRun: runCode,
					onRunChain: runChain,
					onUpdate: updateNode,
				},
			  }))}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
			  //onNodesDelete={onNodesDelete}
			  deleteKeyCode={null}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
			  nodeTypes={nodeTypes}
			  
            >
              <MiniMap />
              <Background />
            </ReactFlow>
          </div>
        </div>

        <div className="footer">
          <h4>Footer</h4>
        </div>
      </div>
    </div>
  );
}
