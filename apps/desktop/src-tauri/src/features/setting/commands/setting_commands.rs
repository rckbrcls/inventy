use crate::features::setting::dtos::setting_dto::SetSettingDTO;
use crate::features::setting::services::setting_service::SettingService;
use sqlx::SqlitePool;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn get_setting(
    pool: State<'_, SqlitePool>,
    key: String,
) -> Result<Option<String>, String> {
    let service = SettingService::new(pool.inner().clone());
    service.get_setting(&key).await
}

#[tauri::command]
pub async fn set_setting(
    pool: State<'_, SqlitePool>,
    key: String,
    value: String,
) -> Result<(), String> {
    let service = SettingService::new(pool.inner().clone());
    service.set_setting(SetSettingDTO { key, value }).await
}

#[tauri::command]
pub async fn get_all_settings(
    pool: State<'_, SqlitePool>,
) -> Result<HashMap<String, String>, String> {
    let service = SettingService::new(pool.inner().clone());
    service.get_all_settings().await
}

#[tauri::command]
pub async fn delete_setting(
    pool: State<'_, SqlitePool>,
    key: String,
) -> Result<(), String> {
    let service = SettingService::new(pool.inner().clone());
    service.delete_setting(&key).await
}
