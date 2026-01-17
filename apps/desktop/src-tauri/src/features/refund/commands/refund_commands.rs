use crate::features::refund::dtos::refund_dto::{CreateRefundDTO, UpdateRefundDTO};
use crate::features::refund::models::refund_model::Refund;
use crate::features::refund::services::refund_service::RefundService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_refund(
    pool: State<'_, SqlitePool>,
    payload: CreateRefundDTO,
) -> Result<Refund, String> {
    let service = RefundService::new(pool.inner());
    service.create_refund(payload).await
}

#[tauri::command]
pub async fn update_refund(
    pool: State<'_, SqlitePool>,
    payload: UpdateRefundDTO,
) -> Result<Refund, String> {
    let service = RefundService::new(pool.inner());
    service.update_refund(payload).await
}

#[tauri::command]
pub async fn delete_refund(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = RefundService::new(pool.inner());
    service.delete_refund(&id).await
}

#[tauri::command]
pub async fn get_refund(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Refund>, String> {
    let service = RefundService::new(pool.inner());
    service.get_refund(&id).await
}

#[tauri::command]
pub async fn list_refunds(pool: State<'_, SqlitePool>) -> Result<Vec<Refund>, String> {
    let service = RefundService::new(pool.inner());
    service.list_refunds().await
}

#[tauri::command]
pub async fn list_refunds_by_payment(
    pool: State<'_, SqlitePool>,
    payment_id: String,
) -> Result<Vec<Refund>, String> {
    let service = RefundService::new(pool.inner());
    service.list_refunds_by_payment(&payment_id).await
}

#[tauri::command]
pub async fn update_refund_status(
    pool: State<'_, SqlitePool>,
    id: String,
    status: String,
) -> Result<Refund, String> {
    let service = RefundService::new(pool.inner());
    service.update_status(&id, &status).await
}
