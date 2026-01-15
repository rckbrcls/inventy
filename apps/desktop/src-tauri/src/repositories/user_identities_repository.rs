use crate::models::user_model::UserIdentity;
use sqlx::{Result, SqlitePool};

pub struct UserIdentitiesRepository {
    pool: SqlitePool,
}

impl UserIdentitiesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(&self, identities: Vec<UserIdentity>) -> Result<Vec<UserIdentity>> {
        let mut tx = self.pool.begin().await?;
        let mut created_identities = Vec::new();

        for identity in identities {
            let id_sql = r#"
                INSERT INTO user_identities (
                    id, user_id, provider, provider_user_id, access_token,
                    refresh_token, expires_at, profile_data, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            "#;
            let created_identity = sqlx::query_as::<_, UserIdentity>(id_sql)
                .bind(identity.id)
                .bind(identity.user_id)
                .bind(identity.provider)
                .bind(identity.provider_user_id)
                .bind(identity.access_token)
                .bind(identity.refresh_token)
                .bind(identity.expires_at)
                .bind(identity.profile_data)
                .bind(identity.sync_status)
                .bind(identity.created_at)
                .bind(identity.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_identities.push(created_identity);
        }

        tx.commit().await?;
        Ok(created_identities)
    }

    pub async fn delete_by_user_id(&self, user_id: &str) -> Result<()> {
        let sql = "DELETE FROM user_identities WHERE user_id = $1";
        sqlx::query(sql).bind(user_id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn find_by_user_id(&self, user_id: &str) -> Result<Vec<UserIdentity>> {
        let sql = "SELECT * FROM user_identities WHERE user_id = $1";
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }
}
