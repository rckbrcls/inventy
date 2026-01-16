use crate::db::DbTransaction;
use crate::models::order_model::Order;
use sqlx::{Result, SqlitePool};

pub struct OrdersRepository {
    pool: SqlitePool,
}

impl OrdersRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, order: Order) -> Result<Order> {
        let sql = r#"
            INSERT INTO orders (
                id, order_number, idempotency_key, channel, shop_id, customer_id,
                status, payment_status, fulfillment_status, currency, subtotal_price,
                total_discounts, total_tax, total_shipping, total_tip, total_price,
                tax_lines, discount_codes, note, tags, custom_attributes, metadata,
                customer_snapshot, billing_address, shipping_address, _status,
                created_at, updated_at, cancelled_at, closed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(order.id) // $1
            .bind(order.order_number) // $2
            .bind(order.idempotency_key) // $3
            .bind(order.channel) // $4
            .bind(order.shop_id) // $5
            .bind(order.customer_id) // $6
            .bind(order.status) // $7
            .bind(order.payment_status) // $8
            .bind(order.fulfillment_status) // $9
            .bind(order.currency) // $10
            .bind(order.subtotal_price) // $11
            .bind(order.total_discounts) // $12
            .bind(order.total_tax) // $13
            .bind(order.total_shipping) // $14
            .bind(order.total_tip) // $15
            .bind(order.total_price) // $16
            .bind(order.tax_lines) // $17
            .bind(order.discount_codes) // $18
            .bind(order.note) // $19
            .bind(order.tags) // $20
            .bind(order.custom_attributes) // $21
            .bind(order.metadata) // $22
            .bind(order.customer_snapshot) // $23
            .bind(order.billing_address) // $24
            .bind(order.shipping_address) // $25
            .bind(order.sync_status) // $26
            .bind(order.created_at) // $27
            .bind(order.updated_at) // $28
            .bind(order.cancelled_at) // $29
            .bind(order.closed_at) // $30
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, order: Order) -> Result<Order> {
        let sql = r#"
            UPDATE orders SET
                order_number = $2,
                idempotency_key = $3,
                channel = $4,
                shop_id = $5,
                customer_id = $6,
                status = $7,
                payment_status = $8,
                fulfillment_status = $9,
                currency = $10,
                subtotal_price = $11,
                total_discounts = $12,
                total_tax = $13,
                total_shipping = $14,
                total_tip = $15,
                total_price = $16,
                tax_lines = $17,
                discount_codes = $18,
                note = $19,
                tags = $20,
                custom_attributes = $21,
                metadata = $22,
                customer_snapshot = $23,
                billing_address = $24,
                shipping_address = $25,
                _status = $26,
                updated_at = $27,
                cancelled_at = $28,
                closed_at = $29
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(order.id) // $1
            .bind(order.order_number) // $2
            .bind(order.idempotency_key) // $3
            .bind(order.channel) // $4
            .bind(order.shop_id) // $5
            .bind(order.customer_id) // $6
            .bind(order.status) // $7
            .bind(order.payment_status) // $8
            .bind(order.fulfillment_status) // $9
            .bind(order.currency) // $10
            .bind(order.subtotal_price) // $11
            .bind(order.total_discounts) // $12
            .bind(order.total_tax) // $13
            .bind(order.total_shipping) // $14
            .bind(order.total_tip) // $15
            .bind(order.total_price) // $16
            .bind(order.tax_lines) // $17
            .bind(order.discount_codes) // $18
            .bind(order.note) // $19
            .bind(order.tags) // $20
            .bind(order.custom_attributes) // $21
            .bind(order.metadata) // $22
            .bind(order.customer_snapshot) // $23
            .bind(order.billing_address) // $24
            .bind(order.shipping_address) // $25
            .bind(order.sync_status) // $26
            .bind(order.updated_at) // $27
            .bind(order.cancelled_at) // $28
            .bind(order.closed_at) // $29
            .fetch_one(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: &str) -> Result<Option<Order>> {
        let sql = "SELECT * FROM orders WHERE id = $1";

        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Order>> {
        let sql = "SELECT * FROM orders ORDER BY created_at DESC";

        sqlx::query_as::<_, Order>(sql).fetch_all(&self.pool).await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM orders WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;

        Ok(())
    }

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Create an order within a database transaction
    pub async fn create_with_tx<'a>(tx: &mut DbTransaction<'a>, order: Order) -> Result<Order> {
        let sql = r#"
            INSERT INTO orders (
                id, order_number, idempotency_key, channel, shop_id, customer_id,
                status, payment_status, fulfillment_status, currency, subtotal_price,
                total_discounts, total_tax, total_shipping, total_tip, total_price,
                tax_lines, discount_codes, note, tags, custom_attributes, metadata,
                customer_snapshot, billing_address, shipping_address, _status,
                created_at, updated_at, cancelled_at, closed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
            RETURNING *
        "#;

        sqlx::query_as::<_, Order>(sql)
            .bind(order.id)
            .bind(order.order_number)
            .bind(order.idempotency_key)
            .bind(order.channel)
            .bind(order.shop_id)
            .bind(order.customer_id)
            .bind(order.status)
            .bind(order.payment_status)
            .bind(order.fulfillment_status)
            .bind(order.currency)
            .bind(order.subtotal_price)
            .bind(order.total_discounts)
            .bind(order.total_tax)
            .bind(order.total_shipping)
            .bind(order.total_tip)
            .bind(order.total_price)
            .bind(order.tax_lines)
            .bind(order.discount_codes)
            .bind(order.note)
            .bind(order.tags)
            .bind(order.custom_attributes)
            .bind(order.metadata)
            .bind(order.customer_snapshot)
            .bind(order.billing_address)
            .bind(order.shipping_address)
            .bind(order.sync_status)
            .bind(order.created_at)
            .bind(order.updated_at)
            .bind(order.cancelled_at)
            .bind(order.closed_at)
            .fetch_one(&mut **tx)
            .await
    }

    /// Get order by ID within a database transaction
    pub async fn get_by_id_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
    ) -> Result<Option<Order>> {
        let sql = "SELECT * FROM orders WHERE id = $1";
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    /// Update payment status within a database transaction
    pub async fn update_payment_status_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        payment_status: &str,
    ) -> Result<Order> {
        let sql = r#"
            UPDATE orders
            SET payment_status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .bind(payment_status)
            .fetch_one(&mut **tx)
            .await
    }

    /// Update fulfillment status within a database transaction
    pub async fn update_fulfillment_status_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        id: &str,
        fulfillment_status: &str,
    ) -> Result<Order> {
        let sql = r#"
            UPDATE orders
            SET fulfillment_status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .bind(fulfillment_status)
            .fetch_one(&mut **tx)
            .await
    }

    /// Cancel order within a database transaction
    pub async fn cancel_with_tx<'a>(tx: &mut DbTransaction<'a>, id: &str) -> Result<Order> {
        let sql = r#"
            UPDATE orders
            SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Order>(sql)
            .bind(id)
            .fetch_one(&mut **tx)
            .await
    }

    /// Find orders by customer within a database transaction
    pub async fn find_by_customer_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        customer_id: &str,
    ) -> Result<Vec<Order>> {
        let sql = "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, Order>(sql)
            .bind(customer_id)
            .fetch_all(&mut **tx)
            .await
    }
}
