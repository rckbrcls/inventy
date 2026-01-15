use crate::models::customer_model::CustomerAddress;
use sqlx::{Result, SqlitePool};

pub struct CustomerAddressesRepository {
    pool: SqlitePool,
}

impl CustomerAddressesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(
        &self,
        addresses: Vec<CustomerAddress>,
    ) -> Result<Vec<CustomerAddress>> {
        let mut tx = self.pool.begin().await?;
        let mut created_addresses = Vec::new();

        for addr in addresses {
            let addr_sql = r#"
                INSERT INTO customer_addresses (
                    id, customer_id, type, is_default, first_name, last_name, company,
                    address1, address2, city, province_code, country_code, postal_code,
                    phone, metadata, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                RETURNING *
            "#;
            let created_addr = sqlx::query_as::<_, CustomerAddress>(addr_sql)
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
                .fetch_one(&mut *tx)
                .await?;

            created_addresses.push(created_addr);
        }

        tx.commit().await?;
        Ok(created_addresses)
    }

    pub async fn delete_by_customer_id(&self, customer_id: &str) -> Result<()> {
        let sql = "DELETE FROM customer_addresses WHERE customer_id = $1";
        sqlx::query(sql)
            .bind(customer_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_customer_id(&self, customer_id: &str) -> Result<Vec<CustomerAddress>> {
        let sql = "SELECT * FROM customer_addresses WHERE customer_id = $1";
        sqlx::query_as::<_, CustomerAddress>(sql)
            .bind(customer_id)
            .fetch_all(&self.pool)
            .await
    }
}
