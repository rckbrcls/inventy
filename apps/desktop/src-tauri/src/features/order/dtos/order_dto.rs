use crate::features::order::models::order_model::Order;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderDTO {
    pub channel: Option<String>,
    pub shop_id: Option<String>,
    pub customer_id: Option<String>,
    pub status: Option<String>,
    pub payment_status: Option<String>,
    pub fulfillment_status: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: f64,
    pub total_discounts: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_tip: Option<f64>,
    pub total_price: f64,
    pub tax_lines: Option<String>,
    pub discount_codes: Option<String>,
    pub note: Option<String>,
    pub tags: Option<String>,
    pub custom_attributes: Option<String>,
    pub metadata: Option<String>,
    pub customer_snapshot: String,
    pub billing_address: Option<String>,
    pub shipping_address: Option<String>,
}

impl CreateOrderDTO {
    pub fn into_model(self) -> Order {
        let now = Utc::now();
        Order {
            id: Uuid::new_v4().to_string(),
            order_number: None,
            idempotency_key: Some(Uuid::new_v4().to_string()),
            channel: self.channel.or_else(|| Some("manual".to_string())),
            shop_id: self.shop_id,
            customer_id: self.customer_id,
            status: self.status.or_else(|| Some("open".to_string())),
            payment_status: self.payment_status.or_else(|| Some("unpaid".to_string())),
            fulfillment_status: self.fulfillment_status.or_else(|| Some("unfulfilled".to_string())),
            currency: self.currency.or_else(|| Some("BRL".to_string())),
            subtotal_price: self.subtotal_price,
            total_discounts: self.total_discounts,
            total_tax: self.total_tax,
            total_shipping: self.total_shipping,
            total_tip: self.total_tip,
            total_price: self.total_price,
            tax_lines: self.tax_lines,
            discount_codes: self.discount_codes,
            note: self.note,
            tags: self.tags,
            custom_attributes: self.custom_attributes,
            metadata: self.metadata,
            customer_snapshot: self.customer_snapshot,
            billing_address: self.billing_address,
            shipping_address: self.shipping_address,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
            cancelled_at: None,
            closed_at: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderDTO {
    pub id: String,
    pub channel: Option<String>,
    pub shop_id: Option<String>,
    pub customer_id: Option<String>,
    pub status: Option<String>,
    pub payment_status: Option<String>,
    pub fulfillment_status: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: Option<f64>,
    pub total_discounts: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_tip: Option<f64>,
    pub total_price: Option<f64>,
    pub tax_lines: Option<String>,
    pub discount_codes: Option<String>,
    pub note: Option<String>,
    pub tags: Option<String>,
    pub custom_attributes: Option<String>,
    pub metadata: Option<String>,
    pub customer_snapshot: Option<String>,
    pub billing_address: Option<String>,
    pub shipping_address: Option<String>,
}

impl UpdateOrderDTO {
    pub fn apply_to_model(self, mut order: Order) -> Order {
        let now = Utc::now();

        if let Some(channel) = self.channel {
            order.channel = Some(channel);
        }
        if let Some(shop_id) = self.shop_id {
            order.shop_id = Some(shop_id);
        }
        if let Some(customer_id) = self.customer_id {
            order.customer_id = Some(customer_id);
        }
        if let Some(status) = self.status {
            order.status = Some(status);
        }
        if let Some(payment_status) = self.payment_status {
            order.payment_status = Some(payment_status);
        }
        if let Some(fulfillment_status) = self.fulfillment_status {
            order.fulfillment_status = Some(fulfillment_status);
        }
        if let Some(currency) = self.currency {
            order.currency = Some(currency);
        }
        if let Some(subtotal_price) = self.subtotal_price {
            order.subtotal_price = subtotal_price;
        }
        if let Some(total_discounts) = self.total_discounts {
            order.total_discounts = Some(total_discounts);
        }
        if let Some(total_tax) = self.total_tax {
            order.total_tax = Some(total_tax);
        }
        if let Some(total_shipping) = self.total_shipping {
            order.total_shipping = Some(total_shipping);
        }
        if let Some(total_tip) = self.total_tip {
            order.total_tip = Some(total_tip);
        }
        if let Some(total_price) = self.total_price {
            order.total_price = total_price;
        }
        if let Some(tax_lines) = self.tax_lines {
            order.tax_lines = Some(tax_lines);
        }
        if let Some(discount_codes) = self.discount_codes {
            order.discount_codes = Some(discount_codes);
        }
        if let Some(note) = self.note {
            order.note = Some(note);
        }
        if let Some(tags) = self.tags {
            order.tags = Some(tags);
        }
        if let Some(custom_attributes) = self.custom_attributes {
            order.custom_attributes = Some(custom_attributes);
        }
        if let Some(metadata) = self.metadata {
            order.metadata = Some(metadata);
        }
        if let Some(customer_snapshot) = self.customer_snapshot {
            order.customer_snapshot = customer_snapshot;
        }
        if let Some(billing_address) = self.billing_address {
            order.billing_address = Some(billing_address);
        }
        if let Some(shipping_address) = self.shipping_address {
            order.shipping_address = Some(shipping_address);
        }

        order.sync_status = Some("updated".to_string());
        order.updated_at = Some(now);
        order
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateOrderStatusDTO {
    pub id: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePaymentStatusDTO {
    pub id: String,
    pub payment_status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateFulfillmentStatusDTO {
    pub id: String,
    pub fulfillment_status: String,
}
