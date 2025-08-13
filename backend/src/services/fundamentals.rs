use axum::{Json, extract::Path};
use serde::Serialize;

#[derive(Serialize)]
pub struct StockSummary {
    symbol: String,
    market_cap: f64,
    pe_ratio: f64,
    earnings_growth: f64,
}

pub async fn get_stock_summary(Path(symbol): Path<String>) -> Json<StockSummary> {
    Json(StockSummary {
        symbol,
        market_cap: 520_000_000_000.0,
        pe_ratio: 24.3,
        earnings_growth: 0.08,
    })
}

