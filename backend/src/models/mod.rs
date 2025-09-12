use serde::{Serialize, Deserialize};


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
#[derive(serde::Serialize)]
pub struct Filing {
    pub form: String,
    pub filing_date: String,
    pub report_date: String,
    pub accession_number: String,
}




