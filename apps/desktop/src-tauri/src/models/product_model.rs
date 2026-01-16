use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Product {
    pub id: String,
    pub sku: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: String, // 'physical', 'digital', 'service', 'bundle'
    pub status: Option<String>, // DEFAULT 'draft'
    pub name: String,
    pub slug: Option<String>,
    pub gtin_ean: Option<String>,
    pub price: f64,
    pub promotional_price: Option<f64>,
    pub cost_price: Option<f64>,
    pub currency: Option<String>, // DEFAULT 'BRL'
    pub tax_ncm: Option<String>,
    pub is_shippable: bool,         // INTEGER DEFAULT 1
    pub weight_g: i64,              // INTEGER DEFAULT 0
    pub width_mm: i64,              // INTEGER DEFAULT 0
    pub height_mm: i64,             // INTEGER DEFAULT 0
    pub depth_mm: i64,              // INTEGER DEFAULT 0
    pub attributes: Option<String>, // JSONB stored as TEXT
    pub metadata: Option<String>,   // JSONB stored as TEXT
    pub category_id: Option<String>,
    pub brand_id: Option<String>,
    pub parent_id: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>, // DEFAULT CURRENT_TIMESTAMP
    pub updated_at: Option<DateTime<Utc>>, // DEFAULT CURRENT_TIMESTAMP
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProductCategory {
    pub product_id: String,
    pub category_id: String,
    pub position: Option<i64>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProductMetrics {
    pub product_id: String,
    pub review_count: i32,
    pub review_sum: i32,
    pub average_rating: Option<f64>,
    pub updated_at: Option<DateTime<Utc>>,
}
