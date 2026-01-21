use crate::features::customer::models::customer_model::CustomerAddress;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCustomerAddressDTO {
    pub customer_id: String,
    pub r#type: Option<String>,
    pub is_default: Option<bool>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company: Option<String>,
    pub address1: Option<String>,
    pub address2: Option<String>,
    pub city: Option<String>,
    pub province_code: Option<String>,
    pub country_code: Option<String>,
    pub postal_code: Option<String>,
    pub phone: Option<String>,
    pub metadata: Option<String>,
}

impl CreateCustomerAddressDTO {
    pub fn into_model(self) -> CustomerAddress {
        let now = Utc::now();
        CustomerAddress {
            id: Uuid::new_v4().to_string(),
            customer_id: self.customer_id,
            r#type: self.r#type,
            is_default: self.is_default.or(Some(false)),
            first_name: self.first_name,
            last_name: self.last_name,
            company: self.company,
            address1: self.address1,
            address2: self.address2,
            city: self.city,
            province_code: self.province_code,
            country_code: self.country_code,
            postal_code: self.postal_code,
            phone: self.phone,
            metadata: self.metadata,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCustomerAddressDTO {
    pub id: String,
    pub customer_id: Option<String>,
    pub r#type: Option<String>,
    pub is_default: Option<bool>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company: Option<String>,
    pub address1: Option<String>,
    pub address2: Option<String>,
    pub city: Option<String>,
    pub province_code: Option<String>,
    pub country_code: Option<String>,
    pub postal_code: Option<String>,
    pub phone: Option<String>,
    pub metadata: Option<String>,
    pub sync_status: Option<String>,
}

impl UpdateCustomerAddressDTO {
    pub fn apply_to_model(self, mut address: CustomerAddress) -> CustomerAddress {
        let now = Utc::now();
        if let Some(customer_id) = self.customer_id {
            address.customer_id = customer_id;
        }
        if let Some(address_type) = self.r#type {
            address.r#type = Some(address_type);
        }
        if let Some(is_default) = self.is_default {
            address.is_default = Some(is_default);
        }
        if let Some(first_name) = self.first_name {
            address.first_name = Some(first_name);
        }
        if let Some(last_name) = self.last_name {
            address.last_name = Some(last_name);
        }
        if let Some(company) = self.company {
            address.company = Some(company);
        }
        if let Some(address1) = self.address1 {
            address.address1 = Some(address1);
        }
        if let Some(address2) = self.address2 {
            address.address2 = Some(address2);
        }
        if let Some(city) = self.city {
            address.city = Some(city);
        }
        if let Some(province_code) = self.province_code {
            address.province_code = Some(province_code);
        }
        if let Some(country_code) = self.country_code {
            address.country_code = Some(country_code);
        }
        if let Some(postal_code) = self.postal_code {
            address.postal_code = Some(postal_code);
        }
        if let Some(phone) = self.phone {
            address.phone = Some(phone);
        }
        if let Some(metadata) = self.metadata {
            address.metadata = Some(metadata);
        }
        if let Some(sync_status) = self.sync_status {
            address.sync_status = Some(sync_status);
        }
        address.updated_at = Some(now);
        address
    }
}
