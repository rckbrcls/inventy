use crate::models::customer::{Customer, CustomerAddress, CustomerGroupMembership};
use sqlx::{SqlitePool, Result};

pub struct CustomerRepository {
    pool: SqlitePool,
}

impl CustomerRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        customer: Customer,
        addresses: Vec<CustomerAddress>,
        memberships: Vec<CustomerGroupMembership>,
    ) -> Result<Customer> {
        let mut tx = self.pool.begin().await?;

        let sql = r#"
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
        "#;

        let created_customer = sqlx::query_as::<_, Customer>(sql)
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
            .await?;

        for addr in addresses {
            let addr_sql = r#"
                INSERT INTO customer_addresses (
                    id, customer_id, type, is_default, first_name, last_name, company,
                    address1, address2, city, province_code, country_code, postal_code,
                    phone, metadata, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            "#;
            sqlx::query(addr_sql)
                .bind(&addr.id)
                .bind(&created_customer.id)
                .bind(&addr.r#type)
                .bind(&addr.is_default)
                .bind(&addr.first_name)
                .bind(&addr.last_name)
                .bind(&addr.company)
                .bind(&addr.address1)
                .bind(&addr.address2)
                .bind(&addr.city)
                .bind(&addr.province_code)
                .bind(&addr.country_code)
                .bind(&addr.postal_code)
                .bind(&addr.phone)
                .bind(&addr.metadata)
                .bind(&addr.sync_status)
                .bind(&addr.created_at)
                .bind(&addr.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        for membership in memberships {
            let mem_sql = r#"
                INSERT INTO customer_group_memberships (
                    customer_id, customer_group_id, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5)
            "#;
            sqlx::query(mem_sql)
                .bind(&created_customer.id)
                .bind(&membership.customer_group_id)
                .bind(&membership.sync_status)
                .bind(&membership.created_at)
                .bind(&membership.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;
        Ok(created_customer)
    }

    pub async fn update(&self, customer: Customer) -> Result<Customer> {
        let sql = r#"
            UPDATE customers SET
                type = $2,
                email = $3,
                phone = $4,
                first_name = $5,
                last_name = $6,
                company_name = $7,
                tax_id = $8,
                tax_id_type = $9,
                state_tax_id = $10,
                status = $11,
                currency = $12,
                language = $13,
                tags = $14,
                accepts_marketing = $15,
                customer_group_id = $16,
                total_spent = $17,
                orders_count = $18,
                last_order_at = $19,
                notes = $20,
                metadata = $21,
                custom_attributes = $22,
                _status = $23,
                updated_at = $24
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Customer>(sql)
            .bind(customer.id)
            .bind(customer.r#type)
            .bind(customer.email)
            .bind(customer.phone)
            .bind(customer.first_name)
            .bind(customer.last_name)
            .bind(customer.company_name)
            .bind(customer.tax_id)
            .bind(customer.tax_id_type)
            .bind(customer.state_tax_id)
            .bind(customer.status)
            .bind(customer.currency)
            .bind(customer.language)
            .bind(customer.tags)
            .bind(customer.accepts_marketing)
            .bind(customer.customer_group_id)
            .bind(customer.total_spent)
            .bind(customer.orders_count)
            .bind(customer.last_order_at)
            .bind(customer.notes)
            .bind(customer.metadata)
            .bind(customer.custom_attributes)
            .bind(customer.sync_status)
            .bind(customer.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        sqlx::query("DELETE FROM customer_addresses WHERE customer_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM customer_group_memberships WHERE customer_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM customers WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Customer>> {
        let sql = "SELECT * FROM customers WHERE id = $1";
        sqlx::query_as::<_, Customer>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_addresses(&self, customer_id: &str) -> Result<Vec<CustomerAddress>> {
        let sql = "SELECT * FROM customer_addresses WHERE customer_id = $1";
        sqlx::query_as::<_, CustomerAddress>(sql)
            .bind(customer_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Customer>> {
        let sql = "SELECT * FROM customers ORDER BY created_at DESC";
        sqlx::query_as::<_, Customer>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn search(&self, query_str: &str) -> Result<Vec<Customer>> {
        let sql = r#"
            SELECT * FROM customers
            WHERE first_name LIKE $1
               OR last_name LIKE $1
               OR email LIKE $1
               OR company_name LIKE $1
        "#;
        let search_pattern = format!("%{}%", query_str);
        sqlx::query_as::<_, Customer>(sql)
            .bind(search_pattern)
            .fetch_all(&self.pool)
            .await
    }
}
