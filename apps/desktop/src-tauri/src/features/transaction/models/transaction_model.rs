use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Transaction {
    pub id: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: String, // 'sale', 'purchase', 'transfer', 'return', 'adjustment'
    pub status: String, // DEFAULT 'draft'
    pub channel: Option<String>,
    pub customer_id: Option<String>,
    pub supplier_id: Option<String>,
    pub staff_id: Option<String>,
    pub currency: Option<String>, // DEFAULT 'BRL'
    pub total_items: Option<f64>, // DEFAULT 0
    pub total_shipping: Option<f64>, // DEFAULT 0
    pub total_discount: Option<f64>, // DEFAULT 0
    pub total_net: Option<f64>, // DEFAULT 0
    pub shipping_method: Option<String>,
    pub shipping_address: Option<String>, // JSONB stored as TEXT
    pub billing_address: Option<String>,  // JSONB stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>, // DEFAULT CURRENT_TIMESTAMP
    pub updated_at: Option<DateTime<Utc>>, // DEFAULT CURRENT_TIMESTAMP
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct TransactionItem {
    pub id: String,
    pub transaction_id: String,
    pub product_id: Option<String>,
    pub sku_snapshot: Option<String>,
    pub name_snapshot: Option<String>,
    pub quantity: f64,
    pub unit_price: f64,
    pub unit_cost: Option<f64>,
    pub total_line: Option<f64>, // Real Generated Always
    pub attributes_snapshot: Option<String>, // JSONB
    pub tax_details: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct InventoryMovement {
    pub id: String,
    pub transaction_id: Option<String>,
    pub inventory_level_id: Option<String>,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub movement_type: Option<String>, // 'in' or 'out'
    pub quantity: f64,
    pub previous_balance: Option<f64>,
    pub new_balance: Option<f64>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
