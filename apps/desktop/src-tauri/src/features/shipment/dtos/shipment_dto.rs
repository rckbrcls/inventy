use crate::features::shipment::models::shipment_model::{Shipment, ShipmentItem};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateShipmentItemDTO {
    pub order_item_id: String,
    pub quantity: i32,
    pub batch_number: Option<String>,
    pub serial_numbers: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateShipmentDTO {
    pub order_id: String,
    pub location_id: Option<String>,
    pub status: Option<String>,
    pub carrier_company: Option<String>,
    pub carrier_service: Option<String>,
    pub tracking_number: Option<String>,
    pub tracking_url: Option<String>,
    pub weight_g: Option<i32>,
    pub height_mm: Option<i32>,
    pub width_mm: Option<i32>,
    pub depth_mm: Option<i32>,
    pub package_type: Option<String>,
    pub shipping_label_url: Option<String>,
    pub invoice_url: Option<String>,
    pub invoice_key: Option<String>,
    pub cost_amount: Option<f64>,
    pub insurance_amount: Option<f64>,
    pub estimated_delivery_at: Option<DateTime<Utc>>,
    pub metadata: Option<String>,
    pub customs_info: Option<String>,
    pub items: Vec<CreateShipmentItemDTO>,
}

impl CreateShipmentDTO {
    pub fn into_models(self) -> (Shipment, Vec<ShipmentItem>) {
        let shipment_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let shipment = Shipment {
            id: shipment_id.clone(),
            order_id: self.order_id,
            location_id: self.location_id,
            status: self.status.or(Some("pending".to_string())),
            carrier_company: self.carrier_company,
            carrier_service: self.carrier_service,
            tracking_number: self.tracking_number,
            tracking_url: self.tracking_url,
            weight_g: self.weight_g,
            height_mm: self.height_mm,
            width_mm: self.width_mm,
            depth_mm: self.depth_mm,
            package_type: self.package_type,
            shipping_label_url: self.shipping_label_url,
            invoice_url: self.invoice_url,
            invoice_key: self.invoice_key,
            cost_amount: self.cost_amount,
            insurance_amount: self.insurance_amount,
            estimated_delivery_at: self.estimated_delivery_at,
            shipped_at: None,
            delivered_at: None,
            metadata: self.metadata,
            customs_info: self.customs_info,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        };

        let items = self
            .items
            .into_iter()
            .map(|i| ShipmentItem {
                id: Uuid::new_v4().to_string(),
                shipment_id: shipment_id.clone(),
                order_item_id: i.order_item_id,
                quantity: i.quantity,
                batch_number: i.batch_number,
                serial_numbers: i.serial_numbers,
                sync_status: Some("created".to_string()),
                created_at: Some(now),
                updated_at: Some(now),
            })
            .collect();

        (shipment, items)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateShipmentDTO {
    pub location_id: Option<String>,
    pub status: Option<String>,
    pub carrier_company: Option<String>,
    pub carrier_service: Option<String>,
    pub tracking_number: Option<String>,
    pub tracking_url: Option<String>,
    pub weight_g: Option<i32>,
    pub height_mm: Option<i32>,
    pub width_mm: Option<i32>,
    pub depth_mm: Option<i32>,
    pub package_type: Option<String>,
    pub shipping_label_url: Option<String>,
    pub invoice_url: Option<String>,
    pub invoice_key: Option<String>,
    pub cost_amount: Option<f64>,
    pub insurance_amount: Option<f64>,
    pub estimated_delivery_at: Option<DateTime<Utc>>,
    pub shipped_at: Option<DateTime<Utc>>,
    pub delivered_at: Option<DateTime<Utc>>,
    pub metadata: Option<String>,
    pub customs_info: Option<String>,
}
