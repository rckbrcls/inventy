use crate::models::transaction::{Transaction, TransactionItem, InventoryMovement};
use sqlx::{SqlitePool, Result};

pub struct TransactionsRepository {
    pool: SqlitePool,
}

impl TransactionsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        transaction: Transaction,
        items: Vec<TransactionItem>,
        movements: Vec<InventoryMovement>,
    ) -> Result<Transaction> {
        let mut tx = self.pool.begin().await?;

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

        let created_transaction = sqlx::query_as::<_, Transaction>(sql)
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
            .fetch_one(&mut *tx)
            .await?;

        for item in items {
            let item_sql = r#"
                INSERT INTO transaction_items (
                    id, transaction_id, product_id, sku_snapshot, name_snapshot,
                    quantity, unit_price, unit_cost, attributes_snapshot, tax_details,
                    _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#;
            sqlx::query(item_sql)
                .bind(&item.id)
                .bind(&created_transaction.id)
                .bind(&item.product_id)
                .bind(&item.sku_snapshot)
                .bind(&item.name_snapshot)
                .bind(&item.quantity)
                .bind(&item.unit_price)
                .bind(&item.unit_cost)
                .bind(&item.attributes_snapshot)
                .bind(&item.tax_details)
                .bind(&item.sync_status)
                .bind(&item.created_at)
                .bind(&item.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        for movement in movements {
            let mov_sql = r#"
                INSERT INTO inventory_movements (
                    id, transaction_id, inventory_level_id, type, quantity,
                    previous_balance, new_balance, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#;
            sqlx::query(mov_sql)
                .bind(&movement.id)
                .bind(&created_transaction.id)
                .bind(&movement.inventory_level_id)
                .bind(&movement.movement_type)
                .bind(&movement.quantity)
                .bind(&movement.previous_balance)
                .bind(&movement.new_balance)
                .bind(&movement.sync_status)
                .bind(&movement.created_at)
                .bind(&movement.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;
        Ok(created_transaction)
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
        let mut tx = self.pool.begin().await?;

        sqlx::query("DELETE FROM transaction_items WHERE transaction_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM inventory_movements WHERE transaction_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM transactions WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Transaction>> {
        let sql = "SELECT * FROM transactions WHERE id = $1";
        sqlx::query_as::<_, Transaction>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_items(&self, transaction_id: &str) -> Result<Vec<TransactionItem>> {
        let sql = "SELECT * FROM transaction_items WHERE transaction_id = $1";
        sqlx::query_as::<_, TransactionItem>(sql)
            .bind(transaction_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_movements(&self, transaction_id: &str) -> Result<Vec<InventoryMovement>> {
        let sql = "SELECT * FROM inventory_movements WHERE transaction_id = $1";
        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(transaction_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Transaction>> {
        let sql = "SELECT * FROM transactions ORDER BY created_at DESC";
        sqlx::query_as::<_, Transaction>(sql)
            .fetch_all(&self.pool)
            .await
    }
}
