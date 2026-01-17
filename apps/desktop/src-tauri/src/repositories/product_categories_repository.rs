use crate::models::product_model::ProductCategory;
use sqlx::{Result, Sqlite, SqlitePool, Transaction};

pub struct ProductCategoriesRepository {
    pool: SqlitePool,
}

impl ProductCategoriesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(
        &self,
        categories: Vec<ProductCategory>,
    ) -> Result<Vec<ProductCategory>> {
        let mut tx = self.pool.begin().await?;
        let mut created_categories = Vec::new();

        for category in categories {
            let cat_sql = r#"
                INSERT INTO product_categories (
                    product_id, category_id, position, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            "#;
            let created_cat = sqlx::query_as::<_, ProductCategory>(cat_sql)
                .bind(category.product_id)
                .bind(category.category_id)
                .bind(category.position)
                .bind(category.sync_status)
                .bind(category.created_at)
                .bind(category.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_categories.push(created_cat);
        }

        tx.commit().await?;
        Ok(created_categories)
    }

    pub async fn create_many_in_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        categories: Vec<ProductCategory>,
    ) -> Result<Vec<ProductCategory>> {
        let mut created_categories = Vec::new();

        for category in categories {
            let cat_sql = r#"
                INSERT INTO product_categories (
                    product_id, category_id, position, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            "#;
            let created_cat = sqlx::query_as::<_, ProductCategory>(cat_sql)
                .bind(category.product_id)
                .bind(category.category_id)
                .bind(category.position)
                .bind(category.sync_status)
                .bind(category.created_at)
                .bind(category.updated_at)
                .fetch_one(&mut **tx)
                .await?;

            created_categories.push(created_cat);
        }

        Ok(created_categories)
    }

    pub async fn delete_by_product_id(&self, product_id: &str) -> Result<()> {
        let sql = "DELETE FROM product_categories WHERE product_id = $1";
        sqlx::query(sql)
            .bind(product_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_product_id(&self, product_id: &str) -> Result<Vec<ProductCategory>> {
        let sql = "SELECT * FROM product_categories WHERE product_id = $1 ORDER BY position ASC";
        sqlx::query_as::<_, ProductCategory>(sql)
            .bind(product_id)
            .fetch_all(&self.pool)
            .await
    }
}
