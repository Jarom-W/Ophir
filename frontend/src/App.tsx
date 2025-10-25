import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import './App.css';

import Home from "./pages/Home";
import Dash from "./pages/Dash";
import Applications from "./pages/Applications";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="welcome" element={<Home />} />
          <Route path="finance" element={<Dash />} />
          <Route path="about" element={<About />} />
          <Route path="apps" element={<Applications />} />
          <Route path="services" element={<Services />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

