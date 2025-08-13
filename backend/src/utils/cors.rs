use tower_http::cors::{Any, CorsLayer};

pub fn build() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
}

