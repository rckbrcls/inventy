use crate::features::customer::dtos::customer_dto::{CreateCustomerDTO, UpdateCustomerDTO};
use crate::features::customer::models::customer_model::Customer;
use crate::features::customer::repositories::customer_repository::CustomerRepository;
use crate::features::customer_address::repositories::customer_addresses_repository::CustomerAddressesRepository;
use crate::features::customer_group_membership::repositories::customer_group_memberships_repository::CustomerGroupMembershipsRepository;
use sqlx::SqlitePool;

pub struct CustomerService {
    pool: SqlitePool,
    repo: CustomerRepository,
    addresses_repo: CustomerAddressesRepository,
    memberships_repo: CustomerGroupMembershipsRepository,
}

impl CustomerService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CustomerRepository::new(pool.clone());
        let addresses_repo = CustomerAddressesRepository::new(pool.clone());
        let memberships_repo = CustomerGroupMembershipsRepository::new(pool.clone());
        Self {
            pool,
            repo,
            addresses_repo,
            memberships_repo,
        }
    }

    pub async fn create_customer(&self, payload: CreateCustomerDTO) -> Result<Customer, String> {
        let (customer, addresses, memberships) = payload.into_models();
        
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        // Create customer
        let created_customer = sqlx::query_as::<_, Customer>(r#"
            INSERT INTO customers (
                id, type, email, phone, first_name, last_name, company_name,
                tax_id, tax_id_type, state_tax_id, status, currency, language,
                tags, accepts_marketing, customer_group_id, total_spent,
                orders_count, last_order_at, notes, metadata, custom_attributes,
                _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21, $22,
                $23, $24, $25
            )
            RETURNING *
        "#)
            .bind(&customer.id)
            .bind(&customer.r#type)
            .bind(&customer.email)
            .bind(&customer.phone)
            .bind(&customer.first_name)
            .bind(&customer.last_name)
            .bind(&customer.company_name)
            .bind(&customer.tax_id)
            .bind(&customer.tax_id_type)
            .bind(&customer.state_tax_id)
            .bind(&customer.status)
            .bind(&customer.currency)
            .bind(&customer.language)
            .bind(&customer.tags)
            .bind(&customer.accepts_marketing)
            .bind(&customer.customer_group_id)
            .bind(&customer.total_spent)
            .bind(&customer.orders_count)
            .bind(&customer.last_order_at)
            .bind(&customer.notes)
            .bind(&customer.metadata)
            .bind(&customer.custom_attributes)
            .bind(&customer.sync_status)
            .bind(&customer.created_at)
            .bind(&customer.updated_at)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| format!("Failed to create customer: {}", e))?;

        // Create addresses if any
        if !addresses.is_empty() {
            for addr in addresses {
                sqlx::query(r#"
                    INSERT INTO customer_addresses (
                        id, customer_id, type, is_default, first_name, last_name, company,
                        address1, address2, city, province_code, country_code, postal_code,
                        phone, metadata, _status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                "#)
                    .bind(addr.id)
                    .bind(addr.customer_id)
                    .bind(addr.r#type)
                    .bind(addr.is_default)
                    .bind(addr.first_name)
                    .bind(addr.last_name)
                    .bind(addr.company)
                    .bind(addr.address1)
                    .bind(addr.address2)
                    .bind(addr.city)
                    .bind(addr.province_code)
                    .bind(addr.country_code)
                    .bind(addr.postal_code)
                    .bind(addr.phone)
                    .bind(addr.metadata)
                    .bind(addr.sync_status)
                    .bind(addr.created_at)
                    .bind(addr.updated_at)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| format!("Failed to create addresses: {}", e))?;
            }
        }

        // Create memberships if any
        if !memberships.is_empty() {
            self.memberships_repo
                .create_many_in_tx(&mut tx, memberships)
                .await
                .map_err(|e| format!("Failed to create memberships: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

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
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        // Delete addresses
        sqlx::query("DELETE FROM customer_addresses WHERE customer_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to delete addresses: {}", e))?;

        // Delete memberships
        sqlx::query("DELETE FROM customer_group_memberships WHERE customer_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to delete memberships: {}", e))?;

        // Delete customer
        sqlx::query("DELETE FROM customers WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to delete customer: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(())
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
