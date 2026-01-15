use crate::models::customer_model::CustomerGroupMembership;
use sqlx::{Result, SqlitePool};

pub struct CustomerGroupMembershipsRepository {
    pool: SqlitePool,
}

impl CustomerGroupMembershipsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(
        &self,
        memberships: Vec<CustomerGroupMembership>,
    ) -> Result<Vec<CustomerGroupMembership>> {
        let mut tx = self.pool.begin().await?;
        let mut created_memberships = Vec::new();

        for membership in memberships {
            let mem_sql = r#"
                INSERT INTO customer_group_memberships (
                    customer_id, customer_group_id, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            "#;
            let created_mem = sqlx::query_as::<_, CustomerGroupMembership>(mem_sql)
                .bind(membership.customer_id)
                .bind(membership.customer_group_id)
                .bind(membership.sync_status)
                .bind(membership.created_at)
                .bind(membership.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_memberships.push(created_mem);
        }

        tx.commit().await?;
        Ok(created_memberships)
    }

    pub async fn delete_by_customer_id(&self, customer_id: &str) -> Result<()> {
        let sql = "DELETE FROM customer_group_memberships WHERE customer_id = $1";
        sqlx::query(sql)
            .bind(customer_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_customer_id(
        &self,
        customer_id: &str,
    ) -> Result<Vec<CustomerGroupMembership>> {
        let sql = "SELECT * FROM customer_group_memberships WHERE customer_id = $1";
        sqlx::query_as::<_, CustomerGroupMembership>(sql)
            .bind(customer_id)
            .fetch_all(&self.pool)
            .await
    }
}
