use crate::features::transaction::dtos::transaction_item_dto::{
    CreateTransactionItemDTO, UpdateTransactionItemDTO,
};
use crate::features::transaction::models::transaction_model::TransactionItem;
use crate::features::transaction::repositories::transaction_items_repository::TransactionItemsRepository;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_transaction_item(
    pool: State<'_, SqlitePool>,
    payload: CreateTransactionItemDTO,
) -> Result<TransactionItem, String> {
    let repo = TransactionItemsRepository::new(pool.inner().clone());
    let item = payload.into_model();
    repo.create(item)
        .await
        .map_err(|e| format!("Failed to create transaction item: {}", e))
}

#[tauri::command]
pub async fn update_transaction_item(
    pool: State<'_, SqlitePool>,
    payload: UpdateTransactionItemDTO,
) -> Result<TransactionItem, String> {
    let repo = TransactionItemsRepository::new(pool.inner().clone());

    let existing = repo
        .get_by_id(&payload.id)
        .await
        .map_err(|e| format!("Failed to fetch transaction item: {}", e))?
        .ok_or_else(|| format!("Transaction item not found: {}", payload.id))?;

    let updated = payload.apply_to_model(existing);
    repo.update(updated)
        .await
        .map_err(|e| format!("Failed to update transaction item: {}", e))
}

#[tauri::command]
pub async fn delete_transaction_item(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let repo = TransactionItemsRepository::new(pool.inner().clone());
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete transaction item: {}", e))
}

#[tauri::command]
pub async fn get_transaction_item(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<TransactionItem>, String> {
    let repo = TransactionItemsRepository::new(pool.inner().clone());
    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to fetch transaction item: {}", e))
}

#[tauri::command]
pub async fn list_transaction_items(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<TransactionItem>, String> {
    let repo = TransactionItemsRepository::new(pool.inner().clone());
    repo.list()
        .await
        .map_err(|e| format!("Failed to list transaction items: {}", e))
}

#[tauri::command]
pub async fn list_transaction_items_by_transaction(
    pool: State<'_, SqlitePool>,
    transaction_id: String,
) -> Result<Vec<TransactionItem>, String> {
    let repo = TransactionItemsRepository::new(pool.inner().clone());
    repo.find_by_transaction_id(&transaction_id)
        .await
        .map_err(|e| format!("Failed to list transaction items: {}", e))
}
