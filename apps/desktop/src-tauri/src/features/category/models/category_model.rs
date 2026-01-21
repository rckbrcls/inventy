use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Category {
    pub id: String,
    pub shop_id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub banner_url: Option<String>,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub r#type: Option<String>, // DEFAULT 'manual'
    pub rules: Option<String>, // JSONB stored as TEXT, DEFAULT '[]'
    pub is_visible: bool,      // INTEGER DEFAULT 1
    pub sort_order: i64,       // INTEGER DEFAULT 0. i64 is safe for SQLite INTEGER
    pub seo_title: Option<String>,
    pub seo_description: Option<String>,
    pub template_suffix: Option<String>,
    pub metadata: Option<String>, // JSONB stored as TEXT, DEFAULT '{}'
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: Option<String>, // DEFAULT 'created'
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
