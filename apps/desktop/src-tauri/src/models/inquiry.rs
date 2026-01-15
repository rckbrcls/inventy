use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Inquiry {
    pub id: String,
    pub protocol_number: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub source: Option<String>,
    pub customer_id: Option<String>,
    pub requester_data: String, // JSON
    pub department: Option<String>,
    pub assigned_staff_id: Option<String>,
    pub subject: Option<String>,
    pub related_order_id: Option<String>,
    pub related_product_id: Option<String>,
    pub metadata: Option<String>, // JSON
    pub sla_due_at: Option<DateTime<Utc>>,
    pub resolved_at: Option<DateTime<Utc>>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct InquiryMessage {
    pub id: String,
    pub inquiry_id: String,
    pub sender_type: String, // 'customer', 'staff', 'bot'
    pub sender_id: Option<String>,
    pub body: Option<String>,
    pub is_internal_note: Option<bool>,
    pub attachments: Option<String>, // JSONB string
    pub external_id: Option<String>,
    pub read_at: Option<DateTime<Utc>>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
