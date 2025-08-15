import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<main style={{ padding: "1rem" }}>{children}</main>
			<Footer />
		</>
	);
}
				
