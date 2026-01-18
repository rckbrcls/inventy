use crate::features::inventory::dtos::inventory_level_dto::{
    AdjustStockDTO, CreateInventoryLevelDTO, TransferStockDTO, UpdateInventoryLevelDTO,
};
use crate::features::inventory::models::inventory_level_model::InventoryLevel;
use crate::features::inventory::repositories::inventory_levels_repository::InventoryLevelsRepository;
use crate::features::inventory::services::inventory_service::InventoryService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_inventory_level(
    pool: State<'_, SqlitePool>,
    payload: CreateInventoryLevelDTO,
) -> Result<InventoryLevel, String> {
    let repo = InventoryLevelsRepository::new(pool.inner().clone());
    let level = payload.into_model();
    repo.create(level)
        .await
        .map_err(|e| format!("Failed to create inventory level: {}", e))
}

#[tauri::command]
pub async fn update_inventory_level(
    pool: State<'_, SqlitePool>,
    payload: UpdateInventoryLevelDTO,
) -> Result<InventoryLevel, String> {
    let repo = InventoryLevelsRepository::new(pool.inner().clone());
    let existing = repo
        .find_by_id(&payload.id)
        .await
        .map_err(|e| format!("Failed to fetch inventory level: {}", e))?
        .ok_or_else(|| format!("Inventory level not found: {}", payload.id))?;

    let updated = payload.apply_to_model(existing);
    repo.update(updated)
        .await
        .map_err(|e| format!("Failed to update inventory level: {}", e))
}

#[tauri::command]
pub async fn delete_inventory_level(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let repo = InventoryLevelsRepository::new(pool.inner().clone());
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete inventory level: {}", e))
}

#[tauri::command]
pub async fn get_inventory_level(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<InventoryLevel>, String> {
    let repo = InventoryLevelsRepository::new(pool.inner().clone());
    repo.find_by_id(&id)
        .await
        .map_err(|e| format!("Failed to fetch inventory level: {}", e))
}

#[tauri::command]
pub async fn list_inventory_levels(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<InventoryLevel>, String> {
    let repo = InventoryLevelsRepository::new(pool.inner().clone());
    repo.get_all()
        .await
        .map_err(|e| format!("Failed to list inventory levels: {}", e))
}

#[tauri::command]
pub async fn list_inventory_levels_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<InventoryLevel>, String> {
    let repo = InventoryLevelsRepository::new(pool.inner().clone());
    repo.list_by_shop(&shop_id)
        .await
        .map_err(|e| format!("Failed to list inventory levels by shop: {}", e))
}

#[tauri::command]
pub async fn adjust_stock(pool: State<'_, SqlitePool>, payload: AdjustStockDTO) -> Result<(), String> {
    let service = InventoryService::new(pool.inner().clone());
    service
        .adjust_stock(
            &payload.product_id,
            &payload.location_id,
            payload.new_quantity,
            payload.reason.as_deref(),
        )
        .await
}

#[tauri::command]
pub async fn transfer_stock(
    pool: State<'_, SqlitePool>,
    payload: TransferStockDTO,
) -> Result<(), String> {
    let service = InventoryService::new(pool.inner().clone());
    service
        .transfer_stock(
            &payload.product_id,
            &payload.from_location_id,
            &payload.to_location_id,
            payload.quantity,
            payload.reason.as_deref(),
        )
        .await
}

#[tauri::command]
pub async fn get_available_quantity(
    pool: State<'_, SqlitePool>,
    product_id: String,
    location_id: String,
) -> Result<f64, String> {
    let service = InventoryService::new(pool.inner().clone());
    service.get_available_quantity(&product_id, &location_id).await
}
