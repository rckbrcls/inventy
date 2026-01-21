use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ShopTemplate {
    pub id: String,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub features_config: String,           // JSON stored as TEXT
    pub default_settings: Option<String>,  // JSON stored as TEXT
    pub recommended_modules: Option<String>, // JSON array stored as TEXT
    pub metadata: Option<String>,          // JSON stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
