use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use sqlx::{SqlitePool, Result};

pub struct CustomerGroupsRepository {
    pool: SqlitePool,
}

impl CustomerGroupsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, group: CustomerGroup) -> Result<CustomerGroup> {
        let sql = r#"
            INSERT INTO customer_groups (
                id, shop_id, name, code, description, type, rules,
                default_discount_percentage, price_list_id, tax_class,
                allowed_payment_methods, min_order_amount, metadata,
                _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, CustomerGroup>(sql)
            .bind(group.id)
            .bind(group.shop_id)
            .bind(group.name)
            .bind(group.code)
            .bind(group.description)
            .bind(group.r#type)
            .bind(group.rules)
            .bind(group.default_discount_percentage)
            .bind(group.price_list_id)
            .bind(group.tax_class)
            .bind(group.allowed_payment_methods)
            .bind(group.min_order_amount)
            .bind(group.metadata)
            .bind(group.sync_status)
            .bind(group.created_at)
            .bind(group.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, group: CustomerGroup) -> Result<CustomerGroup> {
        let sql = r#"
            UPDATE customer_groups SET
                shop_id = $2,
                name = $3,
                code = $4,
                description = $5,
                type = $6,
                rules = $7,
                default_discount_percentage = $8,
                price_list_id = $9,
                tax_class = $10,
                allowed_payment_methods = $11,
                min_order_amount = $12,
                metadata = $13,
                _status = $14,
                updated_at = $15
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, CustomerGroup>(sql)
            .bind(group.id)
            .bind(group.shop_id)
            .bind(group.name)
            .bind(group.code)
            .bind(group.description)
            .bind(group.r#type)
            .bind(group.rules)
            .bind(group.default_discount_percentage)
            .bind(group.price_list_id)
            .bind(group.tax_class)
            .bind(group.allowed_payment_methods)
            .bind(group.min_order_amount)
            .bind(group.metadata)
            .bind(group.sync_status)
            .bind(group.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM customer_groups WHERE id = $1";
        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<CustomerGroup>> {
        let sql = "SELECT * FROM customer_groups WHERE id = $1";
        sqlx::query_as::<_, CustomerGroup>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<CustomerGroup>> {
        let sql = "SELECT * FROM customer_groups ORDER BY created_at DESC";
        sqlx::query_as::<_, CustomerGroup>(sql)
            .fetch_all(&self.pool)
            .await
    }
}
