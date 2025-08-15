import React from "react";
import { useState, useEffect } from "react";
import "../styles/FinanceDashboard.css";

export default function FinanceDashboard() {

	const [ticker, setTicker] = useState<string>("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTicker(event.target.value);
	};
	const searchTicker = (event: React.MouseEvent<HTMLButtonElement>) => {
		console.log(ticker);
	};

  return (
    <div className="dashboard-container">
      <h1></h1>

      {/* Search Bar */}
      <div className="search-section">
        <input
       		type="text" 
		placeholder="Enter Ticker Symbol (e.g., AAPL)"
		onChange={handleChange}	       
		value={ticker}
		/>

        <button onClick={searchTicker}>Search</button>
	
      </div>

      {/* Key Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Price</h3>
          <p>$145.32</p>
        </div>
        <div className="stat-card">
          <h3>Market Cap</h3>
          <p>$2.34T</p>
        </div>
        <div className="stat-card">
          <h3>Volume</h3>
          <p>85.2M</p>
        </div>
        <div className="stat-card">
          <h3>52 Week High</h3>
          <p>$179.45</p>
        </div>
        <div className="stat-card">
          <h3>52 Week Low</h3>
          <p>$125.20</p>
        </div>
        <div className="stat-card">
          <h3>P/E Ratio</h3>
          <p>28.3</p>
        </div>
      </div>

      {/* Company Profile + Chart */}
      <div className="content-grid">
        <div className="content-card">
          <h3>Company Profile</h3>
          <p>
            Apple Inc. designs, manufactures, and markets smartphones,
            personal computers, tablets, wearables, and accessories worldwide.
          </p>
        </div>
        <div className="content-card">
          <h3>Snapshot</h3>
          <div className="chart-placeholder">[ Chart Here ]</div>
        </div>
      </div>

      {/* News Section */}
      <div className="content-card news-section">
        <h3>Latest News</h3>
        <ul>
          <li>Apple announces new iPhone model release date.</li>
          <li>Market reacts to quarterly earnings report.</li>
          <li>Apple stock hits new all-time high.</li>
        </ul>
      </div>
    </div>
  );
}
