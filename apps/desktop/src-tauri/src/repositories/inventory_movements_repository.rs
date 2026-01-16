use crate::db::DbTransaction;
use crate::models::transaction_model::InventoryMovement;
use sqlx::{Result, SqlitePool};

pub struct InventoryMovementsRepository {
    pool: SqlitePool,
}

impl InventoryMovementsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(
        &self,
        movements: Vec<InventoryMovement>,
    ) -> Result<Vec<InventoryMovement>> {
        let mut tx = self.pool.begin().await?;
        let mut created_movements = Vec::new();

        for movement in movements {
            let sql = r#"
                INSERT INTO inventory_movements (
                    id, transaction_id, inventory_level_id, type, quantity,
                    previous_balance, new_balance, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            "#;

            let created_movement = sqlx::query_as::<_, InventoryMovement>(sql)
                .bind(movement.id)
                .bind(movement.transaction_id)
                .bind(movement.inventory_level_id)
                .bind(movement.movement_type)
                .bind(movement.quantity)
                .bind(movement.previous_balance)
                .bind(movement.new_balance)
                .bind(movement.sync_status)
                .bind(movement.created_at)
                .bind(movement.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_movements.push(created_movement);
        }

        tx.commit().await?;
        Ok(created_movements)
    }

    pub async fn delete_by_transaction_id(&self, transaction_id: &str) -> Result<()> {
        let sql = "DELETE FROM inventory_movements WHERE transaction_id = $1";
        sqlx::query(sql)
            .bind(transaction_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_transaction_id(
        &self,
        transaction_id: &str,
    ) -> Result<Vec<InventoryMovement>> {
        let sql = "SELECT * FROM inventory_movements WHERE transaction_id = $1";
        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(transaction_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Create a single inventory movement within a transaction
    pub async fn create_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        movement: InventoryMovement,
    ) -> Result<InventoryMovement> {
        let sql = r#"
            INSERT INTO inventory_movements (
                id, transaction_id, inventory_level_id, type, quantity,
                previous_balance, new_balance, _status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryMovement>(sql)
            .bind(movement.id)
            .bind(movement.transaction_id)
            .bind(movement.inventory_level_id)
            .bind(movement.movement_type)
            .bind(movement.quantity)
            .bind(movement.previous_balance)
            .bind(movement.new_balance)
            .bind(movement.sync_status)
            .bind(movement.created_at)
            .bind(movement.updated_at)
            .fetch_one(&mut **tx)
            .await
    }
}
