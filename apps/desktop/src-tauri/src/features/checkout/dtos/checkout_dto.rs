use crate::features::checkout::models::checkout_model::Checkout;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

fn generate_token() -> String {
    // Generate a URL-safe token using UUID (removes hyphens for shorter format)
    Uuid::new_v4().to_string().replace("-", "")
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCheckoutDTO {
    pub shop_id: Option<String>,
    pub user_id: Option<String>,
    pub email: Option<String>,
    pub items: Option<String>,
    pub shipping_address: Option<String>,
    pub billing_address: Option<String>,
    pub shipping_line: Option<String>,
    pub applied_discount_codes: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_discounts: Option<f64>,
    pub total_price: Option<f64>,
    pub status: Option<String>,
    pub metadata: Option<String>,
    pub recovery_url: Option<String>,
}

impl CreateCheckoutDTO {
    pub fn into_model(self) -> Checkout {
        let now = Utc::now();
        let token = generate_token();

        Checkout {
            id: Uuid::new_v4().to_string(),
            shop_id: self.shop_id,
            token,
            user_id: self.user_id,
            email: self.email,
            items: self.items.or(Some("[]".to_string())),
            shipping_address: self.shipping_address,
            billing_address: self.billing_address,
            shipping_line: self.shipping_line,
            applied_discount_codes: self.applied_discount_codes,
            currency: self.currency.or(Some("BRL".to_string())),
            subtotal_price: self.subtotal_price.or(Some(0.0)),
            total_tax: self.total_tax.or(Some(0.0)),
            total_shipping: self.total_shipping.or(Some(0.0)),
            total_discounts: self.total_discounts.or(Some(0.0)),
            total_price: self.total_price.or(Some(0.0)),
            status: self.status.or(Some("open".to_string())),
            reservation_expires_at: None,
            completed_at: None,
            metadata: self.metadata,
            recovery_url: self.recovery_url,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCheckoutDTO {
    pub id: String,
    pub email: Option<String>,
    pub items: Option<String>,
    pub shipping_address: Option<String>,
    pub billing_address: Option<String>,
    pub shipping_line: Option<String>,
    pub applied_discount_codes: Option<String>,
    pub currency: Option<String>,
    pub subtotal_price: Option<f64>,
    pub total_tax: Option<f64>,
    pub total_shipping: Option<f64>,
    pub total_discounts: Option<f64>,
    pub total_price: Option<f64>,
    pub status: Option<String>,
    pub metadata: Option<String>,
    pub recovery_url: Option<String>,
}

impl UpdateCheckoutDTO {
    pub fn apply_to_checkout(self, existing: Checkout) -> Checkout {
        let now = Utc::now();

        let completed_at =
            if self.status.as_deref() == Some("completed") && existing.completed_at.is_none() {
                Some(now)
            } else {
                existing.completed_at
            };

        Checkout {
            id: existing.id,
            shop_id: existing.shop_id,
            token: existing.token,
            user_id: existing.user_id,
            email: self.email.or(existing.email),
            items: self.items.or(existing.items),
            shipping_address: self.shipping_address.or(existing.shipping_address),
            billing_address: self.billing_address.or(existing.billing_address),
            shipping_line: self.shipping_line.or(existing.shipping_line),
            applied_discount_codes: self
                .applied_discount_codes
                .or(existing.applied_discount_codes),
            currency: self.currency.or(existing.currency),
            subtotal_price: self.subtotal_price.or(existing.subtotal_price),
            total_tax: self.total_tax.or(existing.total_tax),
            total_shipping: self.total_shipping.or(existing.total_shipping),
            total_discounts: self.total_discounts.or(existing.total_discounts),
            total_price: self.total_price.or(existing.total_price),
            status: self.status.or(existing.status),
            reservation_expires_at: existing.reservation_expires_at,
            completed_at,
            metadata: self.metadata.or(existing.metadata),
            recovery_url: self.recovery_url.or(existing.recovery_url),
            sync_status: Some("updated".to_string()),
            created_at: existing.created_at,
            updated_at: Some(now),
        }
    }
}
