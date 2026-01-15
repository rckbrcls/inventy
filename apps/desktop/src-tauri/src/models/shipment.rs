use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Shipment {
    pub id: String,
    pub order_id: String,
    pub location_id: Option<String>,
    pub status: Option<String>,
    pub carrier_company: Option<String>,
    pub carrier_service: Option<String>,
    pub tracking_number: Option<String>,
    pub tracking_url: Option<String>,
    pub weight_g: Option<i32>,
    pub height_mm: Option<i32>,
    pub width_mm: Option<i32>,
    pub depth_mm: Option<i32>,
    pub package_type: Option<String>,
    pub shipping_label_url: Option<String>,
    pub invoice_url: Option<String>,
    pub invoice_key: Option<String>,
    pub cost_amount: Option<f64>,
    pub insurance_amount: Option<f64>,
    pub estimated_delivery_at: Option<DateTime<Utc>>,
    pub shipped_at: Option<DateTime<Utc>>,
    pub delivered_at: Option<DateTime<Utc>>,
    pub metadata: Option<String>, // JSONB
    pub customs_info: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ShipmentItem {
    pub id: String,
    pub shipment_id: String,
    pub order_item_id: String,
    pub quantity: i32,
    pub batch_number: Option<String>,
    pub serial_numbers: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ShipmentEvent {
    pub id: String,
    pub shipment_id: Option<String>,
    pub status: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub happened_at: Option<DateTime<Utc>>,
    pub raw_data: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
