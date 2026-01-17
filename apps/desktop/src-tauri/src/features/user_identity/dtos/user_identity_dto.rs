use crate::features::user::models::user_model::UserIdentity;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserIdentityDTO {
    pub user_id: String,
    pub provider: String,
    pub provider_user_id: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub profile_data: Option<String>,
}

impl CreateUserIdentityDTO {
    pub fn into_model(self) -> UserIdentity {
        let now = Utc::now();
        UserIdentity {
            id: Uuid::new_v4().to_string(),
            user_id: self.user_id,
            provider: self.provider,
            provider_user_id: self.provider_user_id,
            access_token: self.access_token,
            refresh_token: self.refresh_token,
            expires_at: self.expires_at,
            profile_data: self.profile_data,
            sync_status: "created".to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserIdentityDTO {
    pub id: String,
    pub user_id: Option<String>,
    pub provider: Option<String>,
    pub provider_user_id: Option<String>,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub profile_data: Option<String>,
    pub sync_status: Option<String>,
}

impl UpdateUserIdentityDTO {
    pub fn apply_to_model(self, mut identity: UserIdentity) -> UserIdentity {
        let now = Utc::now();
        if let Some(user_id) = self.user_id {
            identity.user_id = user_id;
        }
        if let Some(provider) = self.provider {
            identity.provider = provider;
        }
        if let Some(provider_user_id) = self.provider_user_id {
            identity.provider_user_id = provider_user_id;
        }
        if let Some(access_token) = self.access_token {
            identity.access_token = Some(access_token);
        }
        if let Some(refresh_token) = self.refresh_token {
            identity.refresh_token = Some(refresh_token);
        }
        if let Some(expires_at) = self.expires_at {
            identity.expires_at = Some(expires_at);
        }
        if let Some(profile_data) = self.profile_data {
            identity.profile_data = Some(profile_data);
        }
        if let Some(sync_status) = self.sync_status {
            identity.sync_status = sync_status;
        }
        identity.updated_at = now;
        identity
    }
}
