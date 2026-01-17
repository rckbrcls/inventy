use crate::features::user_role::dtos::AssignUserRolesDTO;
use crate::features::user::models::user_model::UserRole;
use crate::features::user_role::services::user_role_service::UserRoleService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn assign_user_roles(
    pool: State<'_, SqlitePool>,
    payload: AssignUserRolesDTO,
) -> Result<Vec<UserRole>, String> {
    let service = UserRoleService::new(pool.inner().clone());
    service.assign_roles(payload).await
}

#[tauri::command]
pub async fn list_user_roles_by_user(
    pool: State<'_, SqlitePool>,
    user_id: String,
) -> Result<Vec<UserRole>, String> {
    let service = UserRoleService::new(pool.inner().clone());
    service.list_roles_by_user(&user_id).await
}

#[tauri::command]
pub async fn delete_user_role(
    pool: State<'_, SqlitePool>,
    user_id: String,
    role_id: String,
) -> Result<(), String> {
    let service = UserRoleService::new(pool.inner().clone());
    service.delete_role(&user_id, &role_id).await
}
