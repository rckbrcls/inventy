use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use crate::features::transaction::models::transaction_model::TransactionItem;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTransactionItemDTO {
    pub transaction_id: String,
    pub product_id: Option<String>,
    pub sku_snapshot: Option<String>,
    pub name_snapshot: Option<String>,
    pub quantity: f64,
    pub unit_price: f64,
    pub unit_cost: Option<f64>,
    pub attributes_snapshot: Option<String>,
    pub tax_details: Option<String>,
}

impl CreateTransactionItemDTO {
    pub fn into_model(self) -> TransactionItem {
        let now = Utc::now();
        TransactionItem {
            id: Uuid::new_v4().to_string(),
            transaction_id: self.transaction_id,
            product_id: self.product_id,
            sku_snapshot: self.sku_snapshot,
            name_snapshot: self.name_snapshot,
            quantity: self.quantity,
            unit_price: self.unit_price,
            unit_cost: self.unit_cost,
            total_line: Some(self.quantity * self.unit_price),
            attributes_snapshot: self.attributes_snapshot,
            tax_details: self.tax_details,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTransactionItemDTO {
    pub id: String,
    pub product_id: Option<String>,
    pub sku_snapshot: Option<String>,
    pub name_snapshot: Option<String>,
    pub quantity: Option<f64>,
    pub unit_price: Option<f64>,
    pub unit_cost: Option<f64>,
    pub attributes_snapshot: Option<String>,
    pub tax_details: Option<String>,
}

impl UpdateTransactionItemDTO {
    pub fn apply_to_model(self, mut item: TransactionItem) -> TransactionItem {
        let now = Utc::now();

        if let Some(product_id) = self.product_id {
            item.product_id = Some(product_id);
        }
        if let Some(sku_snapshot) = self.sku_snapshot {
            item.sku_snapshot = Some(sku_snapshot);
        }
        if let Some(name_snapshot) = self.name_snapshot {
            item.name_snapshot = Some(name_snapshot);
        }
        if let Some(quantity) = self.quantity {
            item.quantity = quantity;
        }
        if let Some(unit_price) = self.unit_price {
            item.unit_price = unit_price;
        }
        if let Some(unit_cost) = self.unit_cost {
            item.unit_cost = Some(unit_cost);
        }
        if let Some(attributes_snapshot) = self.attributes_snapshot {
            item.attributes_snapshot = Some(attributes_snapshot);
        }
        if let Some(tax_details) = self.tax_details {
            item.tax_details = Some(tax_details);
        }

        // Recalculate total_line
        item.total_line = Some(item.quantity * item.unit_price);
        item.sync_status = Some("updated".to_string());
        item.updated_at = Some(now);
        item
    }
}
