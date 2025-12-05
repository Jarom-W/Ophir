use serde::{Serialize, Deserialize};

#[derive(Deserialize)]
pub struct SECQueryParams {
    pub period: String,
    pub num_filings: usize,
}
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
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



