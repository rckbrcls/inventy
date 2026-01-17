use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use crate::features::transaction::models::transaction_model::{Transaction, TransactionItem};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTransactionItemDTO {
    pub product_id: String,
    pub quantity: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTransactionDTO {
    pub r#type: String,
    pub status: Option<String>,
    pub channel: Option<String>,
    pub customer_id: Option<String>,
    pub supplier_id: Option<String>,
    pub staff_id: Option<String>,
    pub currency: Option<String>,
    pub total_shipping: Option<f64>,
    pub total_discount: Option<f64>,
    pub shipping_method: Option<String>,
    pub shipping_address: Option<String>,
    pub billing_address: Option<String>,
    pub location_id: Option<String>,
    pub items: Vec<CreateTransactionItemDTO>,
}

impl CreateTransactionDTO {
    pub fn into_models(self) -> (Transaction, Vec<TransactionItem>) {
        let transaction_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let transaction = Transaction {
            id: transaction_id.clone(),
            r#type: self.r#type,
            status: self.status.unwrap_or_else(|| "draft".to_string()),
            channel: self.channel,
            customer_id: self.customer_id,
            supplier_id: self.supplier_id,
            staff_id: self.staff_id,
            currency: self.currency.or(Some("BRL".to_string())),
            total_items: Some(self.items.len() as f64),
            total_shipping: self.total_shipping.or(Some(0.0)),
            total_discount: self.total_discount.or(Some(0.0)),
            total_net: Some(0.0), // Should be calculated by the service
            shipping_method: self.shipping_method,
            shipping_address: self.shipping_address,
            billing_address: self.billing_address,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        };

        let items = self.items
            .into_iter()
            .map(|i| TransactionItem {
                id: Uuid::new_v4().to_string(),
                transaction_id: transaction_id.clone(),
                product_id: Some(i.product_id),
                sku_snapshot: None,
                name_snapshot: None,
                quantity: i.quantity,
                unit_price: 0.0, // To be enriched by the service
                unit_cost: None,
                total_line: None,
                attributes_snapshot: None,
                tax_details: None,
                sync_status: Some("created".to_string()),
                created_at: Some(now),
                updated_at: Some(now),
            })
            .collect();

        (transaction, items)
    }
}
