use axum::{Router};
use hyper::Server;
use tower_http::cors::CorsLayer;
use dotenvy::dotenv;

mod routes;
mod utils;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let app=Router::new()
        .nest("/api/finance", routes::finance_routes())
        .layer(utils::cors::build());
    println!("Listening at http://0.0.0.0:8000");

    Server::bind(&"0.0.0.0:8000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
