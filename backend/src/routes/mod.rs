use axum::{Router,extract::Query,routing::get,Json, response::IntoResponse};
use std::collections::HashMap;
use crate::models::{SearchParams, Company, Filing};
use crate::error::AppError;
use std::env;
use serde_json::Value;

pub fn finance_routes() -> Router {
    Router::new()
        .route("/test", get(|| async {"API is live." }))
        .route("/search", get(search_ticker))
        .route("/fundamentals", get(retrieve_fundamentals))
        .route("/last_quarter/:cik", get(last_quarter))
}

pub async fn last_quarter(axum::extract::Path(cik): axum::extract::Path<String>) -> Result<impl IntoResponse, AppError> {
    let url = format!("https://data.sec.gov/submissions/CIK{}.json", cik);

    let client = reqwest::Client::new();

    let res = client
        .get(&url)
        .header("User-Agent", "JaromWardwell (jaromwardwell@gmail.com)")
        .send()
        .await?;

    if !res.status().is_success() {
        return Err(AppError::NotFound(format!(
                    "SEC API returned {} for {}",
                    res.status(),
                    cik
        )));
    }
    let body: Value = res.json().await?;

    Ok(Json(body))
}

pub async fn retrieve_fundamentals(
    Query(params): Query<SearchParams>,
) -> Result<impl IntoResponse, AppError> {

    let client = reqwest::Client::new();

    let api_key = env::var("POLYGON_API_KEY")
        .map_err(|_| AppError::NotFound("Missing POLYGON_API_KEY".into()))?;

    let url = format!(
        "https://api.polygon.io/vX/reference/financials?ticker={}&order=asc&limit=10&sort=filing_date&apiKey={}",
        params.ticker,
        api_key
    );
    let res = client.get(&url).send().await?;

    if !res.status().is_success() {
        return Err(AppError::NotFound(format!(
                    "Polygon API returned {} for {}",
                    res.status(),
                    params.ticker
                    )));
    }
    let body: Value = res.json().await?;

    Ok(Json(body))
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

