use crate::dtos::category_dto::{CreateCategoryDTO, UpdateCategoryDTO};
use crate::models::category_model::Category;
use crate::services::category_service::CategoryService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn create_category(
    pool: State<'_, SqlitePool>,
    payload: CreateCategoryDTO,
) -> Result<Category, String> {
    let service = CategoryService::new(pool.inner().clone());
    service.create_category(payload).await
}

#[tauri::command]
pub async fn update_category(
    pool: State<'_, SqlitePool>,
    payload: UpdateCategoryDTO,
) -> Result<Category, String> {
    let service = CategoryService::new(pool.inner().clone());
    service.update_category(payload).await
}

#[tauri::command]
pub async fn delete_category(pool: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let service = CategoryService::new(pool.inner().clone());
    service.delete_category(&id).await
}

#[tauri::command]
pub async fn get_category(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Category>, String> {
    let service = CategoryService::new(pool.inner().clone());
    service.get_category(&id).await
}

#[tauri::command]
pub async fn list_categories_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<Category>, String> {
    let service = CategoryService::new(pool.inner().clone());
    service.list_categories_by_shop(&shop_id).await
}
