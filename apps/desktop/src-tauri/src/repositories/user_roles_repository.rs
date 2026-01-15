use crate::models::user_model::UserRole;
use sqlx::{Result, SqlitePool};

pub struct UserRolesRepository {
    pool: SqlitePool,
}

impl UserRolesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(&self, roles: Vec<UserRole>) -> Result<Vec<UserRole>> {
        let mut tx = self.pool.begin().await?;
        let mut created_roles = Vec::new();

        for role in roles {
            let role_sql = r#"
                INSERT INTO user_roles (
                    user_id, role_id, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            "#;
            let created_role = sqlx::query_as::<_, UserRole>(role_sql)
                .bind(role.user_id)
                .bind(role.role_id)
                .bind(role.sync_status)
                .bind(role.created_at)
                .bind(role.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_roles.push(created_role);
        }

        tx.commit().await?;
        Ok(created_roles)
    }

    pub async fn delete_by_user_id(&self, user_id: &str) -> Result<()> {
        let sql = "DELETE FROM user_roles WHERE user_id = $1";
        sqlx::query(sql).bind(user_id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn find_by_user_id(&self, user_id: &str) -> Result<Vec<UserRole>> {
        let sql = "SELECT * FROM user_roles WHERE user_id = $1";
        sqlx::query_as::<_, UserRole>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }
}
