use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Customer {
    pub id: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: String, // 'individual'
    pub email: Option<String>,
    pub phone: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company_name: Option<String>,
    pub tax_id: Option<String>,
    pub tax_id_type: Option<String>,
    pub state_tax_id: Option<String>,
    pub status: Option<String>, // 'active'
    pub currency: Option<String>, // 'BRL'
    pub language: Option<String>, // 'pt'
    pub tags: Option<String>, // TEXT[]
    pub accepts_marketing: Option<bool>, // INTEGER DEFAULT 0
    pub customer_group_id: Option<String>,
    pub total_spent: Option<f64>, // REAL
    pub orders_count: Option<i64>, // INTEGER
    pub last_order_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub metadata: Option<String>, // JSONB
    pub custom_attributes: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct CustomerAddress {
    pub id: String,
    pub customer_id: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>, // 'shipping' or 'billing'
    pub is_default: Option<bool>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company: Option<String>,
    pub address1: Option<String>,
    pub address2: Option<String>,
    pub city: Option<String>,
    pub province_code: Option<String>,
    pub country_code: Option<String>,
    pub postal_code: Option<String>,
    pub phone: Option<String>,
    pub metadata: Option<String>, // JSONB
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct CustomerGroupMembership {
    pub customer_id: String,
    pub customer_group_id: String,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
