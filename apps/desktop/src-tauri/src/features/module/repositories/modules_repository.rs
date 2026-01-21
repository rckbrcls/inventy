use crate::features::module::models::module_model::Module;
use sqlx::{SqlitePool, Result};

pub struct ModulesRepository {
    pool: SqlitePool,
}

impl ModulesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Module>> {
        sqlx::query_as::<_, Module>("SELECT * FROM modules WHERE id = ? AND (_status IS NULL OR _status != 'deleted')")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn find_by_code(&self, code: &str) -> Result<Option<Module>> {
        sqlx::query_as::<_, Module>("SELECT * FROM modules WHERE code = ? AND (_status IS NULL OR _status != 'deleted')")
            .bind(code)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_all(&self) -> Result<Vec<Module>> {
        sqlx::query_as::<_, Module>("SELECT * FROM modules WHERE _status IS NULL OR _status != 'deleted' ORDER BY category, name ASC")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_category(&self, category: &str) -> Result<Vec<Module>> {
        sqlx::query_as::<_, Module>("SELECT * FROM modules WHERE category = ? AND (_status IS NULL OR _status != 'deleted') ORDER BY name ASC")
            .bind(category)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_core_modules(&self) -> Result<Vec<Module>> {
        sqlx::query_as::<_, Module>("SELECT * FROM modules WHERE is_core = 1 AND (_status IS NULL OR _status != 'deleted') ORDER BY name ASC")
            .fetch_all(&self.pool)
            .await
    }
}
