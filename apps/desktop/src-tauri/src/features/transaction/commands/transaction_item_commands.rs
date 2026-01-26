use crate::db::RepositoryFactory;
use crate::features::transaction::dtos::transaction_item_dto::{
    CreateTransactionItemDTO, UpdateTransactionItemDTO,
};
use crate::features::transaction::models::transaction_model::TransactionItem;
use crate::features::transaction::repositories::transaction_items_repository::TransactionItemsRepository;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_transaction_item(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: CreateTransactionItemDTO,
) -> Result<TransactionItem, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let repo = TransactionItemsRepository::new((*pool).clone());
    let item = payload.into_model();
    repo.create(item)
        .await
        .map_err(|e| format!("Failed to create transaction item: {}", e))
}

#[tauri::command]
pub async fn update_transaction_item(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: UpdateTransactionItemDTO,
) -> Result<TransactionItem, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let repo = TransactionItemsRepository::new((*pool).clone());

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
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<(), String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let repo = TransactionItemsRepository::new((*pool).clone());
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete transaction item: {}", e))
}

#[tauri::command]
pub async fn get_transaction_item(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    id: String,
) -> Result<Option<TransactionItem>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let repo = TransactionItemsRepository::new((*pool).clone());
    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to fetch transaction item: {}", e))
}

#[tauri::command]
pub async fn list_transaction_items(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<TransactionItem>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let repo = TransactionItemsRepository::new((*pool).clone());
    repo.list()
        .await
        .map_err(|e| format!("Failed to list transaction items: {}", e))
}

#[tauri::command]
pub async fn list_transaction_items_by_transaction(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    transaction_id: String,
) -> Result<Vec<TransactionItem>, String> {
    let pool = repo_factory
        .shop_pool(&shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    let repo = TransactionItemsRepository::new((*pool).clone());
    repo.find_by_transaction_id(&transaction_id)
        .await
        .map_err(|e| format!("Failed to list transaction items: {}", e))
}
