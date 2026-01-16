use crate::db::DbTransaction;
use crate::models::transaction_model::TransactionItem;
use sqlx::{Result, SqlitePool};

pub struct TransactionItemsRepository {
    pool: SqlitePool,
}

impl TransactionItemsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(&self, items: Vec<TransactionItem>) -> Result<Vec<TransactionItem>> {
        let mut tx = self.pool.begin().await?;
        let mut created_items = Vec::new();

        for item in items {
            let sql = r#"
                INSERT INTO transaction_items (
                    id, transaction_id, product_id, sku_snapshot, name_snapshot,
                    quantity, unit_price, unit_cost, attributes_snapshot, tax_details,
                    _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            "#;

            let created_item = sqlx::query_as::<_, TransactionItem>(sql)
                .bind(item.id)
                .bind(item.transaction_id)
                .bind(item.product_id)
                .bind(item.sku_snapshot)
                .bind(item.name_snapshot)
                .bind(item.quantity)
                .bind(item.unit_price)
                .bind(item.unit_cost)
                .bind(item.attributes_snapshot)
                .bind(item.tax_details)
                .bind(item.sync_status)
                .bind(item.created_at)
                .bind(item.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_items.push(created_item);
        }

        tx.commit().await?;
        Ok(created_items)
    }

    pub async fn delete_by_transaction_id(&self, transaction_id: &str) -> Result<()> {
        let sql = "DELETE FROM transaction_items WHERE transaction_id = $1";
        sqlx::query(sql)
            .bind(transaction_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_transaction_id(
        &self,
        transaction_id: &str,
    ) -> Result<Vec<TransactionItem>> {
        let sql = "SELECT * FROM transaction_items WHERE transaction_id = $1";
        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(transaction_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Find all items for a transaction within a database transaction
    pub async fn find_by_transaction_id_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        transaction_id: &str,
    ) -> Result<Vec<TransactionItem>> {
        let sql = "SELECT * FROM transaction_items WHERE transaction_id = $1";
        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(transaction_id)
            .fetch_all(&mut **tx)
            .await
    }
}
