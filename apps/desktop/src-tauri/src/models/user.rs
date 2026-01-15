use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub password_hash: Option<String>,
    pub security_stamp: Option<String>,
    pub is_email_verified: Option<bool>,
    pub is_phone_verified: Option<bool>,
    pub failed_login_attempts: Option<i64>,
    pub lockout_end_at: Option<DateTime<Utc>>,
    pub mfa_enabled: Option<bool>,
    pub mfa_secret: Option<String>,
    pub mfa_backup_codes: Option<String>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub last_login_ip: Option<String>,
    #[sqlx(rename = "_status")]
    pub status_internal: String, // Maps to _status column
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub profile_type: Option<String>,
    pub status: Option<String>,
}
