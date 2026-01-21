use crate::features::shop::models::shop_model::Shop;
use sqlx::{SqlitePool, Result};

pub struct ShopsRepository {
    pool: SqlitePool,
}

impl ShopsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, shop: Shop) -> Result<Shop> {
        let sql = r#"
            INSERT INTO shops (
                id, name, legal_name, slug, status,
                features_config, mail_config, storage_config, settings, branding,
                currency, timezone, locale, owner_id, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        "#;

        sqlx::query_as::<_, Shop>(sql)
        .bind(shop.id)
        .bind(shop.name)
        .bind(shop.legal_name)
        .bind(shop.slug)
        .bind(shop.status)
        .bind(shop.features_config)
        .bind(shop.mail_config)
        .bind(shop.storage_config)
        .bind(shop.settings)
        .bind(shop.branding)
        .bind(shop.currency)
        .bind(shop.timezone)
        .bind(shop.locale)
        .bind(shop.owner_id)
        .bind(shop.sync_status)
        .bind(shop.created_at)
        .bind(shop.updated_at)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self, shop: Shop) -> Result<Shop> {
        let sql = r#"
            UPDATE shops SET
                name = $2, legal_name = $3, slug = $4, status = $5,
                features_config = $6, mail_config = $7, storage_config = $8, settings = $9, branding = $10,
                currency = $11, timezone = $12, locale = $13, owner_id = $14, _status = $15, updated_at = $16
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Shop>(sql)
        .bind(shop.id)
        .bind(shop.name)
        .bind(shop.legal_name)
        .bind(shop.slug)
        .bind(shop.status)
        .bind(shop.features_config)
        .bind(shop.mail_config)
        .bind(shop.storage_config)
        .bind(shop.settings)
        .bind(shop.branding)
        .bind(shop.currency)
        .bind(shop.timezone)
        .bind(shop.locale)
        .bind(shop.owner_id)
        .bind(shop.sync_status)
        .bind(shop.updated_at)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Shop>> {
        sqlx::query_as::<_, Shop>("SELECT * FROM shops WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Shop>> {
        sqlx::query_as::<_, Shop>("SELECT * FROM shops")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM shops WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
