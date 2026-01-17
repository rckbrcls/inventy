use crate::features::user::models::user_model::UserSession;
use sqlx::{Result, SqlitePool};

pub struct UserSessionsRepository {
    pool: SqlitePool,
}

impl UserSessionsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, session: UserSession) -> Result<UserSession> {
        let sql = r#"
            INSERT INTO user_sessions (
                id, user_id, user_agent, ip_address, device_type, location,
                token_hash, expires_at, revoked_at, _status, created_at, updated_at, last_active_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        "#;
        sqlx::query_as::<_, UserSession>(sql)
            .bind(session.id)
            .bind(session.user_id)
            .bind(session.user_agent)
            .bind(session.ip_address)
            .bind(session.device_type)
            .bind(session.location)
            .bind(session.token_hash)
            .bind(session.expires_at)
            .bind(session.revoked_at)
            .bind(session.sync_status)
            .bind(session.created_at)
            .bind(session.updated_at)
            .bind(session.last_active_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, session: UserSession) -> Result<UserSession> {
        let sql = r#"
            UPDATE user_sessions SET
                user_id = $2,
                user_agent = $3,
                ip_address = $4,
                device_type = $5,
                location = $6,
                token_hash = $7,
                expires_at = $8,
                revoked_at = $9,
                _status = $10,
                updated_at = $11,
                last_active_at = $12
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, UserSession>(sql)
            .bind(session.id)
            .bind(session.user_id)
            .bind(session.user_agent)
            .bind(session.ip_address)
            .bind(session.device_type)
            .bind(session.location)
            .bind(session.token_hash)
            .bind(session.expires_at)
            .bind(session.revoked_at)
            .bind(session.sync_status)
            .bind(session.updated_at)
            .bind(session.last_active_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<UserSession>> {
        let sql = "SELECT * FROM user_sessions WHERE id = $1";
        sqlx::query_as::<_, UserSession>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list_all(&self) -> Result<Vec<UserSession>> {
        let sql = "SELECT * FROM user_sessions ORDER BY last_active_at DESC";
        sqlx::query_as::<_, UserSession>(sql)
            .fetch_all(&self.pool)
            .await
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

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM user_sessions WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }
}
