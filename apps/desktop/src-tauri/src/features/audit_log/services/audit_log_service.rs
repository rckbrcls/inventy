use crate::features::audit_log::dtos::audit_log_dto::AuditLogFilterDTO;
use crate::features::audit_log::models::audit_log_model::AuditLog;
use crate::features::audit_log::repositories::audit_logs_repository::AuditLogsRepository;
use sqlx::SqlitePool;

pub struct AuditLogService {
    repo: AuditLogsRepository,
}

impl AuditLogService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = AuditLogsRepository::new(pool);
        Self { repo }
    }

    pub async fn get_audit_log(&self, id: &str) -> Result<Option<AuditLog>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch audit log: {}", e))
    }

    pub async fn list_audit_logs(&self, page: u32, per_page: u32) -> Result<Vec<AuditLog>, String> {
        let page = page.max(1);
        let per_page = per_page.clamp(1, 100);
        let offset = ((page - 1) * per_page) as i64;
        self.repo
            .list(per_page as i64, offset)
            .await
            .map_err(|e| format!("Failed to list audit logs: {}", e))
    }

    pub async fn list_audit_logs_filtered(
        &self,
        filters: AuditLogFilterDTO,
    ) -> Result<Vec<AuditLog>, String> {
        let page = filters.page.unwrap_or(1).max(1);
        let per_page = filters.per_page.unwrap_or(20).clamp(1, 100);
        let offset = ((page - 1) * per_page) as i64;

        self.repo
            .list_filtered(
                filters.table_name.as_deref(),
                filters.record_id.as_deref(),
                filters.action.as_deref(),
                per_page as i64,
                offset,
            )
            .await
            .map_err(|e| format!("Failed to list audit logs: {}", e))
    }
}
