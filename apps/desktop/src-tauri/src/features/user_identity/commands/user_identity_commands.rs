use crate::features::user_identity::dtos::{CreateUserIdentityDTO, UpdateUserIdentityDTO};
use crate::features::user::models::user_model::UserIdentity;
use crate::features::user_identity::services::user_identity_service::UserIdentityService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_user_identity(
    pool: State<'_, SqlitePool>,
    payload: CreateUserIdentityDTO,
) -> Result<UserIdentity, String> {
    let service = UserIdentityService::new(pool.inner().clone());
    service.create_identity(payload).await
}

#[tauri::command]
pub async fn update_user_identity(
    pool: State<'_, SqlitePool>,
    payload: UpdateUserIdentityDTO,
) -> Result<UserIdentity, String> {
    let service = UserIdentityService::new(pool.inner().clone());
    service.update_identity(payload).await
}

#[tauri::command]
pub async fn delete_user_identity(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = UserIdentityService::new(pool.inner().clone());
    service.delete_identity(&id).await
}

#[tauri::command]
pub async fn get_user_identity(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<UserIdentity>, String> {
    let service = UserIdentityService::new(pool.inner().clone());
    service.get_identity(&id).await
}

#[tauri::command]
pub async fn list_user_identities(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<UserIdentity>, String> {
    let service = UserIdentityService::new(pool.inner().clone());
    service.list_identities().await
}

#[tauri::command]
pub async fn list_user_identities_by_user(
    pool: State<'_, SqlitePool>,
    user_id: String,
) -> Result<Vec<UserIdentity>, String> {
    let service = UserIdentityService::new(pool.inner().clone());
    service.list_identities_by_user(&user_id).await
}
