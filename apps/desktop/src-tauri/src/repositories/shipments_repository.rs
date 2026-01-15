use crate::models::shipment_model::Shipment;
use sqlx::{Result, SqlitePool};

pub struct ShipmentsRepository {
    pool: SqlitePool,
}

impl ShipmentsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, shipment: Shipment) -> Result<Shipment> {
        let sql = r#"
            INSERT INTO shipments (
                id, order_id, location_id, status, carrier_company, carrier_service,
                tracking_number, tracking_url, weight_g, height_mm, width_mm, depth_mm,
                package_type, shipping_label_url, invoice_url, invoice_key,
                cost_amount, insurance_amount, estimated_delivery_at,
                shipped_at, delivered_at, metadata, customs_info,
                _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
            RETURNING *
        "#;

        sqlx::query_as::<_, Shipment>(sql)
            .bind(&shipment.id)
            .bind(&shipment.order_id)
            .bind(&shipment.location_id)
            .bind(&shipment.status)
            .bind(&shipment.carrier_company)
            .bind(&shipment.carrier_service)
            .bind(&shipment.tracking_number)
            .bind(&shipment.tracking_url)
            .bind(&shipment.weight_g)
            .bind(&shipment.height_mm)
            .bind(&shipment.width_mm)
            .bind(&shipment.depth_mm)
            .bind(&shipment.package_type)
            .bind(&shipment.shipping_label_url)
            .bind(&shipment.invoice_url)
            .bind(&shipment.invoice_key)
            .bind(&shipment.cost_amount)
            .bind(&shipment.insurance_amount)
            .bind(&shipment.estimated_delivery_at)
            .bind(&shipment.shipped_at)
            .bind(&shipment.delivered_at)
            .bind(&shipment.metadata)
            .bind(&shipment.customs_info)
            .bind(&shipment.sync_status)
            .bind(&shipment.created_at)
            .bind(&shipment.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, shipment: Shipment) -> Result<Shipment> {
        let sql = r#"
            UPDATE shipments SET
                order_id = $2,
                location_id = $3,
                status = $4,
                carrier_company = $5,
                carrier_service = $6,
                tracking_number = $7,
                tracking_url = $8,
                weight_g = $9,
                height_mm = $10,
                width_mm = $11,
                depth_mm = $12,
                package_type = $13,
                shipping_label_url = $14,
                invoice_url = $15,
                invoice_key = $16,
                cost_amount = $17,
                insurance_amount = $18,
                estimated_delivery_at = $19,
                shipped_at = $20,
                delivered_at = $21,
                metadata = $22,
                customs_info = $23,
                _status = $24,
                updated_at = $25
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Shipment>(sql)
            .bind(shipment.id) // $1
            .bind(shipment.order_id) // $2
            .bind(shipment.location_id) // $3
            .bind(shipment.status) // $4
            .bind(shipment.carrier_company) // $5
            .bind(shipment.carrier_service) // $6
            .bind(shipment.tracking_number) // $7
            .bind(shipment.tracking_url) // $8
            .bind(shipment.weight_g) // $9
            .bind(shipment.height_mm) // $10
            .bind(shipment.width_mm) // $11
            .bind(shipment.depth_mm) // $12
            .bind(shipment.package_type) // $13
            .bind(shipment.shipping_label_url) // $14
            .bind(shipment.invoice_url) // $15
            .bind(shipment.invoice_key) // $16
            .bind(shipment.cost_amount) // $17
            .bind(shipment.insurance_amount) // $18
            .bind(shipment.estimated_delivery_at) // $19
            .bind(shipment.shipped_at) // $20
            .bind(shipment.delivered_at) // $21
            .bind(shipment.metadata) // $22
            .bind(shipment.customs_info) // $23
            .bind(shipment.sync_status) // $24
            .bind(shipment.updated_at) // $25
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM shipments WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Shipment>> {
        let sql = "SELECT * FROM shipments WHERE id = $1";
        sqlx::query_as::<_, Shipment>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Shipment>> {
        let sql = "SELECT * FROM shipments ORDER BY created_at DESC";
        sqlx::query_as::<_, Shipment>(sql)
            .fetch_all(&self.pool)
            .await
    }
}
