use crate::features::customer_address::dtos::customer_address_dto::{
    CreateCustomerAddressDTO,
    UpdateCustomerAddressDTO,
};
use crate::features::customer_address::repositories::customer_addresses_repository::CustomerAddressesRepository;
use crate::features::customer::models::customer_model::CustomerAddress;
use sqlx::SqlitePool;

pub struct CustomerAddressService {
    repo: CustomerAddressesRepository,
}

impl CustomerAddressService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CustomerAddressesRepository::new(pool);
        Self { repo }
    }

    pub async fn create_address(
        &self,
        payload: CreateCustomerAddressDTO,
    ) -> Result<CustomerAddress, String> {
        let address = payload.into_model();
        self.repo
            .create(address)
            .await
            .map_err(|e| format!("Failed to create customer address: {}", e))
    }

    pub async fn update_address(
        &self,
        payload: UpdateCustomerAddressDTO,
    ) -> Result<CustomerAddress, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch customer address: {}", e))?
            .ok_or_else(|| format!("Customer address not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update customer address: {}", e))
    }

    pub async fn delete_address(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete customer address: {}", e))
    }

    pub async fn get_address(&self, id: &str) -> Result<Option<CustomerAddress>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch customer address: {}", e))
    }

    pub async fn list_addresses(&self) -> Result<Vec<CustomerAddress>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list customer addresses: {}", e))
    }

    pub async fn list_by_customer(
        &self,
        customer_id: &str,
    ) -> Result<Vec<CustomerAddress>, String> {
        self.repo
            .find_by_customer_id(customer_id)
            .await
            .map_err(|e| format!("Failed to list addresses by customer: {}", e))
    }
}
