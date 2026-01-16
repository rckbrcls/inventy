use crate::db::DbTransaction;
use crate::models::inventory_level_model::InventoryLevel;
use sqlx::{Result, SqlitePool};

pub struct InventoryLevelsRepository {
    pool: SqlitePool,
}

impl InventoryLevelsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: InventoryLevel) -> Result<InventoryLevel> {
        let sql = r#"
            INSERT INTO inventory_levels (
                id, product_id, location_id, batch_number, serial_number, expiry_date,
                quantity_on_hand, quantity_reserved, stock_status, aisle_bin_slot,
                last_counted_at, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(item.id)
            .bind(item.product_id)
            .bind(item.location_id)
            .bind(item.batch_number)
            .bind(item.serial_number)
            .bind(item.expiry_date)
            .bind(item.quantity_on_hand)
            .bind(item.quantity_reserved)
            .bind(item.stock_status)
            .bind(item.aisle_bin_slot)
            .bind(item.last_counted_at)
            .bind(item.sync_status)
            .bind(item.created_at)
            .bind(item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: InventoryLevel) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels SET
                product_id = $2,
                location_id = $3,
                batch_number = $4,
                serial_number = $5,
                expiry_date = $6,
                quantity_on_hand = $7,
                quantity_reserved = $8,
                stock_status = $9,
                aisle_bin_slot = $10,
                last_counted_at = $11,
                _status = $12,
                updated_at = $13
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(item.id)
            .bind(item.product_id)
            .bind(item.location_id)
            .bind(item.batch_number)
            .bind(item.serial_number)
            .bind(item.expiry_date)
            .bind(item.quantity_on_hand)
            .bind(item.quantity_reserved)
            .bind(item.stock_status)
            .bind(item.aisle_bin_slot)
            .bind(item.last_counted_at)
            .bind(item.sync_status)
            .bind(item.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM inventory_levels WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<InventoryLevel>> {
        sqlx::query_as::<_, InventoryLevel>("SELECT * FROM inventory_levels WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_all(&self) -> Result<Vec<InventoryLevel>> {
        sqlx::query_as::<_, InventoryLevel>("SELECT * FROM inventory_levels")
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Find inventory level by product and location within a transaction
    pub async fn find_by_product_and_location_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        product_id: &str,
        location_id: &str,
    ) -> Result<Option<InventoryLevel>> {
        let sql = r#"
            SELECT * FROM inventory_levels
            WHERE product_id = $1 AND location_id = $2 AND stock_status = 'sellable' AND _status != 'deleted'
            LIMIT 1
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(product_id)
            .bind(location_id)
            .fetch_optional(&mut **tx)
            .await
    }

    /// Decrease quantity_on_hand within a transaction (for sales/transfers out)
    pub async fn decrease_quantity_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        quantity: f64,
    ) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_on_hand = quantity_on_hand - $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity)
            .fetch_one(&mut **tx)
            .await
    }

    /// Increase quantity_on_hand within a transaction (for purchases/transfers in)
    pub async fn increase_quantity_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        quantity: f64,
    ) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_on_hand = quantity_on_hand + $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity)
            .fetch_one(&mut **tx)
            .await
    }

    /// Reserve stock within a transaction (for pending sales)
    pub async fn reserve_quantity_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        quantity: f64,
    ) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_reserved = quantity_reserved + $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity)
            .fetch_one(&mut **tx)
            .await
    }

    /// Release reserved stock within a transaction (for cancelled sales)
    pub async fn release_reservation_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        quantity: f64,
    ) -> Result<InventoryLevel> {
        let sql = r#"
            UPDATE inventory_levels
            SET quantity_reserved = quantity_reserved - $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(id)
            .bind(quantity)
            .fetch_one(&mut **tx)
            .await
    }

    /// Find all inventory levels for a product within a transaction
    pub async fn find_by_product_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        product_id: &str,
    ) -> Result<Vec<InventoryLevel>> {
        let sql = "SELECT * FROM inventory_levels WHERE product_id = $1 AND _status != 'deleted'";
        sqlx::query_as::<_, InventoryLevel>(sql)
            .bind(product_id)
            .fetch_all(&mut **tx)
            .await
    }
}
