use crate::features::shop_template::models::shop_template_model::ShopTemplate;
use sqlx::{SqlitePool, Result};

pub struct ShopTemplatesRepository {
    pool: SqlitePool,
}

impl ShopTemplatesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<ShopTemplate>> {
        sqlx::query_as::<_, ShopTemplate>("SELECT * FROM shop_templates WHERE id = ? AND (_status IS NULL OR _status != 'deleted')")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn find_by_code(&self, code: &str) -> Result<Option<ShopTemplate>> {
        sqlx::query_as::<_, ShopTemplate>("SELECT * FROM shop_templates WHERE code = ? AND (_status IS NULL OR _status != 'deleted')")
            .bind(code)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_all(&self) -> Result<Vec<ShopTemplate>> {
        sqlx::query_as::<_, ShopTemplate>("SELECT * FROM shop_templates WHERE _status IS NULL OR _status != 'deleted' ORDER BY category, name ASC")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_category(&self, category: &str) -> Result<Vec<ShopTemplate>> {
        sqlx::query_as::<_, ShopTemplate>("SELECT * FROM shop_templates WHERE category = ? AND (_status IS NULL OR _status != 'deleted') ORDER BY name ASC")
            .bind(category)
            .fetch_all(&self.pool)
            .await
    }
}
