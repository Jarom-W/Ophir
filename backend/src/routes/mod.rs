use axum::{Router,extract::{Path, Query}, http::StatusCode ,routing::get,Json, response::{IntoResponse}};
use reqwest::Client;
use std::collections::HashMap;
use crate::models::{SearchParams, Company, SECQueryParams, ErrorResponse};
use crate::error::AppError;
use crate::utils::map_us_gaap_to_rich;
use quick_xml::Reader;
use quick_xml::events::Event;
use std::{env};
use serde_json::{Value, json};
use yahoo_finance_api as yahoo;
use flate2::read::GzDecoder;
use std::io::Read;
use anyhow;


pub fn finance_routes() -> Router {
    Router::new()
        .route("/test", get(|| async {"API is live." }))
        .route("/search", get(search_ticker))
        .route("/latest/:cik", get(latest_filing))
        .route("/latest_raw/:cik", get(latest_filing_raw))
        .route("/quote/:ticker", get(retrieve_quote))
        .route("/latest_filings/:cik", get(latest_n_filings))
}


pub async fn retrieve_quote(axum::extract::Path(ticker): axum::extract::Path<String>) -> Result<impl IntoResponse, AppError> {
    let provider = yahoo::YahooConnector::new().unwrap();

    let response = provider
        .get_latest_quotes(&ticker, "1d")
        .await
        .unwrap();

    let quote = response.last_quote().unwrap();
    Ok(Json(quote.close))
}

fn sanitize_xml(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '&' {
            let mut peeked = String::new();
            let mut clone = chars.clone();
            while let Some(&pc) = clone.peek() {
                if pc == ';' {
                    peeked.push(pc);
                    break;
                }
                if !pc.is_ascii_alphanumeric() && pc != '#' && pc != 'x' {
                    break;
                }
                peeked.push(pc);
                clone.next();
            }

            let entity = format!("&{}", peeked);
            let is_valid = entity.starts_with("&amp")
                || entity.starts_with("&lt")
                || entity.starts_with("&gt")
                || entity.starts_with("&quot")
                || entity.starts_with("&apos")
                || entity.starts_with("&#");

            if is_valid {
                out.push('&');
            } else {
                out.push_str("&amp;");
            }
        } else {
            out.push(c);
        }
    }

    out
}

pub async fn latest_filing_raw(
    Path(cik): Path<String>,
    Query(params): Query<SECQueryParams>,
) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {
    let client = Client::new();

    // 1️⃣ Fetch SEC submissions JSON
    let sec_url = format!("https://data.sec.gov/submissions/CIK{}.json", cik);
    let res = client
        .get(&sec_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let json: Value = res
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?;

    let recent = &json["filings"]["recent"];
    let forms = recent["form"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse { error: "No form data found".into() }),
        )
    })?;

    // 2️⃣ Determine the target form
    let target_form = match params.period.as_str() {
        "quarter" => "10-Q",
        "annual" => "10-K",
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse { error: "Invalid period. Must be 'quarter' or 'annual'".into() }),
            ))
        }
    };

    let idx = forms.iter()
        .position(|v| v.as_str() == Some(target_form))
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse { error: format!("No {} filings found", target_form) }),
            )
        })?;

    let accession = recent["accessionNumber"][idx].as_str().unwrap();
    let accession_nodash = accession.replace("-", "");
    let primary_doc = recent["primaryDocument"][idx].as_str().unwrap();

    // 3️⃣ Filing base URL
    let filing_base_url = format!(
        "https://www.sec.gov/Archives/edgar/data/{}/{}",
        cik.trim_start_matches('0'),
        accession_nodash
    );

    // 4️⃣ Fetch filing index to find XBRL instance
    let index_url = format!("{}/index.json", filing_base_url);
    let index_res = client
        .get(&index_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let index_json: Value = index_res.json().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() }))
    })?;

    let mut xbrl_file = None;
    if let Some(files) = index_json["directory"]["item"].as_array() {
        for f in files {
            if let Some(name) = f["name"].as_str() {
                if name.ends_with("_htm.xml") || name.ends_with("_xbrl.xml") {
                    xbrl_file = Some(name.to_string());
                    break;
                }
            }
        }
    }

    let xbrl_file = xbrl_file.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse { error: "No XBRL XML file found in filing".into() }),
        )
    })?;

    let xbrl_url = format!("{}/{}", filing_base_url, xbrl_file);

    // 5️⃣ Fetch & sanitize XBRL XML
    let xbrl_res = client
        .get(&xbrl_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let xbrl_text = xbrl_res.text().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() }))
    })?;
    let sanitized = sanitize_xml(&xbrl_text);

    // 6️⃣ Parse XBRL using quick-xml v0.38+
    let mut reader = Reader::from_str(&sanitized);
    reader.config_mut().trim_text(true);
    let mut buf = Vec::new();
    let mut data = HashMap::<String, f64>::new();
    let mut current_tag = String::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(e)) => {
                let tag_name = reader
                    .decoder()
                    .decode(e.name().as_ref())
                    .unwrap_or_default()
                    .to_string();
                if tag_name.starts_with("us-gaap:") {
                    current_tag = tag_name;
                } else {
                    current_tag.clear();
                }
            }
            Ok(Event::Text(t)) => {
                if !current_tag.is_empty() {
                    let text = reader.decoder().decode(&t).unwrap_or_default().trim().to_string();
                    if let Ok(num) = text.parse::<f64>() {
                        data.insert(current_tag.clone(), num);
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(err) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse { error: format!("XML parse error: {}", err) }),
                ));
            }
            _ => {}
        }
        buf.clear();
    }


    Ok(Json(serde_json::json!({
        "cik": cik,
        "form": target_form,
        "xbrl_file": xbrl_file,
        "data": data
    })))
}


