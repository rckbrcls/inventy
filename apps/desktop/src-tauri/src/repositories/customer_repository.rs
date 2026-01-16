use crate::db::DbTransaction;
use crate::models::customer_model::Customer;
use sqlx::{Result, SqlitePool};

pub struct CustomerRepository {
    pool: SqlitePool,
}

impl CustomerRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, customer: Customer) -> Result<Customer> {
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

        sqlx::query_as::<_, Customer>(sql)
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
            .fetch_one(&self.pool)
            .await
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
        let sql = "DELETE FROM customers WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Customer>> {
        let sql = "SELECT * FROM customers WHERE id = $1";
        sqlx::query_as::<_, Customer>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
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

    // ============================================================
    // Transaction-aware methods for atomic operations
    // ============================================================

    /// Increment customer stats after a completed sale within a transaction
    pub async fn increment_stats_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        customer_id: &str,
        amount: f64,
    ) -> Result<Customer> {
        let sql = r#"
            UPDATE customers
            SET total_spent = total_spent + $2,
                orders_count = orders_count + 1,
                last_order_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Customer>(sql)
            .bind(customer_id)
            .bind(amount)
            .fetch_one(&mut **tx)
            .await
    }

    /// Decrement customer stats after a return within a transaction
    pub async fn decrement_stats_with_tx<'a>(
        tx: &mut DbTransaction<'a>,
        customer_id: &str,
        amount: f64,
    ) -> Result<Customer> {
        let sql = r#"
            UPDATE customers
            SET total_spent = MAX(0, total_spent - $2),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Customer>(sql)
            .bind(customer_id)
            .bind(amount)
            .fetch_one(&mut **tx)
            .await
    }
}
