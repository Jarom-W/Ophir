import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import "../styles/FinanceDashboard.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    data: { label: "Print 'Hello World'" },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    data: { label: "Set x = 5" },
    position: { x: 400, y: 100 },
  },
];

const initialEdges: Edge[] = [];

export default function Applications () {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const onConnect = useCallback(
		(params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
  );
	return (
		<div className="main-container">
		<div className="container">
			<div className="header">
				<h2>Apps</h2></div>
			<div className="menu">
				<div className="sidebar-container">
					<div className="app-container">
					<div className="new-application">
					+
					</div>
				</div>
				</div>
				</div>
			<div className="content">
				<div style={{ width: "100%", height: "90vh" }}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						fitView
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
