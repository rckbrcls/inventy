use crate::features::user::models::user_model::UserSession;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserSessionDTO {
    pub user_id: String,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub device_type: Option<String>,
    pub location: Option<String>,
    pub token_hash: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub last_active_at: Option<DateTime<Utc>>,
}

impl CreateUserSessionDTO {
    pub fn into_model(self) -> UserSession {
        let now = Utc::now();
        UserSession {
            id: Uuid::new_v4().to_string(),
            user_id: self.user_id,
            user_agent: self.user_agent,
            ip_address: self.ip_address,
            device_type: self.device_type,
            location: self.location,
            token_hash: self.token_hash,
            expires_at: self.expires_at,
            revoked_at: None,
            sync_status: "created".to_string(),
            created_at: now,
            updated_at: now,
            last_active_at: self.last_active_at,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserSessionDTO {
    pub id: String,
    pub user_id: Option<String>,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub device_type: Option<String>,
    pub location: Option<String>,
    pub token_hash: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub revoked_at: Option<DateTime<Utc>>,
    pub last_active_at: Option<DateTime<Utc>>,
    pub sync_status: Option<String>,
}

impl UpdateUserSessionDTO {
    pub fn apply_to_model(self, mut session: UserSession) -> UserSession {
        let now = Utc::now();
        if let Some(user_id) = self.user_id {
            session.user_id = user_id;
        }
        if let Some(user_agent) = self.user_agent {
            session.user_agent = Some(user_agent);
        }
        if let Some(ip_address) = self.ip_address {
            session.ip_address = Some(ip_address);
        }
        if let Some(device_type) = self.device_type {
            session.device_type = Some(device_type);
        }
        if let Some(location) = self.location {
            session.location = Some(location);
        }
        if let Some(token_hash) = self.token_hash {
            session.token_hash = Some(token_hash);
        }
        if let Some(expires_at) = self.expires_at {
            session.expires_at = expires_at;
        }
        if let Some(revoked_at) = self.revoked_at {
            session.revoked_at = Some(revoked_at);
        }
        if let Some(last_active_at) = self.last_active_at {
            session.last_active_at = Some(last_active_at);
        }
        if let Some(sync_status) = self.sync_status {
            session.sync_status = sync_status;
        }
        session.updated_at = now;
        session
    }
}
