use crate::features::customer::dtos::customer_dto::{CreateCustomerDTO, UpdateCustomerDTO};
use crate::features::customer::models::customer_model::Customer;
use crate::features::customer::services::customer_service::CustomerService;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_customer(
    pool: State<'_, SqlitePool>,
    payload: CreateCustomerDTO,
) -> Result<Customer, String> {
    let service = CustomerService::new(pool.inner().clone());
    service.create_customer(payload).await
}

#[tauri::command]
pub async fn update_customer(
    pool: State<'_, SqlitePool>,
    payload: UpdateCustomerDTO,
) -> Result<Customer, String> {
    let service = CustomerService::new(pool.inner().clone());
    service.update_customer(payload).await
}

#[tauri::command]
pub async fn delete_customer(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = CustomerService::new(pool.inner().clone());
    service.delete_customer(&id).await
}

#[tauri::command]
pub async fn get_customer(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Customer>, String> {
    let service = CustomerService::new(pool.inner().clone());
    service.get_customer(&id).await
}

#[tauri::command]
pub async fn list_customers(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Customer>, String> {
    let service = CustomerService::new(pool.inner().clone());
    service.list_customers().await
}

#[tauri::command]
pub async fn list_customers_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<Customer>, String> {
    let service = CustomerService::new(pool.inner().clone());
    service.list_customers_by_shop(&shop_id).await
}
