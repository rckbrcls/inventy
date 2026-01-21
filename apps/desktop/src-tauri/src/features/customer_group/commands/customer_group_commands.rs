use crate::features::customer_group::dtos::customer_group_dto::{CreateCustomerGroupDTO, UpdateCustomerGroupDTO};
use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use crate::features::customer_group::services::customer_group_service::CustomerGroupService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_customer_group(
    pool: State<'_, SqlitePool>,
    payload: CreateCustomerGroupDTO,
) -> Result<CustomerGroup, String> {
    let service = CustomerGroupService::new(pool.inner().clone());
    service.create_group(payload).await
}

#[tauri::command]
pub async fn update_customer_group(
    pool: State<'_, SqlitePool>,
    payload: UpdateCustomerGroupDTO,
) -> Result<CustomerGroup, String> {
    let service = CustomerGroupService::new(pool.inner().clone());
    service.update_group(payload).await
}

#[tauri::command]
pub async fn delete_customer_group(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = CustomerGroupService::new(pool.inner().clone());
    service.delete_group(&id).await
}

#[tauri::command]
pub async fn get_customer_group(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<CustomerGroup>, String> {
    let service = CustomerGroupService::new(pool.inner().clone());
    service.get_group(&id).await
}

#[tauri::command]
pub async fn list_customer_groups(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<CustomerGroup>, String> {
    let service = CustomerGroupService::new(pool.inner().clone());
    service.list_groups().await
}
