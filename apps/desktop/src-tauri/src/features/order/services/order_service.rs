use crate::features::checkout::models::checkout_model::Checkout;
use crate::features::order::models::order_model::Order;
use crate::features::checkout::repositories::checkouts_repository::CheckoutsRepository;
use crate::features::customer::repositories::customer_repository::CustomerRepository;
use crate::features::order::repositories::orders_repository::OrdersRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct OrderService {
    pool: SqlitePool,
    #[allow(dead_code)]
    orders_repo: OrdersRepository,
    #[allow(dead_code)]
    checkouts_repo: CheckoutsRepository,
}

impl OrderService {
    pub fn new(pool: SqlitePool) -> Self {
        let orders_repo = OrdersRepository::new(pool.clone());
        let checkouts_repo = CheckoutsRepository::new(pool.clone());
        Self {
            pool,
            orders_repo,
            checkouts_repo,
        }
    }

    /// Create an order from a completed checkout atomically
    /// This method:
    /// 1. Validates checkout exists and is not already completed
    /// 2. Creates the order from checkout data
    /// 3. Marks checkout as completed
    /// 4. Updates customer stats
    ///
    /// All operations are wrapped in a database transaction for atomicity
    pub async fn create_from_checkout(
        &self,
        checkout_id: &str,
        shop_id: Option<&str>,
    ) -> Result<Order, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // 1. Get and validate checkout
        let checkout = CheckoutsRepository::get_by_id_with_tx(&mut tx, checkout_id)
            .await
            .map_err(|e| format!("Erro ao buscar checkout: {}", e))?
            .ok_or_else(|| "Checkout não encontrado".to_string())?;

        if checkout.status.as_deref() == Some("completed") {
            return Err("Checkout já foi completado".to_string());
        }

        if checkout.status.as_deref() == Some("expired") {
            return Err("Checkout expirado".to_string());
        }

        // 2. Create order from checkout data
        let order = self.build_order_from_checkout(&checkout, shop_id);

        let created_order = OrdersRepository::create_with_tx(&mut tx, order)
            .await
            .map_err(|e| format!("Erro ao criar order: {}", e))?;

        // 3. Mark checkout as completed
        CheckoutsRepository::update_status_with_tx(&mut tx, checkout_id, "completed")
            .await
            .map_err(|e| format!("Erro ao atualizar status do checkout: {}", e))?;

        // 4. Update customer stats if customer exists
        if let Some(ref customer_id) = checkout.user_id {
            let total = checkout.total_price.unwrap_or(0.0);
            CustomerRepository::increment_stats_with_tx(&mut tx, customer_id, total)
                .await
                .map_err(|e| format!("Erro ao atualizar estatísticas do cliente: {}", e))?;
        }

        // 5. Commit transaction
        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_order)
    }

    /// Cancel an order atomically
    /// This method cancels the order and optionally reverses customer stats
    pub async fn cancel_order(&self, order_id: &str) -> Result<Order, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get the order
        let order = OrdersRepository::get_by_id_with_tx(&mut tx, order_id)
            .await
            .map_err(|e| format!("Erro ao buscar order: {}", e))?
            .ok_or_else(|| "Order não encontrada".to_string())?;

        if order.status.as_deref() == Some("cancelled") {
            return Err("Order já está cancelada".to_string());
        }

        if order.fulfillment_status.as_deref() == Some("fulfilled") {
            return Err("Não é possível cancelar order já entregue".to_string());
        }

        // Cancel the order
        let cancelled_order = OrdersRepository::cancel_with_tx(&mut tx, order_id)
            .await
            .map_err(|e| format!("Erro ao cancelar order: {}", e))?;

        // Reverse customer stats if applicable
        if let Some(ref customer_id) = order.customer_id {
            let total = order.total_price;
            CustomerRepository::decrement_stats_with_tx(&mut tx, customer_id, total)
                .await
                .map_err(|e| format!("Erro ao reverter estatísticas do cliente: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar cancelamento: {}", e))?;

        Ok(cancelled_order)
    }

    /// Update fulfillment status atomically
    pub async fn update_fulfillment_status(
        &self,
        order_id: &str,
        status: &str,
    ) -> Result<Order, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let order = OrdersRepository::update_fulfillment_status_with_tx(&mut tx, order_id, status)
            .await
            .map_err(|e| format!("Erro ao atualizar status de fulfillment: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar atualização: {}", e))?;

        Ok(order)
    }

    /// Update payment status atomically
    pub async fn update_payment_status(
        &self,
        order_id: &str,
        status: &str,
    ) -> Result<Order, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let order = OrdersRepository::update_payment_status_with_tx(&mut tx, order_id, status)
            .await
            .map_err(|e| format!("Erro ao atualizar status de pagamento: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar atualização: {}", e))?;

        Ok(order)
    }

    /// Get orders for a customer
    pub async fn get_customer_orders(&self, customer_id: &str) -> Result<Vec<Order>, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let orders = OrdersRepository::find_by_customer_with_tx(&mut tx, customer_id)
            .await
            .map_err(|e| format!("Erro ao buscar orders do cliente: {}", e))?;

        Ok(orders)
    }

    // ============================================================
    // Helper methods
    // ============================================================

    fn build_order_from_checkout(&self, checkout: &Checkout, shop_id: Option<&str>) -> Order {
        let now = Some(Utc::now());

        // Build customer snapshot from checkout data
        let customer_snapshot = serde_json::json!({
            "email": checkout.email,
            "user_id": checkout.user_id
        })
        .to_string();

        Order {
            id: Uuid::new_v4().to_string(),
            order_number: None, // Will be auto-generated or set later
            idempotency_key: Some(checkout.id.clone()), // Use checkout ID as idempotency key
            channel: Some("checkout".to_string()),
            shop_id: shop_id.map(|s| s.to_string()),
            customer_id: checkout.user_id.clone(),
            status: Some("open".to_string()),
            payment_status: Some("pending".to_string()),
            fulfillment_status: Some("unfulfilled".to_string()),
            currency: checkout.currency.clone(),
            subtotal_price: checkout.subtotal_price.unwrap_or(0.0),
            total_discounts: checkout.total_discounts,
            total_tax: checkout.total_tax,
            total_shipping: checkout.total_shipping,
            total_tip: None,
            total_price: checkout.total_price.unwrap_or(0.0),
            tax_lines: None,
            discount_codes: checkout.applied_discount_codes.clone(),
            note: None,
            tags: None,
            custom_attributes: None,
            metadata: checkout.metadata.clone(),
            customer_snapshot,
            billing_address: checkout.billing_address.clone(),
            shipping_address: checkout.shipping_address.clone(),
            sync_status: Some("created".to_string()),
            created_at: now,
            updated_at: now,
            cancelled_at: None,
            closed_at: None,
        }
    }
}
