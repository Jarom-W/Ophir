use axum::{Router,extract::{Path, Query}, http::StatusCode ,routing::get,Json, response::{IntoResponse}};
use reqwest::Client;
use std::collections::HashMap;
use crate::models::{SearchParams, Company, StockData, Criterion, Alert, SECQueryParams, ErrorResponse};
use crate::error::AppError;
use std::env;
use serde_json::Value;
use yahoo_finance_api as yahoo;
use anyhow;


pub fn finance_routes() -> Router {
    Router::new()
        .route("/test", get(|| async {"API is live." }))
        .route("/search", get(search_ticker))
        .route("/fundamentals", get(retrieve_fundamentals))
        .route("/latest/:cik", get(fetch_filings))
        .route("/quote/:ticker", get(retrieve_quote))
}
/* Data fetching logic:
 * User queries a ticker for fundamentals
 * Backend checks database for entry. 
 * If entry exists, then it checks to see if the date stamped on the data is the most recent
 * quarter
 * This is accomplished by querying the SEC endpoint and corroborating the last filing/quarter
 * date.
 */

//SEC Fields: primaryDocDescription + tickers

// Explore using Yahoo Finance in Rust for simple KPI automation like stock email list.

//Write a quote endpoint.

// ---
//
// Need to ingest stock data and store all the KPIs into a vector of StockData types
// Write a function that:
// Makes an API call to Polygon.io ( or yahoo_finance_api crate )
// Parses response into desired stock data fields defined in the struct
// compares with established criteria.
//

/*
pub fn evaluate_alerts(alert: &Alert, stocks: &[StockData]) -> Vec<StockData> {
    stocks
        .iter()
        .filter(|s| {
            alert.criteria.iter().all(|criterion| match criterion {
                Criterion::PriceDrop(Some(c)) => s.percentage >= c.percentage,
                _ => true,
            })
        })
        .cloned()
        .collect()
}
*/
pub async fn retrieve_quote(axum::extract::Path(ticker): axum::extract::Path<String>) -> Result<impl IntoResponse, AppError> {
    let provider = yahoo::YahooConnector::new().unwrap();

    let response = provider
        .get_latest_quotes(&ticker, "1d")
        .await
        .unwrap();

    let quote = response.last_quote().unwrap();
    Ok(Json(quote.close))
}

pub async fn fetch_filings(
    Path(cik): Path<String>,
    Query(params): Query<SECQueryParams>,
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    let period = params.period.as_deref().unwrap_or("quarter");


    // Validate period
    if period != "quarter" && period != "annual" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Invalid period: must be 'quarter' or 'annual'".into(),
            }),
        ));
    }

    // Fetch SEC filings
    let client = Client::new();
    let url = format!("https://data.sec.gov/submissions/CIK{}.json", cik);

    let res = client
        .get(&url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Request failed: {}", e),
                }),
            )
        })?
        .error_for_status()
        .map_err(|e| {
            (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: format!("SEC API returned error: {}", e),
                }),
            )
        })?;

    let json: Value = res.json().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to parse JSON: {}", e),
            }),
        )
    })?;

    let recent = &json["filings"]["recent"];

    let forms = recent["form"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "No form data found".into(),
            }),
        )
    })?;
    let accession = recent["accessionNumber"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "No accession numbers found".into(),
            }),
        )
    })?;
    let filing_date = recent["filingDate"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "No filing dates found".into(),
            }),
        )
    })?;
    let primary_doc = recent["primaryDocument"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "No primary documents found".into(),
            }),
        )
    })?;

    let target_form = match period {
        "quarter" => "10-Q",
        "annual" => "10-K",
        _ => unreachable!(),
    };

    let idx = forms
        .iter()
        .position(|v| v.as_str() == Some(target_form))
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: format!("No {} filings found", target_form),
                }),
            )
        })?;

    let acc = accession[idx].as_str().unwrap();
    let acc_nodash = acc.replace("-", "");
    let primary = primary_doc[idx].as_str().unwrap();
    let date = filing_date[idx].as_str().unwrap();

    let filing_url = format!(
        "https://www.sec.gov/Archives/edgar/data/{}/{} /{}",
        cik.trim_start_matches('0'),
        acc_nodash,
        primary
    );

    let out = serde_json::json!({
        "cik": cik,
        "form": target_form,
        "filing_date": date,
        "accession_number": acc,
        "filing_url": filing_url
    });

    Ok(Json(out))
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

