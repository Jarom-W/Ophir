import React from "react";
import { useState, useEffect } from "react";
import "../styles/FinanceDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Company {
	cik_str: u64;
	ticker: string;
	title: string;
}

export default function Services() {
	// Selected ticker
	const [ticker, setTicker] = useState<string>("");
	// Ticker company data
	const [companies, setCompanies] = useState<Company[]>([]);
	// Loading handler
	const [loading, setLoading] = useState<boolean>(false);
	// Used to hold the suggested results as the user is typing tickers.
	const [suggestions, setSuggestions] = useState<Company[]>([]);
	// Used to handle when tickers aren't found
	const [companyNotFound, setCompanyNotFound] = useState<boolean>(false);

	// Write a useEffect to fetch suggestions whenever the ticker field is changed.
	useEffect(() => {
		const fetchSuggestions = async () => {
			if (ticker.length < 1) {
				setSuggestions([]);
				return;
			}
			try {
				const res = await fetch(`${API_URL}/search?ticker=${ticker}`);
				if (res.ok) {
					const data = await res.json();
					setSuggestions(data);
				}
			} catch (err) {
				console.error("Suggestion fetch failed for ", err);
			}
		};
		const timeout = setTimeout(fetchSuggestions, 300);
		return () => clearTimeout(timeout);
	}, [ticker]);


	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTicker(event.target.value);
	};

	const handleSuggestionClick = (symbol: string, title: string, cik_str: string  ) => {
		setCompanyNotFound(false);
		setTicker(symbol);
		setSuggestions([]);
		setCompanies([{ cik_str, ticker: symbol, title }]);
		setTicker("");
	};

	const searchTicker = async() => {
		setCompanyNotFound(false);
		setLoading(true);
		setCompanies([]);

		try {
			//Probably need to modify this endpoint to send ONE request to fetch ticker and last_filing date
			const res = await fetch(`${API_URL}/search?ticker=${ticker}`);
			if (!res.ok) throw new Error(`HTTP error ${res.status}`);

			const data = await res.json();
			setCompanies(data);
			setTicker("");
			console.log(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setCompanyNotFound(true);
		} finally {
			setLoading(false);
		}
	};



  return (
    <div className="dashboard-container">
      <h1></h1>

      {/* Search Bar */}
      <div className="search-section">
      	<div>
        <input
       		type="text" 
		placeholder="Enter Ticker Symbol (e.g., AAPL)"
		onChange={handleChange}	       
		value={ticker}
		/>
      </div>

	<button
		onClick={searchTicker}
		>Search</button>
	</div>
      {/* Results */}
      <div className="search-results-container">
      {!loading && (ticker.length > 1) && (suggestions.length > 0) && (

	      <div className="search-results">
	      <div className="search-results-text">
	      	<ul>
			{suggestions.map((s) => (
				<li key={s.ticker} onClick={()=> handleSuggestionClick(s.ticker, s.title, s.cik_str)}>
					{s.ticker} - {s.title}
				</li>
			))}
		</ul>
	      </div>
	      </div>
      
      )}

      {loading && <p>Loading...</p>}

	</div>
      {companyNotFound && (
	<div className="company-title-not-found">
		<div className="company-name-container">
		<h2>Sorry, we couldn't find that ticker.</h2>
		</div>
	</div>
		
      )}
      {companies.length >0 && (
      	<div className="company-title">
		<div className="company-name-container">
		<h2>{companies[0].title}</h2>
		</div>
	</div>
      )}

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

