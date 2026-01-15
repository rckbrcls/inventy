use crate::models::shop::Shop;
use sqlx::{SqlitePool, Result};

pub struct ShopsRepository {
    pool: SqlitePool,
}

impl ShopsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, shop: Shop) -> Result<Shop> {
        sqlx::query_as::<_, Shop>(
            r#"
            INSERT INTO shops (
                id, name, legal_name, slug, is_default, status,
                features_config, mail_config, storage_config, settings, branding,
                currency, timezone, locale, owner_id, _status, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#
        )
        .bind(shop.id)
        .bind(shop.name)
        .bind(shop.legal_name)
        .bind(shop.slug)
        .bind(shop.is_default)
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
        sqlx::query_as::<_, Shop>(
            r#"
            UPDATE shops SET
                name = ?, legal_name = ?, slug = ?, is_default = ?, status = ?,
                features_config = ?, mail_config = ?, storage_config = ?, settings = ?, branding = ?,
                currency = ?, timezone = ?, locale = ?, owner_id = ?, _status = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
            "#
        )
        .bind(shop.name)
        .bind(shop.legal_name)
        .bind(shop.slug)
        .bind(shop.is_default)
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
        .bind(shop.id)
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
