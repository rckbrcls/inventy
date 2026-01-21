use crate::features::user::dtos::user_dto::{CreateUserDTO, UpdateUserDTO};
use crate::features::user::models::user_model::User;
use crate::features::user::services::user_service::UserService;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_user(
    pool: State<'_, SqlitePool>,
    payload: CreateUserDTO,
) -> Result<User, String> {
    let service = UserService::new(pool.inner().clone());
    service.create_user(payload).await
}

#[tauri::command]
pub async fn update_user(
    pool: State<'_, SqlitePool>,
    payload: UpdateUserDTO,
) -> Result<User, String> {
    let service = UserService::new(pool.inner().clone());
    service.update_user(payload).await
}

#[tauri::command]
pub async fn delete_user(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = UserService::new(pool.inner().clone());
    service.delete_user(&id).await
}

#[tauri::command]
pub async fn get_user(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<User>, String> {
    let service = UserService::new(pool.inner().clone());
    service.get_user(&id).await
}

#[tauri::command]
pub async fn list_users(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<User>, String> {
    let service = UserService::new(pool.inner().clone());
    service.list_users().await
}
