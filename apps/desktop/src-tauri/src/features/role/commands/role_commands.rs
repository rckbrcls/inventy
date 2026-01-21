use crate::features::role::dtos::{CreateRoleDTO, UpdateRoleDTO};
use crate::features::role::models::role_model::Role;
use crate::features::role::services::role_service::RoleService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_role(
    pool: State<'_, SqlitePool>,
    payload: CreateRoleDTO,
) -> Result<Role, String> {
    let service = RoleService::new(pool.inner().clone());
    service.create_role(payload).await
}

#[tauri::command]
pub async fn update_role(
    pool: State<'_, SqlitePool>,
    payload: UpdateRoleDTO,
) -> Result<Role, String> {
    let service = RoleService::new(pool.inner().clone());
    service.update_role(payload).await
}

#[tauri::command]
pub async fn delete_role(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = RoleService::new(pool.inner().clone());
    service.delete_role(&id).await
}

#[tauri::command]
pub async fn get_role(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Role>, String> {
    let service = RoleService::new(pool.inner().clone());
    service.get_role(&id).await
}

#[tauri::command]
pub async fn list_roles(pool: State<'_, SqlitePool>) -> Result<Vec<Role>, String> {
    let service = RoleService::new(pool.inner().clone());
    service.list_roles().await
}
