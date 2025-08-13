use axum::{Router, routing::get};
use crate::services::fundamentals::get_stock_summary;

pub fn finance_routes() -> Router {
    Router::new()
        .route("/summary/:symbol", get(get_stock_summary))
}
