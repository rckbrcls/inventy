use crate::features::customer::dtos::customer_dto::{CreateCustomerDTO, UpdateCustomerDTO};
use crate::features::customer::models::customer_model::Customer;
use crate::features::customer::repositories::customer_repository::CustomerRepository;
use crate::features::customer_address::repositories::customer_addresses_repository::CustomerAddressesRepository;
use crate::features::customer_group_membership::repositories::customer_group_memberships_repository::CustomerGroupMembershipsRepository;
use sqlx::SqlitePool;

pub struct CustomerService {
    repo: CustomerRepository,
    addresses_repo: CustomerAddressesRepository,
    memberships_repo: CustomerGroupMembershipsRepository,
}

impl CustomerService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CustomerRepository::new(pool.clone());
        let addresses_repo = CustomerAddressesRepository::new(pool.clone());
        let memberships_repo = CustomerGroupMembershipsRepository::new(pool);
        Self {
            repo,
            addresses_repo,
            memberships_repo,
        }
    }

    pub async fn create_customer(&self, payload: CreateCustomerDTO) -> Result<Customer, String> {
        let (customer, addresses, memberships) = payload.into_models();
        let created_customer = self
            .repo
            .create(customer)
            .await
            .map_err(|e| format!("Failed to create customer: {}", e))?;

        if !addresses.is_empty() {
            self.addresses_repo
                .create_many(addresses)
                .await
                .map_err(|e| format!("Failed to create addresses: {}", e))?;
        }

        if !memberships.is_empty() {
            self.memberships_repo
                .create_many(memberships)
                .await
                .map_err(|e| format!("Failed to create memberships: {}", e))?;
        }

        Ok(created_customer)
    }

    pub async fn update_customer(&self, payload: UpdateCustomerDTO) -> Result<Customer, String> {
        let customer = payload.into_models();
        self.repo
            .update(customer)
            .await
            .map_err(|e| format!("Failed to update customer: {}", e))
    }

    pub async fn delete_customer(&self, id: &str) -> Result<(), String> {
        self.addresses_repo
            .delete_by_customer_id(id)
            .await
            .map_err(|e| format!("Failed to delete addresses: {}", e))?;
        self.memberships_repo
            .delete_by_customer_id(id)
            .await
            .map_err(|e| format!("Failed to delete memberships: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete customer: {}", e))
    }

    pub async fn get_customer(&self, id: &str) -> Result<Option<Customer>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch customer: {}", e))
    }

    pub async fn list_customers(&self) -> Result<Vec<Customer>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list customers: {}", e))
    }

    pub async fn list_customers_by_shop(&self, shop_id: &str) -> Result<Vec<Customer>, String> {
        self.repo
            .list_by_shop(shop_id)
            .await
            .map_err(|e| format!("Failed to list customers by shop: {}", e))
    }
}
