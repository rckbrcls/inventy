use crate::features::inventory::models::inventory_level_model::InventoryLevel;
use chrono::{NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInventoryLevelDTO {
    pub product_id: String,
    pub location_id: String,
    pub batch_number: Option<String>,
    pub serial_number: Option<String>,
    pub expiry_date: Option<NaiveDate>,
    pub quantity_on_hand: Option<f64>,
    pub quantity_reserved: Option<f64>,
    pub stock_status: Option<String>,
    pub aisle_bin_slot: Option<String>,
}

impl CreateInventoryLevelDTO {
    pub fn into_model(self) -> InventoryLevel {
        InventoryLevel {
            id: Uuid::new_v4().to_string(),
            product_id: self.product_id,
            location_id: self.location_id,
            batch_number: self.batch_number,
            serial_number: self.serial_number,
            expiry_date: self.expiry_date,
            quantity_on_hand: self.quantity_on_hand.unwrap_or(0.0),
            quantity_reserved: self.quantity_reserved.unwrap_or(0.0),
            stock_status: self.stock_status.or(Some("sellable".to_string())),
            aisle_bin_slot: self.aisle_bin_slot,
            last_counted_at: None,
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInventoryLevelDTO {
    pub id: String,
    pub product_id: Option<String>,
    pub location_id: Option<String>,
    pub batch_number: Option<String>,
    pub serial_number: Option<String>,
    pub expiry_date: Option<NaiveDate>,
    pub quantity_on_hand: Option<f64>,
    pub quantity_reserved: Option<f64>,
    pub stock_status: Option<String>,
    pub aisle_bin_slot: Option<String>,
}

impl UpdateInventoryLevelDTO {
    pub fn apply_to_model(self, mut level: InventoryLevel) -> InventoryLevel {
        if let Some(product_id) = self.product_id {
            level.product_id = product_id;
        }
        if let Some(location_id) = self.location_id {
            level.location_id = location_id;
        }
        if self.batch_number.is_some() {
            level.batch_number = self.batch_number;
        }
        if self.serial_number.is_some() {
            level.serial_number = self.serial_number;
        }
        if self.expiry_date.is_some() {
            level.expiry_date = self.expiry_date;
        }
        if let Some(quantity_on_hand) = self.quantity_on_hand {
            level.quantity_on_hand = quantity_on_hand;
        }
        if let Some(quantity_reserved) = self.quantity_reserved {
            level.quantity_reserved = quantity_reserved;
        }
        if let Some(stock_status) = self.stock_status {
            level.stock_status = Some(stock_status);
        }
        if self.aisle_bin_slot.is_some() {
            level.aisle_bin_slot = self.aisle_bin_slot;
        }
        level.updated_at = Some(Utc::now());
        level
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AdjustStockDTO {
    pub product_id: String,
    pub location_id: String,
    pub new_quantity: f64,
    pub reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferStockDTO {
    pub product_id: String,
    pub from_location_id: String,
    pub to_location_id: String,
    pub quantity: f64,
    pub reason: Option<String>,
}
