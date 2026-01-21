use crate::features::shop_template::dtos::shop_template_dto::ShopTemplateDto;
use crate::features::shop_template::services::shop_templates_service::ShopTemplatesService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_shop_template(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<ShopTemplateDto>, String> {
    let service = ShopTemplatesService::new(pool.inner().clone());
    service.get_template(&id).await
}

#[tauri::command]
pub async fn get_shop_template_by_code(
    pool: State<'_, SqlitePool>,
    code: String,
) -> Result<Option<ShopTemplateDto>, String> {
    let service = ShopTemplatesService::new(pool.inner().clone());
    service.get_template_by_code(&code).await
}

#[tauri::command]
pub async fn list_shop_templates(pool: State<'_, SqlitePool>) -> Result<Vec<ShopTemplateDto>, String> {
    let service = ShopTemplatesService::new(pool.inner().clone());
    service.list_templates().await
}

#[tauri::command]
pub async fn list_shop_templates_by_category(
    pool: State<'_, SqlitePool>,
    category: String,
) -> Result<Vec<ShopTemplateDto>, String> {
    let service = ShopTemplatesService::new(pool.inner().clone());
    service.list_templates_by_category(&category).await
}
