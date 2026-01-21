use crate::features::location::dtos::location_dto::{CreateLocationDTO, UpdateLocationDTO};
use crate::features::location::models::location_model::Location;
use crate::features::location::services::location_service::LocationService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_location(
    pool: State<'_, SqlitePool>,
    payload: CreateLocationDTO,
) -> Result<Location, String> {
    let service = LocationService::new(pool.inner().clone());
    service.create_location(payload).await
}

#[tauri::command]
pub async fn update_location(
    pool: State<'_, SqlitePool>,
    payload: UpdateLocationDTO,
) -> Result<Location, String> {
    let service = LocationService::new(pool.inner().clone());
    service.update_location(payload).await
}

#[tauri::command]
pub async fn delete_location(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = LocationService::new(pool.inner().clone());
    service.delete_location(&id).await
}

#[tauri::command]
pub async fn get_location(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Location>, String> {
    let service = LocationService::new(pool.inner().clone());
    service.get_location(&id).await
}

#[tauri::command]
pub async fn list_locations(pool: State<'_, SqlitePool>) -> Result<Vec<Location>, String> {
    let service = LocationService::new(pool.inner().clone());
    service.list_locations().await
}
