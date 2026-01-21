use crate::features::refund::models::refund_model::Refund;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateRefundDTO {
    pub payment_id: String,
    pub amount: f64,
    pub status: Option<String>,
    pub reason: Option<String>,
    pub provider_refund_id: Option<String>,
}

impl CreateRefundDTO {
    pub fn into_model(self) -> Refund {
        let now = Utc::now();
        Refund {
            id: Uuid::new_v4().to_string(),
            payment_id: self.payment_id,
            amount: self.amount,
            status: self.status.unwrap_or_else(|| "pending".to_string()),
            reason: self.reason,
            provider_refund_id: self.provider_refund_id,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
            created_by: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateRefundDTO {
    pub id: String,
    pub payment_id: Option<String>,
    pub amount: Option<f64>,
    pub status: Option<String>,
    pub reason: Option<String>,
    pub provider_refund_id: Option<String>,
}

impl UpdateRefundDTO {
    pub fn apply_to_model(self, mut refund: Refund) -> Refund {
        let now = Utc::now();
        if let Some(payment_id) = self.payment_id {
            refund.payment_id = payment_id;
        }
        if let Some(amount) = self.amount {
            refund.amount = amount;
        }
        if let Some(status) = self.status {
            refund.status = status;
        }
        if let Some(reason) = self.reason {
            refund.reason = Some(reason);
        }
        if let Some(provider_refund_id) = self.provider_refund_id {
            refund.provider_refund_id = Some(provider_refund_id);
        }
        refund.sync_status = Some("updated".to_string());
        refund.updated_at = Some(now);
        refund
    }
}
