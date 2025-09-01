use axum::{Router};
use dotenvy::dotenv;
use tokio::net::TcpListener;

pub mod routes;
pub mod utils;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let app=Router::new()
        .nest("/api", routes::finance_routes())
        .layer(utils::build());

    let route = "0.0.0.0:8000";

    println!("Listening at http://{}", route);

    let listener = TcpListener::bind(route)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed");

}
