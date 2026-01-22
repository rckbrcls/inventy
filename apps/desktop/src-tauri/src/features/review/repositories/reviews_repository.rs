use crate::features::review::models::review_model::Review;
use sqlx::{Result, SqlitePool};

pub struct ReviewsRepository {
    pool: SqlitePool,
}

impl ReviewsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, review: Review) -> Result<Review> {
        let sql = r#"
            INSERT INTO reviews (
                id, order_id, customer_id, product_id, rating, title, body,
                photos, videos, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Review>(sql)
            .bind(review.id)
            .bind(review.order_id)
            .bind(review.customer_id)
            .bind(review.product_id)
            .bind(review.rating)
            .bind(review.title)
            .bind(review.body)
            .bind(review.photos)
            .bind(review.videos)
            .bind(review.sync_status)
            .bind(review.created_at)
            .bind(review.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, review: Review) -> Result<Review> {
        let sql = r#"
            UPDATE reviews SET
                order_id = $2,
                customer_id = $3,
                product_id = $4,
                rating = $5,
                title = $6,
                body = $7,
                photos = $8,
                videos = $9,
                _status = $10,
                updated_at = $11
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Review>(sql)
            .bind(review.id)
            .bind(review.order_id)
            .bind(review.customer_id)
            .bind(review.product_id)
            .bind(review.rating)
            .bind(review.title)
            .bind(review.body)
            .bind(review.photos)
            .bind(review.videos)
            .bind(review.sync_status)
            .bind(review.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM reviews WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Review>> {
        let sql = "SELECT * FROM reviews WHERE id = $1";
        sqlx::query_as::<_, Review>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_by_product(&self, product_id: &str) -> Result<Vec<Review>> {
        let sql = "SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, Review>(sql)
            .bind(product_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_order(&self, order_id: &str) -> Result<Vec<Review>> {
        let sql = "SELECT * FROM reviews WHERE order_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, Review>(sql)
            .bind(order_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_customer(&self, customer_id: &str) -> Result<Vec<Review>> {
        let sql = "SELECT * FROM reviews WHERE customer_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, Review>(sql)
            .bind(customer_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Review>> {
        let sql = r#"
            SELECT r.*
            FROM reviews r
            JOIN orders o ON r.order_id = o.id
            WHERE o.shop_id = $1
            ORDER BY r.created_at DESC
        "#;

        sqlx::query_as::<_, Review>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods (for use in services)
    // ============================================================

    pub async fn create_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        review: Review,
    ) -> Result<Review> {
        let sql = r#"
            INSERT INTO reviews (
                id, order_id, customer_id, product_id, rating, title, body,
                photos, videos, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Review>(sql)
            .bind(&review.id)
            .bind(&review.order_id)
            .bind(&review.customer_id)
            .bind(&review.product_id)
            .bind(&review.rating)
            .bind(&review.title)
            .bind(&review.body)
            .bind(&review.photos)
            .bind(&review.videos)
            .bind(&review.sync_status)
            .bind(&review.created_at)
            .bind(&review.updated_at)
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn get_by_id_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: &str,
    ) -> Result<Option<Review>> {
        let sql = "SELECT * FROM reviews WHERE id = $1";
        sqlx::query_as::<_, Review>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    pub async fn delete_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: &str,
    ) -> Result<()> {
        let sql = "DELETE FROM reviews WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&mut **tx).await?;
        Ok(())
    }

    pub async fn update_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        review: Review,
    ) -> Result<Review> {
        let sql = r#"
            UPDATE reviews SET
                order_id = $2,
                customer_id = $3,
                product_id = $4,
                rating = $5,
                title = $6,
                body = $7,
                photos = $8,
                videos = $9,
                _status = $10,
                updated_at = $11
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Review>(sql)
            .bind(&review.id)
            .bind(&review.order_id)
            .bind(&review.customer_id)
            .bind(&review.product_id)
            .bind(&review.rating)
            .bind(&review.title)
            .bind(&review.body)
            .bind(&review.photos)
            .bind(&review.videos)
            .bind(&review.sync_status)
            .bind(&review.updated_at)
            .fetch_one(&mut **tx)
            .await
    }
}
