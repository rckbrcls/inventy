use crate::features::user_session::dtos::{CreateUserSessionDTO, UpdateUserSessionDTO};
use crate::features::user::models::user_model::UserSession;
use crate::features::user_session::services::user_session_service::UserSessionService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_user_session(
    pool: State<'_, SqlitePool>,
    payload: CreateUserSessionDTO,
) -> Result<UserSession, String> {
    let service = UserSessionService::new(pool.inner().clone());
    service.create_session(payload).await
}

#[tauri::command]
pub async fn update_user_session(
    pool: State<'_, SqlitePool>,
    payload: UpdateUserSessionDTO,
) -> Result<UserSession, String> {
    let service = UserSessionService::new(pool.inner().clone());
    service.update_session(payload).await
}

#[tauri::command]
pub async fn delete_user_session(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = UserSessionService::new(pool.inner().clone());
    service.delete_session(&id).await
}

#[tauri::command]
pub async fn get_user_session(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<UserSession>, String> {
    let service = UserSessionService::new(pool.inner().clone());
    service.get_session(&id).await
}

#[tauri::command]
pub async fn list_user_sessions(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<UserSession>, String> {
    let service = UserSessionService::new(pool.inner().clone());
    service.list_sessions().await
}

#[tauri::command]
pub async fn list_user_sessions_by_user(
    pool: State<'_, SqlitePool>,
    user_id: String,
) -> Result<Vec<UserSession>, String> {
    let service = UserSessionService::new(pool.inner().clone());
    service.list_sessions_by_user(&user_id).await
}
