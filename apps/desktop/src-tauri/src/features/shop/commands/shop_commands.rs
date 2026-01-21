use crate::features::shop::dtos::shop_dto::{CreateShopDTO, UpdateShopDTO};
use crate::features::shop::models::shop_model::Shop;
use crate::features::shop::services::shop_service::ShopService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_shop(
    pool: State<'_, SqlitePool>,
    payload: CreateShopDTO,
) -> Result<Shop, String> {
    let service = ShopService::new(pool.inner().clone());
    service.create_shop(payload).await
}

#[tauri::command]
pub async fn create_shop_from_template(
    pool: State<'_, SqlitePool>,
    payload: CreateShopDTO,
    template_code: Option<String>,
) -> Result<Shop, String> {
    let service = ShopService::new(pool.inner().clone());
    service.create_shop_from_template(payload, template_code).await
}

#[tauri::command]
pub async fn update_shop(
    pool: State<'_, SqlitePool>,
    payload: UpdateShopDTO,
) -> Result<Shop, String> {
    let service = ShopService::new(pool.inner().clone());
    service.update_shop(payload).await
}

#[tauri::command]
pub async fn delete_shop(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = ShopService::new(pool.inner().clone());
    service.delete_shop(&id).await
}

#[tauri::command]
pub async fn get_shop(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Shop>, String> {
    let service = ShopService::new(pool.inner().clone());
    service.get_shop(&id).await
}

#[tauri::command]
pub async fn list_shops(pool: State<'_, SqlitePool>) -> Result<Vec<Shop>, String> {
    let service = ShopService::new(pool.inner().clone());
    service.list_shops().await
}
