use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Brand {
    pub id: String,
    pub shop_id: String,
    pub name: String,
    pub slug: String,
    pub logo_url: Option<String>,
    pub banner_url: Option<String>,
    pub description: Option<String>,
    pub rich_description: Option<String>,
    pub website_url: Option<String>,
    pub status: String,
    pub is_featured: bool,
    pub sort_order: i32,
    pub seo_title: Option<String>,
    pub seo_keywords: Option<String>, // Stored as TEXT (likely JSON array or CSV)
    pub metadata: Option<String>,     // JSONB stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
