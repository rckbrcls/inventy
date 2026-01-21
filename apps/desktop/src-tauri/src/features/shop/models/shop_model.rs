use serde::{Deserialize, Serialize};
use sqlx::FromRow;
// Assuming we want to use chrono for timestamps as per Cargo.toml features
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Shop {
    pub id: String,
    pub name: String,
    pub legal_name: Option<String>,
    pub slug: String,
    pub status: String,
    pub features_config: Option<String>, // JSONB stored as TEXT
    pub mail_config: Option<String>,     // JSONB stored as TEXT
    pub storage_config: Option<String>,  // JSONB stored as TEXT
    pub settings: Option<String>,        // JSONB stored as TEXT
    pub branding: Option<String>,        // JSONB stored as TEXT
    pub currency: String,
    pub timezone: String,
    pub locale: String,
    pub owner_id: Option<String>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>, // SQLite DATETIME is usually compatible with NaiveDateTime
    pub updated_at: DateTime<Utc>,
}
