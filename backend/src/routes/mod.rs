use axum::{Router,extract::{Path, Query}, http::StatusCode ,routing::get,Json, response::{IntoResponse}};
use reqwest::Client;
use std::collections::HashMap;
use crate::models::{SearchParams, Company, StockData, Criterion, Alert, SECQueryParams, ErrorResponse};
use crate::error::AppError;
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

fn map_us_gaap_to_rich(data: &HashMap<String, f64>) -> serde_json::Value {
    json!({
        "balance_sheet": {
            "assets": data.get("us-gaap:Assets").copied().unwrap_or(0.0),
            "current_assets": data.get("us-gaap:AssetsCurrent").copied().unwrap_or(0.0),
            "cash_and_cash_equivalents": data.get("us-gaap:CashAndCashEquivalentsAtCarryingValue").copied().unwrap_or(0.0),
            "accounts_receivable": data.get("us-gaap:AccountsReceivableNetCurrent").copied().unwrap_or(0.0),
            "inventory": data.get("us-gaap:InventoryNet").copied().unwrap_or(0.0),
            "marketable_securities_current": data.get("us-gaap:MarketableSecuritiesCurrent").copied().unwrap_or(0.0),
            "marketable_securities_noncurrent": data.get("us-gaap:MarketableSecuritiesNoncurrent").copied().unwrap_or(0.0),
            "property_plant_equipment": data.get("us-gaap:PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetBeforeAccumulatedDepreciationAndAmortization").copied().unwrap_or(0.0),
            "accumulated_depreciation": data.get("us-gaap:PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAccumulatedDepreciationAndAmortization").copied().unwrap_or(0.0),
            "goodwill": data.get("us-gaap:Goodwill").copied().unwrap_or(0.0),
            "intangible_assets": data.get("us-gaap:OtherLongTermInvestments").copied().unwrap_or(0.0),
            "other_assets_current": data.get("us-gaap:OtherAssetsCurrent").copied().unwrap_or(0.0),
            "other_assets_noncurrent": data.get("us-gaap:OtherAssetsNoncurrent").copied().unwrap_or(0.0),
            "liabilities": data.get("us-gaap:Liabilities").copied().unwrap_or(0.0),
            "current_liabilities": data.get("us-gaap:LiabilitiesCurrent").copied().unwrap_or(0.0),
            "long_term_debt": data.get("us-gaap:LongTermDebtNoncurrent").copied().unwrap_or(0.0),
            "accounts_payable": data.get("us-gaap:AccountsPayableCurrent").copied().unwrap_or(0.0),
            "accrued_expenses": data.get("us-gaap:AccruedLiabilitiesCurrent").copied().unwrap_or(0.0),
            "operating_lease_liability_current": data.get("us-gaap:OperatingLeaseLiabilityCurrent").copied().unwrap_or(0.0),
            "operating_lease_liability_noncurrent": data.get("us-gaap:OperatingLeaseLiabilityNoncurrent").copied().unwrap_or(0.0),
            "finance_lease_liability_current": data.get("us-gaap:FinanceLeaseLiabilityCurrent").copied().unwrap_or(0.0),
            "finance_lease_liability_noncurrent": data.get("us-gaap:FinanceLeaseLiabilityNoncurrent").copied().unwrap_or(0.0),
            "equity": data.get("us-gaap:StockholdersEquity").copied().unwrap_or(0.0),
            "retained_earnings": data.get("us-gaap:RetainedEarningsAccumulatedDeficit").copied().unwrap_or(0.0),
            "common_stock": data.get("us-gaap:CommonStocksIncludingAdditionalPaidInCapital").copied().unwrap_or(0.0),
            "preferred_stock": data.get("us-gaap:PreferredStockParOrStatedValuePerShare").copied().unwrap_or(0.0)
        },
        "income_statement": {
            "revenue": data.get("us-gaap:Revenues").copied().unwrap_or(0.0),
            "cost_of_revenue": data.get("us-gaap:CostOfRevenue").copied().unwrap_or(0.0),
            "gross_profit": data.get("us-gaap:Revenues").copied().unwrap_or(0.0) - data.get("us-gaap:CostOfRevenue").copied().unwrap_or(0.0),
            "operating_expenses": data.get("us-gaap:OperatingExpenses").copied().unwrap_or(0.0),
            "research_and_development": data.get("us-gaap:ResearchAndDevelopmentExpense").copied().unwrap_or(0.0),
            "selling_general_administrative": data.get("us-gaap:SellingAndMarketingExpense").copied().unwrap_or(0.0),
            "operating_income": data.get("us-gaap:OperatingIncomeLoss").copied().unwrap_or(0.0),
            "interest_expense": data.get("us-gaap:InterestExpenseNonoperating").copied().unwrap_or(0.0),
            "income_before_tax": data.get("us-gaap:IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest").copied().unwrap_or(0.0),
            "income_tax_expense": data.get("us-gaap:IncomeTaxExpenseBenefit").copied().unwrap_or(0.0),
            "net_income": data.get("us-gaap:NetIncomeLoss").copied().unwrap_or(0.0),
            "noncontrolling_interest": data.get("us-gaap:NoncontrollingInterestInVariableInterestEntity").copied().unwrap_or(0.0),
            "other_nonoperating_income": data.get("us-gaap:OtherNonoperatingIncomeExpense").copied().unwrap_or(0.0),
            "equity_investment_gain_loss": data.get("us-gaap:EquitySecuritiesFvNiGainLoss").copied().unwrap_or(0.0)
        },
        "cash_flow": {
            "net_cash_from_operating": data.get("us-gaap:NetCashProvidedByUsedInOperatingActivities").copied().unwrap_or(0.0),
            "net_cash_from_investing": data.get("us-gaap:NetCashProvidedByUsedInInvestingActivities").copied().unwrap_or(0.0),
            "net_cash_from_financing": data.get("us-gaap:NetCashProvidedByUsedInFinancingActivities").copied().unwrap_or(0.0),
            "capital_expenditures": data.get("us-gaap:PaymentsToAcquirePropertyPlantAndEquipment").copied().unwrap_or(0.0),
            "dividends_paid": data.get("us-gaap:PaymentsOfDividends").copied().unwrap_or(0.0),
            "stock_repurchases": data.get("us-gaap:PaymentsForRepurchaseOfCommonStock").copied().unwrap_or(0.0),
            "debt_issuance_proceeds": data.get("us-gaap:ProceedsFromDebtNetOfIssuanceCosts").copied().unwrap_or(0.0),
            "equity_issuance_proceeds": data.get("us-gaap:ProceedsFromMinorityShareholders").copied().unwrap_or(0.0)
        },
        "leases": {
            "finance_lease_asset": data.get("us-gaap:FinanceLeaseRightOfUseAsset").copied().unwrap_or(0.0),
            "finance_lease_amortization": data.get("us-gaap:FinanceLeaseRightOfUseAssetAmortization").copied().unwrap_or(0.0),
            "operating_lease_asset": data.get("us-gaap:OperatingLeaseRightOfUseAsset").copied().unwrap_or(0.0),
            "operating_lease_cost": data.get("us-gaap:OperatingLeaseCost").copied().unwrap_or(0.0)
        },
        "derivatives": {
            "derivative_assets": data.get("us-gaap:DerivativeAssets").copied().unwrap_or(0.0),
            "derivative_liabilities": data.get("us-gaap:DerivativeLiabilities").copied().unwrap_or(0.0),
            "derivative_gain_loss": data.get("us-gaap:DerivativeGainLossOnDerivativeNet").copied().unwrap_or(0.0)
        },
        "equity": {
            "share_based_compensation": data.get("us-gaap:ShareBasedCompensation").copied().unwrap_or(0.0),
            "stock_issued": data.get("us-gaap:SharesIssued").copied().unwrap_or(0.0),
            "stock_repurchased": data.get("us-gaap:StockRepurchasedAndRetiredDuringPeriodShares").copied().unwrap_or(0.0),
            "additional_paid_in_capital": data.get("us-gaap:CommonStocksIncludingAdditionalPaidInCapital").copied().unwrap_or(0.0)
        },
        "other_comprehensive_income": {
            "aoci_net_of_tax": data.get("us-gaap:AccumulatedOtherComprehensiveIncomeLossNetOfTax").copied().unwrap_or(0.0),
            "foreign_currency_translation": data.get("us-gaap:OtherComprehensiveIncomeLossForeignCurrencyTransactionAndTranslationAdjustmentNetOfTax").copied().unwrap_or(0.0),
            "cash_flow_hedges": data.get("us-gaap:OtherComprehensiveIncomeLossCashFlowHedgeGainLossAfterReclassificationAndTax").copied().unwrap_or(0.0),
            "unrealized_gains_on_securities": data.get("us-gaap:OtherComprehensiveIncomeUnrealizedHoldingGainLossOnSecuritiesArisingDuringPeriodNetOfTax").copied().unwrap_or(0.0)
        },
        "ratios": {
            "current_ratio": match (data.get("us-gaap:AssetsCurrent"), data.get("us-gaap:LiabilitiesCurrent")) {
                (Some(a), Some(l)) if *l != 0.0 => Some(a / l),
                _ => Some(0.0),
            },
            "debt_to_equity": match (data.get("us-gaap:Liabilities"), data.get("us-gaap:StockholdersEquity")) {
                (Some(l), Some(e)) if *e != 0.0 => Some(l / e),
                _ => Some(0.0),
            },
            "gross_margin": match (data.get("us-gaap:Revenues"), data.get("us-gaap:CostOfRevenue")) {
                (Some(r), Some(c)) if *r != 0.0 => Some((r - c)/ r),
                _ => Some(0.0),
            },
            "operating_margin": match (data.get("us-gaap:OperatingIncomeLoss"), data.get("us-gaap:Revenues")) {
                (Some(op), Some(r)) if *r != 0.0 => Some(op / r),
                _ => Some(0.0),
            },
            "net_margin": match (data.get("us-gaap:NetIncomeLoss"), data.get("us-gaap:Revenues")) {
                (Some(net), Some(r)) if *r != 0.0 => Some(net / r),
                _ => Some(0.0),
            }
        }
    })
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

