use crate::models::user_model::UserSession;
use sqlx::{Result, SqlitePool};

pub struct UserSessionsRepository {
    pool: SqlitePool,
}

impl UserSessionsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn delete_by_user_id(&self, user_id: &str) -> Result<()> {
        let sql = "DELETE FROM user_sessions WHERE user_id = $1";
        sqlx::query(sql).bind(user_id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn find_by_user_id(&self, user_id: &str) -> Result<Vec<UserSession>> {
        let sql = "SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY last_active_at DESC";
        sqlx::query_as::<_, UserSession>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }
}
