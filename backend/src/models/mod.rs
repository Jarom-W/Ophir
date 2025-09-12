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



