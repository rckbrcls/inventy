use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct AuditLog {
    pub id: String,
    pub table_name: String,
    pub record_id: String,
    pub action: String,
    pub old_data: Option<String>,
    pub new_data: Option<String>,
    pub changed_by: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
}
