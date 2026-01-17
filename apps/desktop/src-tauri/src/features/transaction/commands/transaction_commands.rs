use crate::features::transaction::dtos::transaction_dto::CreateTransactionDTO;
use crate::features::transaction::models::transaction_model::Transaction;
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
