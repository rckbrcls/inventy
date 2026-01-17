use crate::features::user::models::user_model::UserRole;
use chrono::Utc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AssignUserRolesDTO {
    pub user_id: String,
    pub role_ids: Vec<String>,
}

impl AssignUserRolesDTO {
    pub fn into_models(self) -> Vec<UserRole> {
        let now = Utc::now();
        self.role_ids
            .into_iter()
            .map(|role_id| UserRole {
                user_id: self.user_id.clone(),
                role_id,
                sync_status: "created".to_string(),
                created_at: now,
                updated_at: now,
            })
            .collect()
    }
}
