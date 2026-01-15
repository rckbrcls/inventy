use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use crate::models::customer::{Customer, CustomerAddress, CustomerGroupMembership};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCustomerAddressDTO {
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

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCustomerDTO {
    pub r#type: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company_name: Option<String>,
    pub tax_id: Option<String>,
    pub tax_id_type: Option<String>,
    pub state_tax_id: Option<String>,
    pub status: Option<String>,
    pub currency: Option<String>,
    pub language: Option<String>,
    pub tags: Option<String>,
    pub accepts_marketing: Option<bool>,
    pub customer_group_id: Option<String>,
    pub notes: Option<String>,
    pub metadata: Option<String>,
    pub custom_attributes: Option<String>,
    pub addresses: Vec<CreateCustomerAddressDTO>,
    pub group_ids: Vec<String>,
}

impl CreateCustomerDTO {
    pub fn into_models(self) -> (Customer, Vec<CustomerAddress>, Vec<CustomerGroupMembership>) {
        let customer_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let customer = Customer {
            id: customer_id.clone(),
            r#type: self.r#type,
            email: self.email,
            phone: self.phone,
            first_name: self.first_name,
            last_name: self.last_name,
            company_name: self.company_name,
            tax_id: self.tax_id,
            tax_id_type: self.tax_id_type,
            state_tax_id: self.state_tax_id,
            status: self.status.or(Some("active".to_string())),
            currency: self.currency.or(Some("BRL".to_string())),
            language: self.language.or(Some("pt".to_string())),
            tags: self.tags,
            accepts_marketing: self.accepts_marketing,
            customer_group_id: self.customer_group_id,
            total_spent: Some(0.0),
            orders_count: Some(0),
            last_order_at: None,
            notes: self.notes,
            metadata: self.metadata,
            custom_attributes: self.custom_attributes,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        };

        let addresses = self.addresses
            .into_iter()
            .map(|a| CustomerAddress {
                id: Uuid::new_v4().to_string(),
                customer_id: customer_id.clone(),
                r#type: a.r#type,
                is_default: a.is_default,
                first_name: a.first_name,
                last_name: a.last_name,
                company: a.company,
                address1: a.address1,
                address2: a.address2,
                city: a.city,
                province_code: a.province_code,
                country_code: a.country_code,
                postal_code: a.postal_code,
                phone: a.phone,
                metadata: a.metadata,
                sync_status: Some("created".to_string()),
                created_at: Some(now),
                updated_at: Some(now),
            })
            .collect();

        let group_memberships = self.group_ids
            .into_iter()
            .map(|gid| CustomerGroupMembership {
                customer_id: customer_id.clone(),
                customer_group_id: gid,
                sync_status: "created".to_string(),
                created_at: now,
                updated_at: now,
            })
            .collect();

        (customer, addresses, group_memberships)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCustomerDTO {
    pub id: String,
    pub r#type: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub company_name: Option<String>,
    pub tax_id: Option<String>,
    pub tax_id_type: Option<String>,
    pub state_tax_id: Option<String>,
    pub status: Option<String>,
    pub currency: Option<String>,
    pub language: Option<String>,
    pub tags: Option<String>,
    pub accepts_marketing: Option<bool>,
    pub customer_group_id: Option<String>,
    pub notes: Option<String>,
    pub metadata: Option<String>,
    pub custom_attributes: Option<String>,
}

impl UpdateCustomerDTO {
    pub fn into_models(self) -> Customer {
        let now = Utc::now();
        Customer {
            id: self.id,
            r#type: self.r#type.unwrap_or_else(|| "individual".to_string()),
            email: self.email,
            phone: self.phone,
            first_name: self.first_name,
            last_name: self.last_name,
            company_name: self.company_name,
            tax_id: self.tax_id,
            tax_id_type: self.tax_id_type,
            state_tax_id: self.state_tax_id,
            status: self.status,
            currency: self.currency,
            language: self.language,
            tags: self.tags,
            accepts_marketing: self.accepts_marketing,
            customer_group_id: self.customer_group_id,
            total_spent: None,
            orders_count: None,
            last_order_at: None,
            notes: self.notes,
            metadata: self.metadata,
            custom_attributes: self.custom_attributes,
            sync_status: Some("updated".to_string()),
            created_at: None,
            updated_at: Some(now),
        }
    }
}
