use serde::{Serialize, Deserialize};
use std::sync::Arc;

#[derive(Debug, Clone)]
pub enum Criterion {
    PriceDrop(Option<PriceDrop>),
}

#[derive(Debug, Clone)]
pub struct Alert {
    pub name: String,
    pub criteria: Vec<Criterion>
}

#[derive(Debug, Clone)]
pub struct PriceDrop {
    pub percentage: f64,
    pub time_frame_days: u32,
}
#[derive(Deserialize)]
pub struct SECQueryParams {
    pub period: String,
}
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Debug, Clone)]
pub struct StockData {
    pub ticker: String,
    pub price: f64,
}

#[derive(Clone)]
pub struct AppState {
    pub public_key_pem: Arc<String>,
    pub jwt_signer_url: Arc<String>,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    message: String
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Company {
    pub cik_str: u64,
    pub ticker: String,
    pub title: String,
}
#[derive(Debug, Deserialize)]
pub struct SearchParams {
    pub ticker: String,
}



