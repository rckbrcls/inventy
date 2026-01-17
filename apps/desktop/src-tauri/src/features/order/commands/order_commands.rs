use crate::features::order::dtos::order_dto::{
    CreateOrderDTO, UpdateFulfillmentStatusDTO, UpdateOrderDTO, UpdatePaymentStatusDTO,
};
use crate::features::order::models::order_model::Order;
use crate::features::order::repositories::orders_repository::OrdersRepository;
use crate::features::order::services::order_service::OrderService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_order(
    pool: State<'_, SqlitePool>,
    payload: CreateOrderDTO,
) -> Result<Order, String> {
    let repo = OrdersRepository::new(pool.inner().clone());
    let order = payload.into_model();
    repo.create(order)
        .await
        .map_err(|e| format!("Failed to create order: {}", e))
}

#[tauri::command]
pub async fn update_order(
    pool: State<'_, SqlitePool>,
    payload: UpdateOrderDTO,
) -> Result<Order, String> {
    let repo = OrdersRepository::new(pool.inner().clone());

    let existing = repo
        .find_by_id(&payload.id)
        .await
        .map_err(|e| format!("Failed to fetch order: {}", e))?
        .ok_or_else(|| format!("Order not found: {}", payload.id))?;

    let updated = payload.apply_to_model(existing);
    repo.update(updated)
        .await
        .map_err(|e| format!("Failed to update order: {}", e))
}

#[tauri::command]
pub async fn delete_order(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let repo = OrdersRepository::new(pool.inner().clone());
    repo.delete(&id)
        .await
        .map_err(|e| format!("Failed to delete order: {}", e))
}

#[tauri::command]
pub async fn get_order(pool: State<'_, SqlitePool>, id: String) -> Result<Option<Order>, String> {
    let repo = OrdersRepository::new(pool.inner().clone());
    repo.find_by_id(&id)
        .await
        .map_err(|e| format!("Failed to fetch order: {}", e))
}

#[tauri::command]
pub async fn list_orders(pool: State<'_, SqlitePool>) -> Result<Vec<Order>, String> {
    let repo = OrdersRepository::new(pool.inner().clone());
    repo.list()
        .await
        .map_err(|e| format!("Failed to list orders: {}", e))
}

#[tauri::command]
pub async fn update_order_payment_status(
    pool: State<'_, SqlitePool>,
    payload: UpdatePaymentStatusDTO,
) -> Result<Order, String> {
    let service = OrderService::new(pool.inner().clone());
    service
        .update_payment_status(&payload.id, &payload.payment_status)
        .await
}

#[tauri::command]
pub async fn update_order_fulfillment_status(
    pool: State<'_, SqlitePool>,
    payload: UpdateFulfillmentStatusDTO,
) -> Result<Order, String> {
    let service = OrderService::new(pool.inner().clone());
    service
        .update_fulfillment_status(&payload.id, &payload.fulfillment_status)
        .await
}

#[tauri::command]
pub async fn cancel_order(pool: State<'_, SqlitePool>, id: String) -> Result<Order, String> {
    let service = OrderService::new(pool.inner().clone());
    service.cancel_order(&id).await
}
