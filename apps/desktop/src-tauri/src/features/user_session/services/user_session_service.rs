use crate::features::user_session::dtos::{CreateUserSessionDTO, UpdateUserSessionDTO};
use crate::features::user::models::user_model::UserSession;
use crate::features::user_session::repositories::user_sessions_repository::UserSessionsRepository;
use sqlx::SqlitePool;

pub struct UserSessionService {
    repo: UserSessionsRepository,
}

impl UserSessionService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = UserSessionsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_session(
        &self,
        payload: CreateUserSessionDTO,
    ) -> Result<UserSession, String> {
        let session = payload.into_model();
        self.repo
            .create(session)
            .await
            .map_err(|e| format!("Failed to create session: {}", e))
    }

    pub async fn update_session(
        &self,
        payload: UpdateUserSessionDTO,
    ) -> Result<UserSession, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch session: {}", e))?
            .ok_or_else(|| format!("Session not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update session: {}", e))
    }

    pub async fn delete_session(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete session: {}", e))
    }

    pub async fn get_session(&self, id: &str) -> Result<Option<UserSession>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch session: {}", e))
    }

    pub async fn list_sessions(&self) -> Result<Vec<UserSession>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list sessions: {}", e))
    }

    pub async fn list_sessions_by_user(
        &self,
        user_id: &str,
    ) -> Result<Vec<UserSession>, String> {
        self.repo
            .find_by_user_id(user_id)
            .await
            .map_err(|e| format!("Failed to list sessions by user: {}", e))
    }
}
