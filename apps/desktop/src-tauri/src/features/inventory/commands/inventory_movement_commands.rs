use crate::db::RepositoryFactory;
use crate::features::inventory::dtos::inventory_movement_dto::CreateInventoryMovementDTO;
use crate::features::inventory::services::shop_inventory_service::ShopInventoryService;
use crate::features::transaction::models::transaction_model::InventoryMovement;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_inventory_movement(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: CreateInventoryMovementDTO,
) -> Result<InventoryMovement, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    let movement = payload.into_model();
    let created = service.create_movement(&movement).await?;
    Ok(created)
}

#[tauri::command]
pub async fn list_inventory_movements(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<InventoryMovement>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service.list_movements().await
}

#[tauri::command]
pub async fn list_inventory_movements_by_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    transaction_id: String,
) -> Result<Vec<InventoryMovement>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service
        .list_movements_by_transaction(&transaction_id)
        .await
}

#[tauri::command]
pub async fn list_inventory_movements_by_level(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    inventory_level_id: String,
) -> Result<Vec<InventoryMovement>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service
        .list_movements_by_inventory_level(&inventory_level_id)
        .await
}

#[tauri::command]
pub async fn list_inventory_movements_by_shop(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<InventoryMovement>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let service = ShopInventoryService::new(pool);
    service.list_movements().await
}
