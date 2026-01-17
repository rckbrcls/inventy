use crate::features::customer_address::dtos::customer_address_dto::{
    CreateCustomerAddressDTO,
    UpdateCustomerAddressDTO,
};
use crate::features::customer_address::services::customer_address_service::CustomerAddressService;
use crate::features::customer::models::customer_model::CustomerAddress;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_customer_address(
    pool: State<'_, SqlitePool>,
    payload: CreateCustomerAddressDTO,
) -> Result<CustomerAddress, String> {
    let service = CustomerAddressService::new(pool.inner().clone());
    service.create_address(payload).await
}

#[tauri::command]
pub async fn update_customer_address(
    pool: State<'_, SqlitePool>,
    payload: UpdateCustomerAddressDTO,
) -> Result<CustomerAddress, String> {
    let service = CustomerAddressService::new(pool.inner().clone());
    service.update_address(payload).await
}

#[tauri::command]
pub async fn delete_customer_address(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = CustomerAddressService::new(pool.inner().clone());
    service.delete_address(&id).await
}

#[tauri::command]
pub async fn get_customer_address(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<CustomerAddress>, String> {
    let service = CustomerAddressService::new(pool.inner().clone());
    service.get_address(&id).await
}

#[tauri::command]
pub async fn list_customer_addresses(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<CustomerAddress>, String> {
    let service = CustomerAddressService::new(pool.inner().clone());
    service.list_addresses().await
}

#[tauri::command]
pub async fn list_customer_addresses_by_customer(
    pool: State<'_, SqlitePool>,
    customer_id: String,
) -> Result<Vec<CustomerAddress>, String> {
    let service = CustomerAddressService::new(pool.inner().clone());
    service.list_by_customer(&customer_id).await
}
