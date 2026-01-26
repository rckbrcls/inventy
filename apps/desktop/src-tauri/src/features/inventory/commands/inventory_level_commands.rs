use crate::db::RepositoryFactory;
use crate::features::inventory::dtos::inventory_level_dto::{
    AdjustStockDTO, CreateInventoryLevelDTO, TransferStockDTO, UpdateInventoryLevelDTO,
};
use crate::features::inventory::models::inventory_level_model::InventoryLevel;
use crate::features::inventory::services::inventory_service::InventoryService;
use crate::features::inventory::services::shop_inventory_service::ShopInventoryService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_inventory_level(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: CreateInventoryLevelDTO,
) -> Result<InventoryLevel, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    let level = payload.into_model();
    service.create_level(&level).await
}

#[tauri::command]
pub async fn update_inventory_level(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateInventoryLevelDTO,
) -> Result<InventoryLevel, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    let existing = service
        .get_level(&payload.id)
        .await?
        .ok_or_else(|| format!("Inventory level not found: {}", payload.id))?;
    let updated = payload.apply_to_model(existing);
    service.update_level(&updated).await
}

#[tauri::command]
pub async fn delete_inventory_level(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service.delete_level(&id).await
}

#[tauri::command]
pub async fn get_inventory_level(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<InventoryLevel>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service.get_level(&id).await
}

#[tauri::command]
pub async fn list_inventory_levels_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<InventoryLevel>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service.list_levels().await
}

#[tauri::command]
pub async fn adjust_stock(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: AdjustStockDTO,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = InventoryService::new((*pool).clone());
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
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: TransferStockDTO,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = InventoryService::new((*pool).clone());
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
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    product_id: String,
    location_id: String,
) -> Result<f64, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = InventoryService::new((*pool).clone());
    service.get_available_quantity(&product_id, &location_id).await
}
