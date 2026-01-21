use crate::features::setting::models::setting_model::Setting;
use sqlx::{SqlitePool, Result};

pub struct SettingsRepository {
    pool: SqlitePool,
}

impl SettingsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_by_key(&self, key: &str) -> Result<Option<Setting>> {
        sqlx::query_as::<_, Setting>("SELECT * FROM settings WHERE key = ? AND _status != 'deleted'")
            .bind(key)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn set(&self, setting: Setting) -> Result<Setting> {
        let sql = r#"
            INSERT INTO settings (id, key, value, _status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                _status = excluded._status,
                updated_at = excluded.updated_at
            RETURNING *
        "#;

        sqlx::query_as::<_, Setting>(sql)
            .bind(&setting.id)
            .bind(&setting.key)
            .bind(&setting.value)
            .bind(&setting.sync_status)
            .bind(&setting.created_at)
            .bind(&setting.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Setting>> {
        sqlx::query_as::<_, Setting>("SELECT * FROM settings WHERE _status != 'deleted'")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, key: &str) -> Result<()> {
        sqlx::query("UPDATE settings SET _status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE key = ?")
            .bind(key)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
