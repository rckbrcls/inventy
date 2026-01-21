use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Payment {
    pub id: String,
    pub transaction_id: String,
    pub amount: f64,
    pub currency: Option<String>,
    pub provider: String,
    pub method: String,
    pub installments: Option<i64>, // INTEGER DEFAULT 1
    pub status: String,
    pub provider_transaction_id: Option<String>,
    pub authorization_code: Option<String>,
    pub payment_details: Option<String>, // JSONB
    pub risk_level: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub authorized_at: Option<DateTime<Utc>>,
    pub captured_at: Option<DateTime<Utc>>,
    pub voided_at: Option<DateTime<Utc>>,
}
