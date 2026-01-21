use crate::features::user_identity::dtos::{CreateUserIdentityDTO, UpdateUserIdentityDTO};
use crate::features::user::models::user_model::UserIdentity;
use crate::features::user_identity::repositories::user_identities_repository::UserIdentitiesRepository;
use sqlx::SqlitePool;

pub struct UserIdentityService {
    repo: UserIdentitiesRepository,
}

impl UserIdentityService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = UserIdentitiesRepository::new(pool);
        Self { repo }
    }

    pub async fn create_identity(
        &self,
        payload: CreateUserIdentityDTO,
    ) -> Result<UserIdentity, String> {
        let identity = payload.into_model();
        self.repo
            .create(identity)
            .await
            .map_err(|e| format!("Failed to create identity: {}", e))
    }

    pub async fn update_identity(
        &self,
        payload: UpdateUserIdentityDTO,
    ) -> Result<UserIdentity, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch identity: {}", e))?
            .ok_or_else(|| format!("Identity not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update identity: {}", e))
    }

    pub async fn delete_identity(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete identity: {}", e))
    }

    pub async fn get_identity(&self, id: &str) -> Result<Option<UserIdentity>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch identity: {}", e))
    }

    pub async fn list_identities(&self) -> Result<Vec<UserIdentity>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list identities: {}", e))
    }

    pub async fn list_identities_by_user(
        &self,
        user_id: &str,
    ) -> Result<Vec<UserIdentity>, String> {
        self.repo
            .find_by_user_id(user_id)
            .await
            .map_err(|e| format!("Failed to list identities by user: {}", e))
    }
}
