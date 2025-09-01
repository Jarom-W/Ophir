use serde::{Serialize, Deserialize};
use serde_json::Value;
use sqlx::{SqlitePool};

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
pub struct Company {
    pub id: i64,
    pub name: String,
    pub ticker: String,
}

#[derive(Debug,serde::Deserialize)]

pub struct CompanyQuery {
    pub name: Option<String>,
    pub ticker: Option<String>,
}

#[derive(Deserialize)]

pub struct AccessTokenQuery {
    pub oauth_token: String,
    pub oauth_verifier: String,
    pub oauth_token_secret: String,
}

#[derive(Deserialize)]

pub struct AuthorizeQuery {
    pub oauth_token: String,
}

#[derive(Deserialize)]
pub struct OptionsQuery {
    pub symbol: String,
}

#[derive(Serialize)]
pub struct ApiResponse {
    pub symbol: String,
    pub options_data: Value,
}

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
}
