import React from "react";

export default function Footer() {
	return (
		<footer style={{
			textAlign: "center",
			padding: "1rem",
			marginTop: "2rem",
			color: "#ffffff",
			fontSize: "0.9rem"
		}}>
		<p>&copy; {new Date().getFullYear()} . All rights reserved. </p>
		</footer>
	);
}
