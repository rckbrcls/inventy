use crate::features::role::dtos::{CreateRoleDTO, UpdateRoleDTO};
use crate::features::role::models::role_model::Role;
use crate::features::role::repositories::roles_repository::RoleRepository;
use sqlx::SqlitePool;

pub struct RoleService {
    repo: RoleRepository,
}

impl RoleService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = RoleRepository::new(pool);
        Self { repo }
    }

    pub async fn create_role(&self, payload: CreateRoleDTO) -> Result<Role, String> {
        let role = payload.into_model();
        self.repo
            .create(role)
            .await
            .map_err(|e| format!("Failed to create role: {}", e))
    }

    pub async fn update_role(&self, payload: UpdateRoleDTO) -> Result<Role, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch role: {}", e))?
            .ok_or_else(|| format!("Role not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update role: {}", e))
    }

    pub async fn delete_role(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete role: {}", e))
    }

    pub async fn get_role(&self, id: &str) -> Result<Option<Role>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch role: {}", e))
    }

    pub async fn list_roles(&self) -> Result<Vec<Role>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list roles: {}", e))
    }
}
