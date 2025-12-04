use axum::Router;
use dotenvy::dotenv;
use tokio::net::TcpListener;
use tower_http::cors::{CorsLayer, Any};
use crate::models::{PriceDrop, StockData, Criterion, Alert};

pub mod routes;
pub mod models;
pub mod utils;
pub mod error;

#[tokio::main]
async fn main() {
    dotenv().ok();

/*
    let stocks = vec![
        StockData { ticker: "AAPL".into(), price: 250.0, percentage: 50.0, time_frame_days: 365 },
        StockData { ticker: "MSFT".into(), price: 300.0, percentage: 30.0, time_frame_days: 365 },
    ];

    let alert = Alert {
        name: "test".to_string(),
        criteria: vec![
            Criterion::PriceDrop(Some(PriceDrop { percentage: 20.0, time_frame_days: 365 })),
        ],
    };

    let matches = evaluate_alerts(&alert, &stocks);

    println!("Metched stocks: {:?}", matches);
*/
    // Build your global CORS layer here
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .nest("/api", routes::finance_routes())
        .layer(cors); // ✅ Works in Axum 0.7

    let route = "0.0.0.0:8000";
    println!("Listening at http://{}", route);

    let listener = TcpListener::bind(route)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed");


}

