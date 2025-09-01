use axum::{Router, routing::get};

pub fn finance_routes() -> Router {
    Router::new()
        .route("/test", get(|| async {"API is live." }))
}