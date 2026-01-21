use crate::features::inventory::dtos::inventory_movement_dto::CreateInventoryMovementDTO;
use crate::features::inventory::repositories::inventory_movements_repository::InventoryMovementsRepository;
use crate::features::transaction::models::transaction_model::InventoryMovement;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_inventory_movement(
    pool: State<'_, SqlitePool>,
    payload: CreateInventoryMovementDTO,
) -> Result<InventoryMovement, String> {
    let repo = InventoryMovementsRepository::new(pool.inner().clone());
    let movement = payload.into_model();
    let created = repo
        .create_many(vec![movement])
        .await
        .map_err(|e| format!("Failed to create inventory movement: {}", e))?;
    created
        .into_iter()
        .next()
        .ok_or_else(|| "Failed to retrieve created movement".to_string())
}

#[tauri::command]
pub async fn list_inventory_movements(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<InventoryMovement>, String> {
    let repo = InventoryMovementsRepository::new(pool.inner().clone());
    repo.get_all()
        .await
        .map_err(|e| format!("Failed to list inventory movements: {}", e))
}

#[tauri::command]
pub async fn list_inventory_movements_by_transaction(
    pool: State<'_, SqlitePool>,
    transaction_id: String,
) -> Result<Vec<InventoryMovement>, String> {
    let repo = InventoryMovementsRepository::new(pool.inner().clone());
    repo.find_by_transaction_id(&transaction_id)
        .await
        .map_err(|e| format!("Failed to list movements by transaction: {}", e))
}

#[tauri::command]
pub async fn list_inventory_movements_by_level(
    pool: State<'_, SqlitePool>,
    inventory_level_id: String,
) -> Result<Vec<InventoryMovement>, String> {
    let repo = InventoryMovementsRepository::new(pool.inner().clone());
    repo.find_by_inventory_level_id(&inventory_level_id)
        .await
        .map_err(|e| format!("Failed to list movements by inventory level: {}", e))
}
