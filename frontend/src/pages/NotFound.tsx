import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div style={{ textAlign: "center", marginTop: "5rem" }}>
			<h1>404</h1>
			<p>The page you're looking for doesn't exist.</p>
			<Link to="/" style={{ color: "#1d4ed8" }}>Return Home</Link>
		</div>
	);
}
