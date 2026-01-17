use crate::features::refund::dtos::refund_dto::{CreateRefundDTO, UpdateRefundDTO};
use crate::features::refund::models::refund_model::Refund;
use crate::features::refund::repositories::refunds_repository::RefundsRepository;
use sqlx::SqlitePool;

pub struct RefundService<'a> {
    repo: RefundsRepository<'a>,
}

impl<'a> RefundService<'a> {
    pub fn new(pool: &'a SqlitePool) -> Self {
        let repo = RefundsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_refund(&self, payload: CreateRefundDTO) -> Result<Refund, String> {
        let refund = payload.into_model();
        self.repo
            .create(refund)
            .await
            .map_err(|e| format!("Failed to create refund: {}", e))
    }

    pub async fn update_refund(&self, payload: UpdateRefundDTO) -> Result<Refund, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch refund: {}", e))?
            .ok_or_else(|| format!("Refund not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update refund: {}", e))
    }

    pub async fn delete_refund(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete refund: {}", e))
    }

    pub async fn get_refund(&self, id: &str) -> Result<Option<Refund>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch refund: {}", e))
    }

    pub async fn list_refunds(&self) -> Result<Vec<Refund>, String> {
        // List all refunds - we need to add this method to repository
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list refunds: {}", e))
    }

    pub async fn list_refunds_by_payment(&self, payment_id: &str) -> Result<Vec<Refund>, String> {
        self.repo
            .list_by_payment(payment_id)
            .await
            .map_err(|e| format!("Failed to list refunds by payment: {}", e))
    }

    pub async fn update_status(&self, id: &str, status: &str) -> Result<Refund, String> {
        let existing = self
            .repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch refund: {}", e))?
            .ok_or_else(|| format!("Refund not found: {}", id))?;

        let mut updated = existing;
        updated.status = status.to_string();
        updated.updated_at = Some(chrono::Utc::now());
        updated.sync_status = Some("updated".to_string());

        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update refund status: {}", e))
    }
}
