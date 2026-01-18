use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Module {
    pub id: String,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub required_modules: Option<String>, // JSON array stored as TEXT
    pub conflicts_with: Option<String>,   // JSON array stored as TEXT
    pub tables_used: Option<String>,      // JSON array stored as TEXT
    pub is_core: bool,                    // INTEGER mapped to bool
    pub metadata: Option<String>,         // JSON stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
