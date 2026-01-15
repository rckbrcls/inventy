use crate::models::brand::Brand;
use sqlx::{SqlitePool, Result};

pub struct BrandsRepository {
    pool: SqlitePool,
}

impl BrandsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, brand: Brand) -> Result<Brand> {
        sqlx::query_as::<_, Brand>(
            r#"
            INSERT INTO brands (
                id, shop_id, name, slug, logo_url, banner_url, description, rich_description,
                website_url, status, is_featured, sort_order, seo_title, seo_keywords,
                metadata, _status, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#
        )
        .bind(brand.id)
        .bind(brand.shop_id)
        .bind(brand.name)
        .bind(brand.slug)
        .bind(brand.logo_url)
        .bind(brand.banner_url)
        .bind(brand.description)
        .bind(brand.rich_description)
        .bind(brand.website_url)
        .bind(brand.status)
        .bind(brand.is_featured)
        .bind(brand.sort_order)
        .bind(brand.seo_title)
        .bind(brand.seo_keywords)
        .bind(brand.metadata)
        .bind(brand.sync_status)
        .bind(brand.created_at)
        .bind(brand.updated_at)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self, brand: Brand) -> Result<Brand> {
        sqlx::query_as::<_, Brand>(
            r#"
            UPDATE brands SET
                shop_id = ?, name = ?, slug = ?, logo_url = ?, banner_url = ?, description = ?,
                rich_description = ?, website_url = ?, status = ?, is_featured = ?,
                sort_order = ?, seo_title = ?, seo_keywords = ?, metadata = ?,
                _status = ?, updated_at = ?
            WHERE id = ?
            RETURNING *
            "#
        )
        .bind(brand.shop_id)
        .bind(brand.name)
        .bind(brand.slug)
        .bind(brand.logo_url)
        .bind(brand.banner_url)
        .bind(brand.description)
        .bind(brand.rich_description)
        .bind(brand.website_url)
        .bind(brand.status)
        .bind(brand.is_featured)
        .bind(brand.sort_order)
        .bind(brand.seo_title)
        .bind(brand.seo_keywords)
        .bind(brand.metadata)
        .bind(brand.sync_status)
        .bind(brand.updated_at)
        .bind(brand.id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Brand>> {
        sqlx::query_as::<_, Brand>("SELECT * FROM brands WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Brand>> {
        sqlx::query_as::<_, Brand>("SELECT * FROM brands")
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Brand>> {
        sqlx::query_as::<_, Brand>("SELECT * FROM brands WHERE shop_id = ?")
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM brands WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
