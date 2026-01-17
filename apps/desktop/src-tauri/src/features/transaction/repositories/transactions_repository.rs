use crate::db::DbTransaction;
use crate::features::transaction::models::transaction_model::Transaction;
use sqlx::{Result, SqlitePool};

pub struct TransactionsRepository {
    pool: SqlitePool,
}

impl TransactionsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, transaction: Transaction) -> Result<Transaction> {
        let sql = r#"
            INSERT INTO transactions (
                id, type, status, channel, customer_id, supplier_id, staff_id,
                currency, total_items, total_shipping, total_discount, total_net,
                shipping_method, shipping_address, billing_address, _status,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Transaction>(sql)
            .bind(&transaction.id)
            .bind(&transaction.r#type)
            .bind(&transaction.status)
            .bind(&transaction.channel)
            .bind(&transaction.customer_id)
            .bind(&transaction.supplier_id)
            .bind(&transaction.staff_id)
            .bind(&transaction.currency)
            .bind(&transaction.total_items)
            .bind(&transaction.total_shipping)
            .bind(&transaction.total_discount)
            .bind(&transaction.total_net)
            .bind(&transaction.shipping_method)
            .bind(&transaction.shipping_address)
            .bind(&transaction.billing_address)
            .bind(&transaction.sync_status)
            .bind(&transaction.created_at)
            .bind(&transaction.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, transaction: Transaction) -> Result<Transaction> {
        let sql = r#"
            UPDATE transactions SET
                type = $2,
                status = $3,
                channel = $4,
                customer_id = $5,
                supplier_id = $6,
                staff_id = $7,
                currency = $8,
                total_items = $9,
                total_shipping = $10,
                total_discount = $11,
                total_net = $12,
                shipping_method = $13,
                shipping_address = $14,
                billing_address = $15,
                _status = $16,
                updated_at = $17
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Transaction>(sql)
            .bind(transaction.id)
            .bind(transaction.r#type)
            .bind(transaction.status)
            .bind(transaction.channel)
            .bind(transaction.customer_id)
            .bind(transaction.supplier_id)
            .bind(transaction.staff_id)
            .bind(transaction.currency)
            .bind(transaction.total_items)
            .bind(transaction.total_shipping)
            .bind(transaction.total_discount)
            .bind(transaction.total_net)
            .bind(transaction.shipping_method)
            .bind(transaction.shipping_address)
            .bind(transaction.billing_address)
            .bind(transaction.sync_status)
            .bind(transaction.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM transactions WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Transaction>> {
        let sql = "SELECT * FROM transactions WHERE id = $1";
        sqlx::query_as::<_, Transaction>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Transaction>> {
        let sql = "SELECT * FROM transactions ORDER BY created_at DESC";
        sqlx::query_as::<_, Transaction>(sql)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Get transaction by ID within a database transaction
    pub async fn get_by_id_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
    ) -> Result<Option<Transaction>> {
        let sql = "SELECT * FROM transactions WHERE id = $1";
        sqlx::query_as::<_, Transaction>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    /// Update only the status of a transaction within a database transaction
    pub async fn update_status_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        status: &str,
    ) -> Result<Transaction> {
        let sql = r#"
            UPDATE transactions
            SET status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Transaction>(sql)
            .bind(id)
            .bind(status)
            .fetch_one(&mut **tx)
            .await
    }
}
