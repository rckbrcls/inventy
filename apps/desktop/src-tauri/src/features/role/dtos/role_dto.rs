use crate::features::role::models::role_model::Role;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateRoleDTO {
    pub name: String,
    pub permissions: Option<String>,
}

impl CreateRoleDTO {
    pub fn into_model(self) -> Role {
        let now = Utc::now();
        Role {
            id: Uuid::new_v4().to_string(),
            name: self.name,
            permissions: self.permissions,
            status_internal: "created".to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateRoleDTO {
    pub id: String,
    pub name: Option<String>,
    pub permissions: Option<String>,
    pub status_internal: Option<String>,
}

impl UpdateRoleDTO {
    pub fn apply_to_model(self, mut role: Role) -> Role {
        let now = Utc::now();
        if let Some(name) = self.name {
            role.name = name;
        }
        if let Some(permissions) = self.permissions {
            role.permissions = Some(permissions);
        }
        if let Some(status_internal) = self.status_internal {
            role.status_internal = status_internal;
        }
        role.updated_at = now;
        role
    }
}
