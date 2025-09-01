import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { useState, useEffect } from 'react'
import './App.css'


// Pages

import Home from "./pages/Home";
import Dash from "./pages/Dash";
import Applications from "./pages/Applications";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
	return(
		<Router>
			<MainLayout>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/finance" element={<Dash />} />
					<Route path="/about" element={<About />} />
					<Route path="/apps" element={<Applications />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</MainLayout>
		</Router>
	);
}
