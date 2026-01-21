use crate::features::payment::models::payment_model::Payment;
use crate::features::payment::repositories::payments_repository::PaymentsRepository;
use crate::features::payment::services::payment_service::PaymentService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn list_payments(pool: State<'_, SqlitePool>) -> Result<Vec<Payment>, String> {
    let repo = PaymentsRepository::new(pool.inner());
    repo.list()
        .await
        .map_err(|e| format!("Failed to list payments: {}", e))
}

#[tauri::command]
pub async fn list_payments_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<Payment>, String> {
    let service = PaymentService::new(pool.inner().clone());
    service.list_payments_by_shop(&shop_id).await
}

#[tauri::command]
pub async fn get_payment(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Payment>, String> {
    let repo = PaymentsRepository::new(pool.inner());
    repo.get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to get payment: {}", e))
}

#[tauri::command]
pub async fn update_payment_status(
    pool: State<'_, SqlitePool>,
    id: String,
    status: String,
) -> Result<Payment, String> {
    let mut payment = PaymentsRepository::new(pool.inner())
        .get_by_id(&id)
        .await
        .map_err(|e| format!("Failed to get payment: {}", e))?
        .ok_or_else(|| format!("Payment not found: {}", id))?;

    payment.status = status.clone();
    payment.updated_at = Some(chrono::Utc::now());

    PaymentsRepository::new(pool.inner())
        .update(payment)
        .await
        .map_err(|e| format!("Failed to update payment status: {}", e))
}
