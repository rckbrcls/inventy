use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Review {
    pub id: String,
    pub order_id: String,
    pub customer_id: Option<String>,
    pub product_id: Option<String>,
    pub rating: i32,
    pub title: Option<String>,
    pub body: Option<String>,
    pub photos: Option<String>, // JSONB stored as TEXT
    pub videos: Option<String>, // JSONB stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
