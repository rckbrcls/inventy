use crate::features::category::models::category_model::Category;
use sqlx::{SqlitePool, Result};

pub struct CategoriesRepository {
    pool: SqlitePool,
}

impl CategoriesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, category: Category) -> Result<Category> {
        let sql = r#"
            INSERT INTO categories (
                id, shop_id, parent_id, name, slug, description, image_url, banner_url,
                type, rules, is_visible, sort_order, seo_title, seo_description,
                template_suffix, metadata, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *
        "#;

        sqlx::query_as::<_, Category>(sql)
        .bind(category.id)
        .bind(category.shop_id)
        .bind(category.parent_id)
        .bind(category.name)
        .bind(category.slug)
        .bind(category.description)
        .bind(category.image_url)
        .bind(category.banner_url)
        .bind(category.r#type)
        .bind(category.rules)
        .bind(category.is_visible)
        .bind(category.sort_order)
        .bind(category.seo_title)
        .bind(category.seo_description)
        .bind(category.template_suffix)
        .bind(category.metadata)
        .bind(category.sync_status)
        .bind(category.created_at)
        .bind(category.updated_at)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self, category: Category) -> Result<Category> {
        let sql = r#"
            UPDATE categories SET
                shop_id = $2, parent_id = $3, name = $4, slug = $5, description = $6,
                image_url = $7, banner_url = $8, type = $9, rules = $10, is_visible = $11,
                sort_order = $12, seo_title = $13, seo_description = $14, template_suffix = $15,
                metadata = $16, _status = $17, updated_at = $18
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Category>(sql)
        .bind(category.id)
        .bind(category.shop_id)
        .bind(category.parent_id)
        .bind(category.name)
        .bind(category.slug)
        .bind(category.description)
        .bind(category.image_url)
        .bind(category.banner_url)
        .bind(category.r#type)
        .bind(category.rules)
        .bind(category.is_visible)
        .bind(category.sort_order)
        .bind(category.seo_title)
        .bind(category.seo_description)
        .bind(category.template_suffix)
        .bind(category.metadata)
        .bind(category.sync_status)
        .bind(category.updated_at)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Category>> {
        sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Category>> {
        sqlx::query_as::<_, Category>("SELECT * FROM categories WHERE shop_id = ? ORDER BY sort_order ASC")
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_all(&self) -> Result<Vec<Category>> {
        sqlx::query_as::<_, Category>(
            "SELECT * FROM categories WHERE _status IS NULL OR _status != 'deleted' ORDER BY sort_order ASC"
        )
        .fetch_all(&self.pool)
        .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM categories WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
