use tower_http::cors::{CorsLayer, Any};
use std::time::Duration;

pub fn build() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .max_age(Duration::from_secs(86400))
}
