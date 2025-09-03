use axum::{Router,extract::Query,routing::get,Json, response::IntoResponse};
use std::collections::HashMap;
use crate::models::{SearchParams, Company};
use crate::error::AppError;

pub fn finance_routes() -> Router {
    Router::new()
        .route("/test", get(|| async {"API is live." }))
        .route("/search", get(search_ticker))
}
pub async fn search_ticker(
    Query(params): Query<SearchParams>,
    ) -> Result<impl IntoResponse, AppError> {

    let client = reqwest::Client::new();
    let res = client
        .get("https://www.sec.gov/files/company_tickers.json")
        .header("User-Agent", "my-rust-app/0.1 jaromwardwell@gmail.com")
        .send()
        .await?
        .text()
        .await?;

    let map: HashMap<String, Company> = serde_json::from_str(&res)?;

    let results: Vec<Company> = map
        .into_values()
        .filter(|c| c.ticker.eq_ignore_ascii_case(&params.ticker))
        .collect();

    if results.is_empty() {
        return Err(AppError::NotFound(format!(
                    "No company found for ticker {}",
                    params.ticker
        )));
    }

    Ok(Json(results))

}

