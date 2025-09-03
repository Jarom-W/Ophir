use axum::{Json,
    http::StatusCode,
    response::{IntoResponse, Response}
};

use serde::Serialize;

#[derive(Debug)]
pub enum AppError {
    Reqwest(reqwest::Error),
    Serde(serde_json::Error),
    NotFound(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        #[derive(Serialize)]
        struct ErrorMessage {
            error: String,
        }

        let (status, message) = match self {
            AppError::Reqwest(e) => (StatusCode::BAD_GATEWAY, e.to_string()),
            AppError::Serde(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
        };

        let body = Json(ErrorMessage { error: message });
        (status, body).into_response()
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::Reqwest(err)
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Serde(err)
    }
}
