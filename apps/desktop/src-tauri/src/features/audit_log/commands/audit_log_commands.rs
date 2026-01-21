use crate::features::audit_log::dtos::audit_log_dto::AuditLogFilterDTO;
use crate::features::audit_log::models::audit_log_model::AuditLog;
use crate::features::audit_log::services::audit_log_service::AuditLogService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_audit_log(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<AuditLog>, String> {
    let service = AuditLogService::new(pool.inner().clone());
    service.get_audit_log(&id).await
}

#[tauri::command]
pub async fn list_audit_logs(
    pool: State<'_, SqlitePool>,
    page: Option<u32>,
    per_page: Option<u32>,
) -> Result<Vec<AuditLog>, String> {
    let service = AuditLogService::new(pool.inner().clone());
    service
        .list_audit_logs(page.unwrap_or(1), per_page.unwrap_or(20))
        .await
}

#[tauri::command]
pub async fn list_audit_logs_filtered(
    pool: State<'_, SqlitePool>,
    filters: AuditLogFilterDTO,
) -> Result<Vec<AuditLog>, String> {
    let service = AuditLogService::new(pool.inner().clone());
    service.list_audit_logs_filtered(filters).await
}