pub async fn latest_filing(
    Path(cik): Path<String>,
    Query(params): Query<SECQueryParams>,
) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {
    let client = Client::new();

    // 1️⃣ Fetch SEC submissions JSON
    let sec_url = format!("https://data.sec.gov/submissions/CIK{}.json", cik);
    let res = client
        .get(&sec_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let json: Value = res
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?;

    let recent = &json["filings"]["recent"];
    let forms = recent["form"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse { error: "No form data found".into() }),
        )
    })?;

    // 2️⃣ Determine the target form
    let target_form = match params.period.as_str() {
        "quarter" => "10-Q",
        "annual" => "10-K",
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse { error: "Invalid period. Must be 'quarter' or 'annual'".into() }),
            ))
        }
    };

    let idx = forms.iter()
        .position(|v| v.as_str() == Some(target_form))
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse { error: format!("No {} filings found", target_form) }),
            )
        })?;

    let accession = recent["accessionNumber"][idx].as_str().unwrap();
    let accession_nodash = accession.replace("-", "");
    let primary_doc = recent["primaryDocument"][idx].as_str().unwrap();

    // 3️⃣ Filing base URL
    let filing_base_url = format!(
        "https://www.sec.gov/Archives/edgar/data/{}/{}",
        cik.trim_start_matches('0'),
        accession_nodash
    );

    // 4️⃣ Fetch filing index to find XBRL instance
    let index_url = format!("{}/index.json", filing_base_url);
    let index_res = client
        .get(&index_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let index_json: Value = index_res.json().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() }))
    })?;

    let mut xbrl_file = None;
    if let Some(files) = index_json["directory"]["item"].as_array() {
        for f in files {
            if let Some(name) = f["name"].as_str() {
                if name.ends_with("_htm.xml") || name.ends_with("_xbrl.xml") {
                    xbrl_file = Some(name.to_string());
                    break;
                }
            }
        }
    }

    let xbrl_file = xbrl_file.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse { error: "No XBRL XML file found in filing".into() }),
        )
    })?;

    let xbrl_url = format!("{}/{}", filing_base_url, xbrl_file);

    // 5️⃣ Fetch & sanitize XBRL XML
    let xbrl_res = client
        .get(&xbrl_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let xbrl_text = xbrl_res.text().await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() }))
    })?;
    let sanitized = sanitize_xml(&xbrl_text);

    // 6️⃣ Parse XBRL using quick-xml v0.38+
    let mut reader = Reader::from_str(&sanitized);
    reader.config_mut().trim_text(true);
    let mut buf = Vec::new();
    let mut data = HashMap::<String, f64>::new();
    let mut current_tag = String::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(e)) => {
                let tag_name = reader
                    .decoder()
                    .decode(e.name().as_ref())
                    .unwrap_or_default()
                    .to_string();
                if tag_name.starts_with("us-gaap:") {
                    current_tag = tag_name;
                } else {
                    current_tag.clear();
                }
            }
            Ok(Event::Text(t)) => {
                if !current_tag.is_empty() {
                    let text = reader.decoder().decode(&t).unwrap_or_default().trim().to_string();
                    if let Ok(num) = text.parse::<f64>() {
                        data.insert(current_tag.clone(), num);
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(err) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse { error: format!("XML parse error: {}", err) }),
                ));
            }
            _ => {}
        }
        buf.clear();
    }

    let rich_json = map_us_gaap_to_rich(&data);

    Ok(Json(serde_json::json!({
        "cik": cik,
        "form": target_form,
        "xbrl_file": xbrl_file,
        "data": rich_json
    })))
}

