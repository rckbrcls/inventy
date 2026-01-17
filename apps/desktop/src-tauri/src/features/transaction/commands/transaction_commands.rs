use crate::features::transaction::dtos::transaction_dto::{
    CreateTransactionDTO, UpdateTransactionDTO, UpdateTransactionStatusDTO, CompleteSaleDTO
};
use crate::features::transaction::models::transaction_model::Transaction;
use crate::features::transaction::repositories::transactions_repository::TransactionsRepository;
use crate::features::transaction::services::transaction_service::TransactionService;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_transaction(
    pool: State<'_, SqlitePool>,
    payload: CreateTransactionDTO,
) -> Result<Transaction, String> {
    let service = TransactionService::new(pool.inner().clone());
    service.create_transaction(payload).await
}

#[tauri::command]
pub async fn update_transaction(
    pool: State<'_, SqlitePool>,
    payload: UpdateTransactionDTO,
) -> Result<Transaction, String> {
    let repo = TransactionsRepository::new(pool.inner().clone());

    let existing = repo
        .get_by_id(&payload.id)
        .await
        .map_err(|e| format!("Failed to fetch transaction: {}", e))?
        .ok_or_else(|| format!("Transaction not found: {}", payload.id))?;

    let updated = payload.apply_to_model(existing);
    repo.update(updated)
        .await
        .map_err(|e| format!("Failed to update transaction: {}", e))
}

#[tauri::command]
pub async fn delete_transaction(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = TransactionService::new(pool.inner().clone());
    service.delete_transaction(&id).await
}

#[tauri::command]
pub async fn get_transaction(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Transaction>, String> {
    let service = TransactionService::new(pool.inner().clone());
    service.get_transaction(&id).await
}

#[tauri::command]
pub async fn list_transactions(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Transaction>, String> {
    let service = TransactionService::new(pool.inner().clone());
    service.list_transactions().await
}

#[tauri::command]
pub async fn update_transaction_status(
    pool: State<'_, SqlitePool>,
    payload: UpdateTransactionStatusDTO,
) -> Result<Transaction, String> {
    let repo = TransactionsRepository::new(pool.inner().clone());

    let mut existing = repo
        .get_by_id(&payload.id)
        .await
        .map_err(|e| format!("Failed to fetch transaction: {}", e))?
        .ok_or_else(|| format!("Transaction not found: {}", payload.id))?;

    existing.status = payload.status;
    existing.sync_status = Some("updated".to_string());
    existing.updated_at = Some(chrono::Utc::now());

    repo.update(existing)
        .await
        .map_err(|e| format!("Failed to update transaction status: {}", e))
}

#[tauri::command]
pub async fn complete_sale_transaction(
    pool: State<'_, SqlitePool>,
    payload: CompleteSaleDTO,
) -> Result<Transaction, String> {
    let service = TransactionService::new(pool.inner().clone());
    service.complete_sale(&payload.id, &payload.location_id).await
}

#[tauri::command]
pub async fn cancel_transaction(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Transaction, String> {
    let service = TransactionService::new(pool.inner().clone());
    service.cancel_transaction(&id).await
}
