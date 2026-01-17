use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Order {
    pub id: String,
    pub order_number: Option<i64>,
    pub idempotency_key: Option<String>,
    pub channel: Option<String>,
    pub shop_id: Option<String>,
    pub customer_id: Option<String>,
    pub status: Option<String>,
    pub payment_status: Option<String>,
    pub fulfillment_status: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: f64,
    pub total_discounts: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_tip: Option<f64>,
    pub total_price: f64,
    pub tax_lines: Option<String>, // JSON
    pub discount_codes: Option<String>, // JSON
    pub note: Option<String>,
    pub tags: Option<String>,
    pub custom_attributes: Option<String>, // JSON
    pub metadata: Option<String>, // JSON
    pub customer_snapshot: String, // JSON, NOT NULL
    pub billing_address: Option<String>, // JSON
    pub shipping_address: Option<String>, // JSON
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub cancelled_at: Option<DateTime<Utc>>,
    pub closed_at: Option<DateTime<Utc>>,
}
