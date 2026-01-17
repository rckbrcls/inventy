use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct CustomerGroup {
    pub id: String,
    pub shop_id: String,
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>, // DEFAULT 'manual'
    pub rules: Option<String>, // JSONB DEFAULT '[]'
    pub default_discount_percentage: Option<f64>, // DEFAULT 0
    pub price_list_id: Option<String>,
    pub tax_class: Option<String>,
    pub allowed_payment_methods: Option<String>, // TEXT[]
    pub min_order_amount: Option<f64>, // DEFAULT 0
    pub metadata: Option<String>, // JSONB DEFAULT '{}'
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
