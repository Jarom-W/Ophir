import React from "react";
import { FiShield, FiZap, FiDatabase } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-16 px-6">
      {/* Hero Section */}
      <div className="max-w-4xl text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          TradeStep / Investep
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Enterprise-grade stock alert and authentication platform built for
          speed, security, and scalability.
        </p>
        <div className="mt-8">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-colors">
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col items-start">
          <FiShield className="w-10 h-10 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Authentication</h3>
          <p className="text-gray-600">
            JWT-based login system with cookies ensures enterprise-level security.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col items-start">
          <FiZap className="w-10 h-10 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">High Performance</h3>
          <p className="text-gray-600">
            Backend powered by Rust ensures fast and reliable API responses for all operations.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col items-start">
          <FiDatabase className="w-10 h-10 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Scalable Architecture</h3>
          <p className="text-gray-600">
            Modular design allows future expansion for alerts, analytics, and reporting.
          </p>
        </div>
      </div>

      {/* Optional Call-to-Action */}
      <div className="mt-16 max-w-4xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Ready to start building alerts?
        </h2>
        <p className="text-gray-600 mb-6">
          Configure your custom stock alert newsletters and receive timely updates.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-colors">
          Create Your First Alert
        </button>
      </div>
    </div>
  );
}

