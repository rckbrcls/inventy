use crate::features::audit_log::models::audit_log_model::AuditLog;
use sqlx::{QueryBuilder, Result, Sqlite, SqlitePool};

pub struct AuditLogsRepository {
    pool: SqlitePool,
}

impl AuditLogsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<AuditLog>> {
        let sql = "SELECT * FROM audit_logs WHERE id = $1";
        sqlx::query_as::<_, AuditLog>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self, limit: i64, offset: i64) -> Result<Vec<AuditLog>> {
        let sql = "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2";
        sqlx::query_as::<_, AuditLog>(sql)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_filtered(
        &self,
        table_name: Option<&str>,
        record_id: Option<&str>,
        action: Option<&str>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<AuditLog>> {
        let mut builder = QueryBuilder::<Sqlite>::new(
            "SELECT * FROM audit_logs WHERE 1 = 1",
        );

        if let Some(table_name) = table_name {
            builder.push(" AND table_name = ");
            builder.push_bind(table_name);
        }

        if let Some(record_id) = record_id {
            builder.push(" AND record_id = ");
            builder.push_bind(record_id);
        }

        if let Some(action) = action {
            builder.push(" AND action = ");
            builder.push_bind(action);
        }

        builder.push(" ORDER BY created_at DESC");
        builder.push(" LIMIT ");
        builder.push_bind(limit);
        builder.push(" OFFSET ");
        builder.push_bind(offset);

        let query = builder.build_query_as::<AuditLog>();
        query.fetch_all(&self.pool).await
    }
}
