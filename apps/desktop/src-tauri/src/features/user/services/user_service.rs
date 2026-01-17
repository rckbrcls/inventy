use crate::features::user::dtos::user_dto::{CreateUserDTO, UpdateUserDTO};
use crate::features::user::models::user_model::User;
use crate::features::user_identity::repositories::user_identities_repository::UserIdentitiesRepository;
use crate::features::user::repositories::user_repository::UserRepository;
use crate::features::user_role::repositories::user_roles_repository::UserRolesRepository;
use crate::features::user_session::repositories::user_sessions_repository::UserSessionsRepository;
use sqlx::SqlitePool;

pub struct UserService {
    pool: SqlitePool,
    repo: UserRepository,
    identities_repo: UserIdentitiesRepository,
    roles_repo: UserRolesRepository,
    sessions_repo: UserSessionsRepository,
}

impl UserService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = UserRepository::new(pool.clone());
        let identities_repo = UserIdentitiesRepository::new(pool.clone());
        let roles_repo = UserRolesRepository::new(pool.clone());
        let sessions_repo = UserSessionsRepository::new(pool.clone());
        Self {
            pool,
            repo,
            identities_repo,
            roles_repo,
            sessions_repo,
        }
    }

    pub async fn create_user(&self, payload: CreateUserDTO) -> Result<User, String> {
        let (user, roles, identities) = payload.into_models();
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        let created_user = self
            .repo
            .create_in_tx(&mut tx, &user)
            .await
            .map_err(|e| format!("Failed to create user: {}", e))?;

        if !roles.is_empty() {
            self.roles_repo
                .create_many_in_tx(&mut tx, roles)
                .await
                .map_err(|e| format!("Failed to create user roles: {}", e))?;
        }

        if !identities.is_empty() {
            self.identities_repo
                .create_many_in_tx(&mut tx, identities)
                .await
                .map_err(|e| format!("Failed to create user identities: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(created_user)
    }

    pub async fn update_user(&self, payload: UpdateUserDTO) -> Result<User, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch user: {}", e))?
            .ok_or_else(|| format!("User not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update user: {}", e))
    }

    pub async fn delete_user(&self, id: &str) -> Result<(), String> {
        self.identities_repo
            .delete_by_user_id(id)
            .await
            .map_err(|e| format!("Failed to delete identities: {}", e))?;
        self.roles_repo
            .delete_by_user_id(id)
            .await
            .map_err(|e| format!("Failed to delete roles: {}", e))?;
        self.sessions_repo
            .delete_by_user_id(id)
            .await
            .map_err(|e| format!("Failed to delete sessions: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete user: {}", e))
    }

    pub async fn get_user(&self, id: &str) -> Result<Option<User>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch user: {}", e))
    }

    pub async fn list_users(&self) -> Result<Vec<User>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list users: {}", e))
    }
}
