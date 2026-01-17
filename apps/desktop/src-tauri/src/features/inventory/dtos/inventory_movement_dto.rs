use crate::features::transaction::models::transaction_model::InventoryMovement;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInventoryMovementDTO {
    pub transaction_id: Option<String>,
    pub inventory_level_id: String,
    pub movement_type: String,
    pub quantity: f64,
    pub previous_balance: Option<f64>,
    pub new_balance: Option<f64>,
}

impl CreateInventoryMovementDTO {
    pub fn into_model(self) -> InventoryMovement {
        InventoryMovement {
            id: Uuid::new_v4().to_string(),
            transaction_id: self.transaction_id,
            inventory_level_id: Some(self.inventory_level_id),
            movement_type: Some(self.movement_type),
            quantity: self.quantity,
            previous_balance: self.previous_balance,
            new_balance: self.new_balance,
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        }
    }
}
