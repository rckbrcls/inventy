use crate::features::user::models::user_model::{User, UserIdentity, UserRole};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserIdentityInput {
    pub provider: String,
    pub provider_user_id: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<chrono::DateTime<Utc>>,
    pub profile_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserDTO {
    pub email: Option<String>,
    pub phone: Option<String>,
    pub password: Option<String>,
    pub profile_type: Option<String>,
    pub status: Option<String>,
    pub role_ids: Vec<String>,
    pub identities: Vec<CreateUserIdentityInput>,
}

impl CreateUserDTO {
    pub fn into_models(self) -> (User, Vec<UserRole>, Vec<UserIdentity>) {
        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let user = User {
            id: user_id.clone(),
            email: self.email,
            phone: self.phone,
            password_hash: self.password, // Ideally hashed before being passed here
            security_stamp: Some(Uuid::new_v4().to_string()),
            is_email_verified: Some(false),
            is_phone_verified: Some(false),
            failed_login_attempts: Some(0),
            lockout_end_at: None,
            mfa_enabled: Some(false),
            mfa_secret: None,
            mfa_backup_codes: None,
            last_login_at: None,
            last_login_ip: None,
            status_internal: "created".to_string(),
            created_at: now,
            updated_at: now,
            profile_type: self.profile_type,
            status: self.status.or(Some("active".to_string())),
        };

        let roles = self.role_ids
            .into_iter()
            .map(|rid| UserRole {
                user_id: user_id.clone(),
                role_id: rid,
                sync_status: "created".to_string(),
                created_at: now,
                updated_at: now,
            })
            .collect();

        let identities = self
            .identities
            .into_iter()
            .map(|identity| UserIdentity {
                id: Uuid::new_v4().to_string(),
                user_id: user_id.clone(),
                provider: identity.provider,
                provider_user_id: identity.provider_user_id,
                access_token: identity.access_token,
                refresh_token: identity.refresh_token,
                expires_at: identity.expires_at,
                profile_data: identity.profile_data,
                sync_status: "created".to_string(),
                created_at: now,
                updated_at: now,
            })
            .collect();

        (user, roles, identities)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserDTO {
    pub id: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub password_hash: Option<String>,
    pub security_stamp: Option<String>,
    pub is_email_verified: Option<bool>,
    pub is_phone_verified: Option<bool>,
    pub failed_login_attempts: Option<i64>,
    pub lockout_end_at: Option<chrono::DateTime<Utc>>,
    pub mfa_enabled: Option<bool>,
    pub mfa_secret: Option<String>,
    pub mfa_backup_codes: Option<String>,
    pub last_login_at: Option<chrono::DateTime<Utc>>,
    pub last_login_ip: Option<String>,
    pub status_internal: Option<String>,
    pub profile_type: Option<String>,
    pub status: Option<String>,
}

impl UpdateUserDTO {
    pub fn apply_to_model(self, mut user: User) -> User {
        let now = Utc::now();
        if let Some(email) = self.email {
            user.email = Some(email);
        }
        if let Some(phone) = self.phone {
            user.phone = Some(phone);
        }
        if let Some(password_hash) = self.password_hash {
            user.password_hash = Some(password_hash);
        }
        if let Some(security_stamp) = self.security_stamp {
            user.security_stamp = Some(security_stamp);
        }
        if let Some(is_email_verified) = self.is_email_verified {
            user.is_email_verified = Some(is_email_verified);
        }
        if let Some(is_phone_verified) = self.is_phone_verified {
            user.is_phone_verified = Some(is_phone_verified);
        }
        if let Some(failed_login_attempts) = self.failed_login_attempts {
            user.failed_login_attempts = Some(failed_login_attempts);
        }
        if let Some(lockout_end_at) = self.lockout_end_at {
            user.lockout_end_at = Some(lockout_end_at);
        }
        if let Some(mfa_enabled) = self.mfa_enabled {
            user.mfa_enabled = Some(mfa_enabled);
        }
        if let Some(mfa_secret) = self.mfa_secret {
            user.mfa_secret = Some(mfa_secret);
        }
        if let Some(mfa_backup_codes) = self.mfa_backup_codes {
            user.mfa_backup_codes = Some(mfa_backup_codes);
        }
        if let Some(last_login_at) = self.last_login_at {
            user.last_login_at = Some(last_login_at);
        }
        if let Some(last_login_ip) = self.last_login_ip {
            user.last_login_ip = Some(last_login_ip);
        }
        if let Some(status_internal) = self.status_internal {
            user.status_internal = status_internal;
        }
        if let Some(profile_type) = self.profile_type {
            user.profile_type = Some(profile_type);
        }
        if let Some(status) = self.status {
            user.status = Some(status);
        }
        user.updated_at = now;
        user
    }
}
