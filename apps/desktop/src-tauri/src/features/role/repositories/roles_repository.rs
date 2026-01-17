use sqlx::{SqlitePool, Result};
use crate::features::role::models::role_model::Role;

pub struct RoleRepository {
    pool: SqlitePool,
}

impl RoleRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: Role) -> Result<Role> {
        let sql = r#"
            INSERT INTO roles (id, name, permissions, _status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        "#;

        sqlx::query_as::<_, Role>(sql)
            .bind(item.id)              // $1
            .bind(item.name)            // $2
            .bind(item.permissions)     // $3
            .bind(item.status_internal) // $4
            .bind(item.created_at)      // $5
            .bind(item.updated_at)      // $6
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: Role) -> Result<Role> {
        let sql = r#"
            UPDATE roles SET
                name = $2,
                permissions = $3,
                _status = $4,
                updated_at = $5
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Role>(sql)
            .bind(item.id)              // $1
            .bind(item.name)            // $2
            .bind(item.permissions)     // $3
            .bind(item.status_internal) // $4
            .bind(item.updated_at)      // $5
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Role>> {
        let sql = "SELECT * FROM roles WHERE id = $1";
        sqlx::query_as::<_, Role>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_by_name(&self, name: &str) -> Result<Option<Role>> {
        let sql = "SELECT * FROM roles WHERE name = $1";
        sqlx::query_as::<_, Role>(sql)
            .bind(name)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_all(&self) -> Result<Vec<Role>> {
        let sql = "SELECT * FROM roles ORDER BY name ASC";
        sqlx::query_as::<_, Role>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM roles WHERE id = $1";
        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
