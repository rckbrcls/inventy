use crate::features::checkout::dtos::checkout_dto::{CreateCheckoutDTO, UpdateCheckoutDTO};
use crate::features::checkout::models::checkout_model::Checkout;
use crate::features::checkout::services::checkout_service::CheckoutService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_checkout(
    pool: State<'_, SqlitePool>,
    payload: CreateCheckoutDTO,
) -> Result<Checkout, String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.create_checkout(payload).await
}

#[tauri::command]
pub async fn update_checkout(
    pool: State<'_, SqlitePool>,
    payload: UpdateCheckoutDTO,
) -> Result<Checkout, String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.update_checkout(payload).await
}

#[tauri::command]
pub async fn delete_checkout(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.delete_checkout(&id).await
}

#[tauri::command]
pub async fn get_checkout(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Checkout>, String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.get_checkout(&id).await
}

#[tauri::command]
pub async fn get_checkout_by_token(
    pool: State<'_, SqlitePool>,
    token: String,
) -> Result<Option<Checkout>, String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.get_checkout_by_token(&token).await
}

#[tauri::command]
pub async fn list_checkouts(pool: State<'_, SqlitePool>) -> Result<Vec<Checkout>, String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.list_checkouts().await
}

#[tauri::command]
pub async fn list_checkouts_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<Checkout>, String> {
    let service = CheckoutService::new(pool.inner().clone());
    service.list_checkouts_by_shop(&shop_id).await
}
