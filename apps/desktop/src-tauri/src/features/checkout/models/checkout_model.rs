use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Checkout {
    pub id: String,
    pub token: String,
    pub user_id: Option<String>,
    pub email: Option<String>,
    pub items: Option<String>, // JSONB stored as TEXT
    pub shipping_address: Option<String>, // JSONB stored as TEXT
    pub billing_address: Option<String>, // JSONB stored as TEXT
    pub shipping_line: Option<String>, // JSONB stored as TEXT
    pub applied_discount_codes: Option<String>, // JSONB stored as TEXT
    pub currency: Option<String>, // DEFAULT 'BRL'
    pub subtotal_price: Option<f64>, // REAL in SQLite
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_discounts: Option<f64>,
    pub total_price: Option<f64>,
    pub status: Option<String>, // DEFAULT 'open'
    pub reservation_expires_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub metadata: Option<String>, // JSONB stored as TEXT
    pub recovery_url: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
