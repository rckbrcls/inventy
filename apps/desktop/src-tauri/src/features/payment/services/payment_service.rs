use crate::features::payment::models::payment_model::Payment;
use crate::features::order::repositories::orders_repository::OrdersRepository;
use crate::features::refund::models::refund_model::Refund;
use crate::features::payment::repositories::payments_repository::PaymentsRepository;
use crate::features::refund::repositories::refunds_repository::RefundsRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct PaymentService {
    pool: SqlitePool,
}

impl PaymentService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    /// Capture a payment atomically
    /// This method:
    /// 1. Validates payment exists and is in 'authorized' status
    /// 2. Updates payment status to 'captured'
    /// 3. Updates order payment_status to 'paid'
    ///
    /// All operations are wrapped in a database transaction for atomicity
    pub async fn capture_payment(
        &self,
        payment_id: &str,
        order_id: Option<&str>,
    ) -> Result<Payment, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // 1. Get and validate payment
        let payment = PaymentsRepository::get_by_id_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao buscar pagamento: {}", e))?
            .ok_or_else(|| "Pagamento não encontrado".to_string())?;

        if payment.status == "captured" {
            return Err("Pagamento já foi capturado".to_string());
        }

        if payment.status == "voided" {
            return Err("Pagamento foi estornado e não pode ser capturado".to_string());
        }

        // 2. Capture payment
        let captured_payment = PaymentsRepository::capture_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao capturar pagamento: {}", e))?;

        // 3. Update order payment status if order_id provided
        if let Some(oid) = order_id {
            OrdersRepository::update_payment_status_with_tx(&mut tx, oid, "paid")
                .await
                .map_err(|e| format!("Erro ao atualizar status de pagamento da order: {}", e))?;
        }

        // 4. Commit transaction
        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(captured_payment)
    }

    /// Void a payment atomically
    /// This method cancels/voids a payment that hasn't been captured yet
    pub async fn void_payment(
        &self,
        payment_id: &str,
        order_id: Option<&str>,
    ) -> Result<Payment, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get and validate payment
        let payment = PaymentsRepository::get_by_id_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao buscar pagamento: {}", e))?
            .ok_or_else(|| "Pagamento não encontrado".to_string())?;

        if payment.status == "voided" {
            return Err("Pagamento já foi estornado".to_string());
        }

        if payment.status == "captured" {
            return Err("Pagamento já foi capturado. Use refund para reembolsar.".to_string());
        }

        // Void payment
        let voided_payment = PaymentsRepository::void_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao estornar pagamento: {}", e))?;

        // Update order payment status if order_id provided
        if let Some(oid) = order_id {
            OrdersRepository::update_payment_status_with_tx(&mut tx, oid, "voided")
                .await
                .map_err(|e| format!("Erro ao atualizar status de pagamento da order: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(voided_payment)
    }

    /// Process a refund atomically
    /// This method:
    /// 1. Validates payment exists and is captured
    /// 2. Validates refund amount doesn't exceed available amount
    /// 3. Creates refund record
    /// 4. Updates payment status to 'partially_refunded' or 'refunded'
    /// 5. Updates order payment status if applicable
    pub async fn process_refund(
        &self,
        payment_id: &str,
        amount: f64,
        reason: Option<&str>,
        created_by: Option<&str>,
        order_id: Option<&str>,
    ) -> Result<Refund, String> {
        if amount <= 0.0 {
            return Err("Valor do reembolso deve ser maior que zero".to_string());
        }

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // 1. Get and validate payment
        let payment = PaymentsRepository::get_by_id_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao buscar pagamento: {}", e))?
            .ok_or_else(|| "Pagamento não encontrado".to_string())?;

        if payment.status != "captured" && payment.status != "partially_refunded" {
            return Err(format!(
                "Pagamento com status '{}' não pode ser reembolsado",
                payment.status
            ));
        }

        // 2. Calculate already refunded amount
        let already_refunded = PaymentsRepository::get_refunded_amount_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao calcular valor reembolsado: {}", e))?;

        let available_for_refund = payment.amount - already_refunded;

        if amount > available_for_refund {
            return Err(format!(
                "Valor do reembolso ({}) excede o disponível ({})",
                amount, available_for_refund
            ));
        }

        // 3. Create refund record
        let now = Some(Utc::now());
        let refund = Refund {
            id: Uuid::new_v4().to_string(),
            payment_id: payment_id.to_string(),
            amount,
            status: "completed".to_string(),
            reason: reason.map(|s| s.to_string()),
            provider_refund_id: None, // Would be set by payment provider integration
            sync_status: Some("created".to_string()),
            created_at: now,
            updated_at: now,
            created_by: created_by.map(|s| s.to_string()),
        };

        let created_refund = RefundsRepository::create_with_tx(&mut tx, refund)
            .await
            .map_err(|e| format!("Erro ao criar reembolso: {}", e))?;

        // 4. Update payment status
        let total_refunded = already_refunded + amount;
        let new_status = if (payment.amount - total_refunded).abs() < 0.01 {
            "refunded"
        } else {
            "partially_refunded"
        };

        PaymentsRepository::update_status_with_tx(&mut tx, payment_id, new_status)
            .await
            .map_err(|e| format!("Erro ao atualizar status do pagamento: {}", e))?;

        // 5. Update order payment status if applicable
        if let Some(oid) = order_id {
            OrdersRepository::update_payment_status_with_tx(&mut tx, oid, new_status)
                .await
                .map_err(|e| format!("Erro ao atualizar status de pagamento da order: {}", e))?;
        }

        // 6. Commit transaction
        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_refund)
    }

    /// Get total refunded amount for a payment
    pub async fn get_refunded_amount(&self, payment_id: &str) -> Result<f64, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let amount = PaymentsRepository::get_refunded_amount_with_tx(&mut tx, payment_id)
            .await
            .map_err(|e| format!("Erro ao calcular valor reembolsado: {}", e))?;

        Ok(amount)
    }
}
