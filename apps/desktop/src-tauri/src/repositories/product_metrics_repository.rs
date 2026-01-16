use crate::models::product_model::ProductMetrics;
use chrono::Utc;
use sqlx::{Result, SqlitePool};

pub struct ProductMetricsRepository {
    #[allow(dead_code)]
    pool: SqlitePool,
}

impl ProductMetricsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    // ============================================================
    // Transaction-aware methods (for use in services)
    // ============================================================

    /// Upsert product metrics within a transaction
    pub async fn upsert_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        product_id: &str,
        review_count: i32,
        review_sum: i32,
    ) -> Result<ProductMetrics> {
        let average_rating = if review_count > 0 {
            Some(review_sum as f64 / review_count as f64)
        } else {
            None
        };

        let sql = r#"
            INSERT INTO product_metrics (product_id, review_count, review_sum, average_rating, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT(product_id) DO UPDATE SET
                review_count = excluded.review_count,
                review_sum = excluded.review_sum,
                average_rating = excluded.average_rating,
                updated_at = excluded.updated_at
            RETURNING *
        "#;

        sqlx::query_as::<_, ProductMetrics>(sql)
            .bind(product_id)
            .bind(review_count)
            .bind(review_sum)
            .bind(average_rating)
            .bind(Utc::now())
            .fetch_one(&mut **tx)
            .await
    }

    /// Increment metrics when adding a review
    pub async fn increment_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        product_id: &str,
        rating: i32,
    ) -> Result<ProductMetrics> {
        let sql = r#"
            INSERT INTO product_metrics (product_id, review_count, review_sum, average_rating, updated_at)
            VALUES ($1, 1, $2, $3, $4)
            ON CONFLICT(product_id) DO UPDATE SET
                review_count = product_metrics.review_count + 1,
                review_sum = product_metrics.review_sum + $2,
                average_rating = CAST((product_metrics.review_sum + $2) AS REAL) / CAST((product_metrics.review_count + 1) AS REAL),
                updated_at = $4
            RETURNING *
        "#;

        sqlx::query_as::<_, ProductMetrics>(sql)
            .bind(product_id)
            .bind(rating)
            .bind(rating as f64)
            .bind(Utc::now())
            .fetch_one(&mut **tx)
            .await
    }

    /// Decrement metrics when removing a review
    pub async fn decrement_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        product_id: &str,
        rating: i32,
    ) -> Result<ProductMetrics> {
        let sql = r#"
            UPDATE product_metrics SET
                review_count = CASE WHEN review_count > 0 THEN review_count - 1 ELSE 0 END,
                review_sum = CASE WHEN review_sum >= $2 THEN review_sum - $2 ELSE 0 END,
                average_rating = CASE
                    WHEN review_count > 1 THEN CAST((review_sum - $2) AS REAL) / CAST((review_count - 1) AS REAL)
                    ELSE NULL
                END,
                updated_at = $3
            WHERE product_id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, ProductMetrics>(sql)
            .bind(product_id)
            .bind(rating)
            .bind(Utc::now())
            .fetch_one(&mut **tx)
            .await
    }

    /// Recalculate metrics from all reviews for a product
    pub async fn recalculate_from_reviews_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        product_id: &str,
    ) -> Result<ProductMetrics> {
        // First, calculate stats from reviews
        let stats_sql = r#"
            SELECT
                COUNT(*) as count,
                COALESCE(SUM(rating), 0) as sum
            FROM reviews
            WHERE product_id = $1 AND _status != 'deleted'
        "#;

        let stats: (i32, i32) = sqlx::query_as(stats_sql)
            .bind(product_id)
            .fetch_one(&mut **tx)
            .await?;

        let (review_count, review_sum) = stats;

        // Then upsert the metrics
        Self::upsert_with_tx(tx, product_id, review_count, review_sum).await
    }

    /// Get metrics by product ID within a transaction
    pub async fn get_by_product_id_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        product_id: &str,
    ) -> Result<Option<ProductMetrics>> {
        let sql = "SELECT * FROM product_metrics WHERE product_id = $1";
        sqlx::query_as::<_, ProductMetrics>(sql)
            .bind(product_id)
            .fetch_optional(&mut **tx)
            .await
    }
}
