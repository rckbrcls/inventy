use crate::features::module::dtos::module_dto::ModuleDto;
use crate::features::module::services::modules_service::ModulesService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_module(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<ModuleDto>, String> {
    let service = ModulesService::new(pool.inner().clone());
    service.get_module(&id).await
}

#[tauri::command]
pub async fn get_module_by_code(
    pool: State<'_, SqlitePool>,
    code: String,
) -> Result<Option<ModuleDto>, String> {
    let service = ModulesService::new(pool.inner().clone());
    service.get_module_by_code(&code).await
}

#[tauri::command]
pub async fn list_modules(pool: State<'_, SqlitePool>) -> Result<Vec<ModuleDto>, String> {
    let service = ModulesService::new(pool.inner().clone());
    service.list_modules().await
}

#[tauri::command]
pub async fn list_modules_by_category(
    pool: State<'_, SqlitePool>,
    category: String,
) -> Result<Vec<ModuleDto>, String> {
    let service = ModulesService::new(pool.inner().clone());
    service.list_modules_by_category(&category).await
}

#[tauri::command]
pub async fn list_core_modules(pool: State<'_, SqlitePool>) -> Result<Vec<ModuleDto>, String> {
    let service = ModulesService::new(pool.inner().clone());
    service.list_core_modules().await
}
