use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCustomerGroupDTO {
    pub shop_id: String,
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    pub r#type: Option<String>,
    pub rules: Option<String>,
    pub default_discount_percentage: Option<f64>,
    pub price_list_id: Option<String>,
    pub tax_class: Option<String>,
    pub allowed_payment_methods: Option<String>,
    pub min_order_amount: Option<f64>,
    pub metadata: Option<String>,
}

impl CreateCustomerGroupDTO {
    pub fn into_model(self) -> CustomerGroup {
        let now = Utc::now();
        CustomerGroup {
            id: Uuid::new_v4().to_string(),
            shop_id: self.shop_id,
            name: self.name,
            code: self.code,
            description: self.description,
            r#type: self.r#type.or_else(|| Some("manual".to_string())),
            rules: self.rules.or_else(|| Some("[]".to_string())),
            default_discount_percentage: self.default_discount_percentage.or(Some(0.0)),
            price_list_id: self.price_list_id,
            tax_class: self.tax_class,
            allowed_payment_methods: self.allowed_payment_methods,
            min_order_amount: self.min_order_amount.or(Some(0.0)),
            metadata: self.metadata.or_else(|| Some("{}".to_string())),
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCustomerGroupDTO {
    pub id: String,
    pub shop_id: Option<String>,
    pub name: Option<String>,
    pub code: Option<String>,
    pub description: Option<String>,
    pub r#type: Option<String>,
    pub rules: Option<String>,
    pub default_discount_percentage: Option<f64>,
    pub price_list_id: Option<String>,
    pub tax_class: Option<String>,
    pub allowed_payment_methods: Option<String>,
    pub min_order_amount: Option<f64>,
    pub metadata: Option<String>,
    pub sync_status: Option<String>,
}

impl UpdateCustomerGroupDTO {
    pub fn apply_to_model(self, mut group: CustomerGroup) -> CustomerGroup {
        let now = Utc::now();
        if let Some(shop_id) = self.shop_id {
            group.shop_id = shop_id;
        }
        if let Some(name) = self.name {
            group.name = name;
        }
        if let Some(code) = self.code {
            group.code = Some(code);
        }
        if let Some(description) = self.description {
            group.description = Some(description);
        }
        if let Some(group_type) = self.r#type {
            group.r#type = Some(group_type);
        }
        if let Some(rules) = self.rules {
            group.rules = Some(rules);
        }
        if let Some(default_discount_percentage) = self.default_discount_percentage {
            group.default_discount_percentage = Some(default_discount_percentage);
        }
        if let Some(price_list_id) = self.price_list_id {
            group.price_list_id = Some(price_list_id);
        }
        if let Some(tax_class) = self.tax_class {
            group.tax_class = Some(tax_class);
        }
        if let Some(allowed_payment_methods) = self.allowed_payment_methods {
            group.allowed_payment_methods = Some(allowed_payment_methods);
        }
        if let Some(min_order_amount) = self.min_order_amount {
            group.min_order_amount = Some(min_order_amount);
        }
        if let Some(metadata) = self.metadata {
            group.metadata = Some(metadata);
        }
        if let Some(sync_status) = self.sync_status {
            group.sync_status = Some(sync_status);
        }
        group.updated_at = Some(now);
        group
    }
}
