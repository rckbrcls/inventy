use crate::features::brand::dtos::brand_dto::{CreateBrandDTO, UpdateBrandDTO};
use crate::features::brand::models::brand_model::Brand;
use crate::features::brand::services::brand_service::BrandService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_brand(
    pool: State<'_, SqlitePool>,
    payload: CreateBrandDTO,
) -> Result<Brand, String> {
    let service = BrandService::new(pool.inner().clone());
    service.create_brand(payload).await
}

#[tauri::command]
pub async fn update_brand(
    pool: State<'_, SqlitePool>,
    payload: UpdateBrandDTO,
) -> Result<Brand, String> {
    let service = BrandService::new(pool.inner().clone());
    service.update_brand(payload).await
}

#[tauri::command]
pub async fn delete_brand(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = BrandService::new(pool.inner().clone());
    service.delete_brand(&id).await
}

#[tauri::command]
pub async fn get_brand(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Brand>, String> {
    let service = BrandService::new(pool.inner().clone());
    service.get_brand(&id).await
}

#[tauri::command]
pub async fn list_brands(pool: State<'_, SqlitePool>) -> Result<Vec<Brand>, String> {
    let service = BrandService::new(pool.inner().clone());
    service.list_brands().await
}

#[tauri::command]
pub async fn list_brands_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<Brand>, String> {
    let service = BrandService::new(pool.inner().clone());
    service.list_brands_by_shop(&shop_id).await
}
