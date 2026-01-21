use crate::db::DbTransaction;
use crate::features::payment::models::payment_model::Payment;
use sqlx::{Result, SqlitePool};

pub struct PaymentsRepository<'a> {
    pool: &'a SqlitePool,
}

impl<'a> PaymentsRepository<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, payment: Payment) -> Result<Payment> {
        let sql = r#"
            INSERT INTO payments (
                id, transaction_id, amount, currency, provider, method,
                installments, status, provider_transaction_id, authorization_code,
                payment_details, risk_level, _status, created_at, updated_at,
                authorized_at, captured_at, voided_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Payment>(sql)
            .bind(payment.id) // $1
            .bind(payment.transaction_id) // $2
            .bind(payment.amount) // $3
            .bind(payment.currency) // $4
            .bind(payment.provider) // $5
            .bind(payment.method) // $6
            .bind(payment.installments) // $7
            .bind(payment.status) // $8
            .bind(payment.provider_transaction_id) // $9
            .bind(payment.authorization_code) // $10
            .bind(payment.payment_details) // $11
            .bind(payment.risk_level) // $12
            .bind(payment.sync_status) // $13
            .bind(payment.created_at) // $14
            .bind(payment.updated_at) // $15
            .bind(payment.authorized_at) // $16
            .bind(payment.captured_at) // $17
            .bind(payment.voided_at) // $18
            .fetch_one(self.pool)
            .await
    }

    pub async fn update(&self, payment: Payment) -> Result<Payment> {
        let sql = r#"
            UPDATE payments SET
                transaction_id = $2,
                amount = $3,
                currency = $4,
                provider = $5,
                method = $6,
                installments = $7,
                status = $8,
                provider_transaction_id = $9,
                authorization_code = $10,
                payment_details = $11,
                risk_level = $12,
                _status = $13,
                created_at = $14,
                updated_at = $15,
                authorized_at = $16,
                captured_at = $17,
                voided_at = $18
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Payment>(sql)
            .bind(payment.id) // $1
            .bind(payment.transaction_id) // $2
            .bind(payment.amount) // $3
            .bind(payment.currency) // $4
            .bind(payment.provider) // $5
            .bind(payment.method) // $6
            .bind(payment.installments) // $7
            .bind(payment.status) // $8
            .bind(payment.provider_transaction_id) // $9
            .bind(payment.authorization_code) // $10
            .bind(payment.payment_details) // $11
            .bind(payment.risk_level) // $12
            .bind(payment.sync_status) // $13
            .bind(payment.created_at) // $14
            .bind(payment.updated_at) // $15
            .bind(payment.authorized_at) // $16
            .bind(payment.captured_at) // $17
            .bind(payment.voided_at) // $18
            .fetch_one(self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Payment>> {
        let sql = "SELECT * FROM payments WHERE id = $1";
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_optional(self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Payment>> {
        let sql = "SELECT * FROM payments ORDER BY created_at DESC";
        sqlx::query_as::<_, Payment>(sql)
            .fetch_all(self.pool)
            .await
    }

    pub async fn list_by_transaction(&self, transaction_id: &str) -> Result<Vec<Payment>> {
        let sql = "SELECT * FROM payments WHERE transaction_id = $1";
        sqlx::query_as::<_, Payment>(sql)
            .bind(transaction_id)
            .fetch_all(self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Payment>> {
        let sql = r#"
            SELECT DISTINCT p.* FROM payments p
            INNER JOIN transactions t ON t.id = p.transaction_id
            INNER JOIN customers c ON c.id = t.customer_id
            INNER JOIN orders o ON o.customer_id = c.id
            WHERE o.shop_id = $1
            ORDER BY p.created_at DESC
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(shop_id)
            .fetch_all(self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM payments WHERE id = $1";
        sqlx::query(sql).bind(id).execute(self.pool).await?;
        Ok(())
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Get payment by ID within a database transaction
    pub async fn get_by_id_with_tx<'b>(
        tx: &mut DbTransaction<'b>,
        id: &str,
    ) -> Result<Option<Payment>> {
        let sql = "SELECT * FROM payments WHERE id = $1";
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    /// Capture a payment within a database transaction
    pub async fn capture_with_tx<'b>(tx: &mut DbTransaction<'b>, id: &str) -> Result<Payment> {
        let sql = r#"
            UPDATE payments
            SET status = 'captured',
                captured_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_one(&mut **tx)
            .await
    }

    /// Void a payment within a database transaction
    pub async fn void_with_tx<'b>(tx: &mut DbTransaction<'b>, id: &str) -> Result<Payment> {
        let sql = r#"
            UPDATE payments
            SET status = 'voided',
                voided_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .fetch_one(&mut **tx)
            .await
    }

    /// Update payment status within a database transaction
    pub async fn update_status_with_tx<'b>(
        tx: &mut DbTransaction<'b>,
        id: &str,
        status: &str,
    ) -> Result<Payment> {
        let sql = r#"
            UPDATE payments
            SET status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Payment>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&mut **tx)
            .await
    }

    /// Get sum of refunds for a payment within a database transaction
    pub async fn get_refunded_amount_with_tx<'b>(
        tx: &mut DbTransaction<'b>,
        payment_id: &str,
    ) -> Result<f64> {
        let sql = r#"
            SELECT COALESCE(SUM(amount), 0) as total
            FROM refunds
            WHERE payment_id = $1 AND status = 'completed'
        "#;
        let result: (f64,) = sqlx::query_as(sql)
            .bind(payment_id)
            .fetch_one(&mut **tx)
            .await?;
        Ok(result.0)
    }
}
