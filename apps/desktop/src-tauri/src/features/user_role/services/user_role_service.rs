use crate::features::user_role::dtos::AssignUserRolesDTO;
use crate::features::user::models::user_model::UserRole;
use crate::features::user_role::repositories::user_roles_repository::UserRolesRepository;
use sqlx::SqlitePool;

pub struct UserRoleService {
    repo: UserRolesRepository,
}

impl UserRoleService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = UserRolesRepository::new(pool);
        Self { repo }
    }

    pub async fn assign_roles(&self, payload: AssignUserRolesDTO) -> Result<Vec<UserRole>, String> {
        let user_id = payload.user_id.clone();
        let roles = payload.into_models();
        if roles.is_empty() {
            self.repo
                .delete_by_user_id(&user_id)
                .await
                .map_err(|e| format!("Failed to clear user roles: {}", e))?;
            return Ok(Vec::new());
        }

        self.repo
            .delete_by_user_id(&user_id)
            .await
            .map_err(|e| format!("Failed to clear user roles: {}", e))?;

        self.repo
            .create_many(roles)
            .await
            .map_err(|e| format!("Failed to assign user roles: {}", e))
    }

    pub async fn list_roles_by_user(&self, user_id: &str) -> Result<Vec<UserRole>, String> {
        self.repo
            .find_by_user_id(user_id)
            .await
            .map_err(|e| format!("Failed to list user roles: {}", e))
    }

    pub async fn delete_role(&self, user_id: &str, role_id: &str) -> Result<(), String> {
        self.repo
            .delete(user_id, role_id)
            .await
            .map_err(|e| format!("Failed to delete user role: {}", e))
    }
}
