use crate::db::DbTransaction;
use crate::models::checkout_model::Checkout;
use sqlx::{Result, SqlitePool};

pub struct CheckoutsRepository {
    pool: SqlitePool,
}

impl CheckoutsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, checkout: Checkout) -> Result<Checkout> {
        let sql = r#"
            INSERT INTO checkouts (
                id, token, user_id, email, items, shipping_address, billing_address,
                shipping_line, applied_discount_codes, currency, subtotal_price,
                total_tax, total_shipping, total_discounts, total_price, status,
                reservation_expires_at, completed_at, metadata, recovery_url,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            RETURNING *
        "#;

        sqlx::query_as::<_, Checkout>(sql)
            .bind(checkout.id) // $1
            .bind(checkout.token) // $2
            .bind(checkout.user_id) // $3
            .bind(checkout.email) // $4
            .bind(checkout.items) // $5
            .bind(checkout.shipping_address) // $6
            .bind(checkout.billing_address) // $7
            .bind(checkout.shipping_line) // $8
            .bind(checkout.applied_discount_codes) // $9
            .bind(checkout.currency) // $10
            .bind(checkout.subtotal_price) // $11
            .bind(checkout.total_tax) // $12
            .bind(checkout.total_shipping) // $13
            .bind(checkout.total_discounts) // $14
            .bind(checkout.total_price) // $15
            .bind(checkout.status) // $16
            .bind(checkout.reservation_expires_at) // $17
            .bind(checkout.completed_at) // $18
            .bind(checkout.metadata) // $19
            .bind(checkout.recovery_url) // $20
            .bind(checkout.sync_status) // $21
            .bind(checkout.created_at) // $22
            .bind(checkout.updated_at) // $23
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, checkout: Checkout) -> Result<Checkout> {
        let sql = r#"
            UPDATE checkouts SET
                token = $2,
                user_id = $3,
                email = $4,
                items = $5,
                shipping_address = $6,
                billing_address = $7,
                shipping_line = $8,
                applied_discount_codes = $9,
                currency = $10,
                subtotal_price = $11,
                total_tax = $12,
                total_shipping = $13,
                total_discounts = $14,
                total_price = $15,
                status = $16,
                reservation_expires_at = $17,
                completed_at = $18,
                metadata = $19,
                recovery_url = $20,
                _status = $21,
                updated_at = $22
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Checkout>(sql)
            .bind(checkout.id) // $1
            .bind(checkout.token) // $2
            .bind(checkout.user_id) // $3
            .bind(checkout.email) // $4
            .bind(checkout.items) // $5
            .bind(checkout.shipping_address) // $6
            .bind(checkout.billing_address) // $7
            .bind(checkout.shipping_line) // $8
            .bind(checkout.applied_discount_codes) // $9
            .bind(checkout.currency) // $10
            .bind(checkout.subtotal_price) // $11
            .bind(checkout.total_tax) // $12
            .bind(checkout.total_shipping) // $13
            .bind(checkout.total_discounts) // $14
            .bind(checkout.total_price) // $15
            .bind(checkout.status) // $16
            .bind(checkout.reservation_expires_at) // $17
            .bind(checkout.completed_at) // $18
            .bind(checkout.metadata) // $19
            .bind(checkout.recovery_url) // $20
            .bind(checkout.sync_status) // $21
            .bind(checkout.updated_at) // $22
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Checkout>> {
        let sql = "SELECT * FROM checkouts WHERE id = $1";

        sqlx::query_as::<_, Checkout>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn find_by_token(&self, token: &str) -> Result<Option<Checkout>> {
        let sql = "SELECT * FROM checkouts WHERE token = $1";

        sqlx::query_as::<_, Checkout>(sql)
            .bind(token)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Checkout>> {
        let sql = "SELECT * FROM checkouts ORDER BY created_at DESC";

        sqlx::query_as::<_, Checkout>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM checkouts WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;

        Ok(())
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Get checkout by ID within a database transaction
    pub async fn get_by_id_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
    ) -> Result<Option<Checkout>> {
        let sql = "SELECT * FROM checkouts WHERE id = $1";
        sqlx::query_as::<_, Checkout>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    /// Update checkout status within a database transaction
    pub async fn update_status_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        status: &str,
    ) -> Result<Checkout> {
        let sql = r#"
            UPDATE checkouts
            SET status = $2,
                completed_at = CASE WHEN $2 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Checkout>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&mut **tx)
            .await
    }
}
