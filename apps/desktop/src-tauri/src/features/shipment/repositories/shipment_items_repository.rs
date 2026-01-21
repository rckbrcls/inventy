use crate::features::shipment::models::shipment_model::ShipmentItem;
use sqlx::{Result, SqlitePool};

pub struct ShipmentItemsRepository {
    pool: SqlitePool,
}

impl ShipmentItemsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(&self, items: Vec<ShipmentItem>) -> Result<Vec<ShipmentItem>> {
        let mut tx = self.pool.begin().await?;
        let mut created_items = Vec::new();

        for item in items {
            let item_sql = r#"
                INSERT INTO shipment_items (
                    id, shipment_id, order_item_id, quantity, batch_number,
                    serial_numbers, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            "#;
            let created_item = sqlx::query_as::<_, ShipmentItem>(item_sql)
                .bind(item.id)
                .bind(item.shipment_id)
                .bind(item.order_item_id)
                .bind(item.quantity)
                .bind(item.batch_number)
                .bind(item.serial_numbers)
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

    pub async fn delete_by_shipment_id(&self, shipment_id: &str) -> Result<()> {
        let sql = "DELETE FROM shipment_items WHERE shipment_id = $1";
        sqlx::query(sql)
            .bind(shipment_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_shipment_id(&self, shipment_id: &str) -> Result<Vec<ShipmentItem>> {
        let sql = "SELECT * FROM shipment_items WHERE shipment_id = $1";
        sqlx::query_as::<_, ShipmentItem>(sql)
            .bind(shipment_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods (for use in services)
    // ============================================================

    pub async fn create_many_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        items: Vec<ShipmentItem>,
    ) -> Result<Vec<ShipmentItem>> {
        let mut created_items = Vec::new();

        for item in items {
            let item_sql = r#"
                INSERT INTO shipment_items (
                    id, shipment_id, order_item_id, quantity, batch_number,
                    serial_numbers, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            "#;
            let created_item = sqlx::query_as::<_, ShipmentItem>(item_sql)
                .bind(&item.id)
                .bind(&item.shipment_id)
                .bind(&item.order_item_id)
                .bind(&item.quantity)
                .bind(&item.batch_number)
                .bind(&item.serial_numbers)
                .bind(&item.sync_status)
                .bind(&item.created_at)
                .bind(&item.updated_at)
                .fetch_one(&mut **tx)
                .await?;

            created_items.push(created_item);
        }

        Ok(created_items)
    }
}