pub async fn latest_n_filings(
    Path(cik): Path<String>,
    Query(params): Query<SECQueryParams>,
) -> Result<impl IntoResponse, (StatusCode, Json<ErrorResponse>)> {
    let client = Client::new();

    // 1️⃣ Fetch SEC submissions JSON
    let sec_url = format!("https://data.sec.gov/submissions/CIK{}.json", cik);
    let res = client
        .get(&sec_url)
        .header("User-Agent", "YourName (your@email.com)")
        .send()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
        .error_for_status()
        .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

    let json: Value = res
        .json()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?;

    let recent = &json["filings"]["recent"];
    let forms = recent["form"].as_array().ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse { error: "No form data found".into() }),
        )
    })?;

    // 2️⃣ Determine target form
    let target_form = match params.period.as_str() {
        "quarter" => "10-Q",
        "annual" => "10-K",
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse { error: "Invalid period. Must be 'quarter' or 'annual'".into() }),
            ))
        }
    };

    // 3️⃣ Filter the most recent n filings of target type
    let mut filings = Vec::new();
    for (i, form) in forms.iter().enumerate() {
        if form.as_str() == Some(target_form) {
            let accession = recent["accessionNumber"][i].as_str().unwrap();
            let accession_nodash = accession.replace("-", "");
            let primary_doc = recent["primaryDocument"][i].as_str().unwrap();
            let filing_date = recent["filingDate"][i].as_str().unwrap();

            // Filing base URL
            let filing_base_url = format!(
                "https://www.sec.gov/Archives/edgar/data/{}/{}",
                cik.trim_start_matches('0'),
                accession_nodash
            );

            // Fetch filing index
            let index_url = format!("{}/index.json", filing_base_url);
            let index_res = client
                .get(&index_url)
                .header("User-Agent", "YourName (your@email.com)")
                .send()
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
                .error_for_status()
                .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

            let index_json: Value = index_res.json().await.map_err(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() }))
            })?;

            let mut xbrl_file = None;
            if let Some(files) = index_json["directory"]["item"].as_array() {
                for f in files {
                    if let Some(name) = f["name"].as_str() {
                        if name.ends_with("_htm.xml") || name.ends_with("_xbrl.xml") {
                            xbrl_file = Some(name.to_string());
                            break;
                        }
                    }
                }
            }

            let xbrl_file = xbrl_file.ok_or_else(|| {
                (
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse { error: "No XBRL XML file found in filing".into() }),
                )
            })?;

            let xbrl_url = format!("{}/{}", filing_base_url, xbrl_file);

            // Fetch & sanitize XBRL XML
            let xbrl_res = client
                .get(&xbrl_url)
                .header("User-Agent", "YourName (your@email.com)")
                .send()
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() })))?
                .error_for_status()
                .map_err(|e| (StatusCode::NOT_FOUND, Json(ErrorResponse { error: e.to_string() })))?;

            let xbrl_text = xbrl_res.text().await.map_err(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse { error: e.to_string() }))
            })?;
            let sanitized = sanitize_xml(&xbrl_text);

            // Parse XBRL
            let mut reader = Reader::from_str(&sanitized);
            reader.config_mut().trim_text(true);
            let mut buf = Vec::new();
            let mut data = HashMap::<String, f64>::new();
            let mut current_tag = String::new();

            loop {
                match reader.read_event_into(&mut buf) {
                    Ok(Event::Start(e)) => {
                        let tag_name = reader
                            .decoder()
                            .decode(e.name().as_ref())
                            .unwrap_or_default()
                            .to_string();
                        if tag_name.starts_with("us-gaap:") {
                            current_tag = tag_name;
                        } else {
                            current_tag.clear();
                        }
                    }
                    Ok(Event::Text(t)) => {
                        if !current_tag.is_empty() {
                            let text = reader.decoder().decode(&t).unwrap_or_default().trim().to_string();
                            if let Ok(num) = text.parse::<f64>() {
                                data.insert(current_tag.clone(), num);
                            }
                        }
                    }
                    Ok(Event::Eof) => break,
                    Err(err) => {
                        return Err((
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ErrorResponse { error: format!("XML parse error: {}", err) }),
                        ));
                    }
                    _ => {}
                }
                buf.clear();
            }

            let rich_json = map_us_gaap_to_rich(&data);

            filings.push(serde_json::json!({
                "filing_date": filing_date,
                "xbrl_file": xbrl_file,
                "data": rich_json
            }));

            if filings.len() >= params.num_filings {
                break;
            }
        }
    }

    Ok(Json(serde_json::json!({
        "cik": cik,
        "form": target_form,
        "filings": filings
    })))
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

