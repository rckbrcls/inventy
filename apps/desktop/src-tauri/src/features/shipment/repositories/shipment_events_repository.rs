use crate::features::shipment::models::shipment_model::ShipmentEvent;
use sqlx::{Result, SqlitePool};

pub struct ShipmentEventsRepository {
    pool: SqlitePool,
}

impl ShipmentEventsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(&self, events: Vec<ShipmentEvent>) -> Result<Vec<ShipmentEvent>> {
        let mut tx = self.pool.begin().await?;
        let mut created_events = Vec::new();

        for event in events {
            let event_sql = r#"
                INSERT INTO shipment_events (
                    id, shipment_id, status, description, location,
                    happened_at, raw_data, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            "#;
            let created_event = sqlx::query_as::<_, ShipmentEvent>(event_sql)
                .bind(event.id)
                .bind(event.shipment_id)
                .bind(event.status)
                .bind(event.description)
                .bind(event.location)
                .bind(event.happened_at)
                .bind(event.raw_data)
                .bind(event.sync_status)
                .bind(event.created_at)
                .bind(event.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_events.push(created_event);
        }

        tx.commit().await?;
        Ok(created_events)
    }

    pub async fn delete_by_shipment_id(&self, shipment_id: &str) -> Result<()> {
        let sql = "DELETE FROM shipment_events WHERE shipment_id = $1";
        sqlx::query(sql)
            .bind(shipment_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_shipment_id(&self, shipment_id: &str) -> Result<Vec<ShipmentEvent>> {
        let sql = "SELECT * FROM shipment_events WHERE shipment_id = $1 ORDER BY happened_at DESC";
        sqlx::query_as::<_, ShipmentEvent>(sql)
            .bind(shipment_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods (for use in services)
    // ============================================================

    pub async fn create_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        event: ShipmentEvent,
    ) -> Result<ShipmentEvent> {
        let event_sql = r#"
            INSERT INTO shipment_events (
                id, shipment_id, status, description, location,
                happened_at, raw_data, _status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        "#;
        sqlx::query_as::<_, ShipmentEvent>(event_sql)
            .bind(&event.id)
            .bind(&event.shipment_id)
            .bind(&event.status)
            .bind(&event.description)
            .bind(&event.location)
            .bind(&event.happened_at)
            .bind(&event.raw_data)
            .bind(&event.sync_status)
            .bind(&event.created_at)
            .bind(&event.updated_at)
            .fetch_one(&mut **tx)
            .await
    }
}
