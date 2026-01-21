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

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserIdentity {
    pub id: String,
    pub user_id: String,
    pub provider: String,
    pub provider_user_id: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub profile_data: Option<String>, // JSONB stored as TEXT
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserSession {
    pub id: String,
    pub user_id: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub device_type: Option<String>,
    pub location: Option<String>,
    pub token_hash: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_active_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserRole {
    pub user_id: String,
    pub role_id: String,
    #[serde(rename = "_status")]
    #[sqlx(rename = "_status")]
    pub sync_status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
