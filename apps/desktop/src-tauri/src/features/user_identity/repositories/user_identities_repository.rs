use crate::features::user::models::user_model::UserIdentity;
use sqlx::{Result, Sqlite, SqlitePool, Transaction};

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

    pub async fn create_many_in_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        identities: Vec<UserIdentity>,
    ) -> Result<Vec<UserIdentity>> {
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
                .fetch_one(&mut **tx)
                .await?;

            created_identities.push(created_identity);
        }

        Ok(created_identities)
    }

    pub async fn create(&self, identity: UserIdentity) -> Result<UserIdentity> {
        let id_sql = r#"
            INSERT INTO user_identities (
                id, user_id, provider, provider_user_id, access_token,
                refresh_token, expires_at, profile_data, _status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        "#;
        sqlx::query_as::<_, UserIdentity>(id_sql)
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
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, identity: UserIdentity) -> Result<UserIdentity> {
        let sql = r#"
            UPDATE user_identities SET
                user_id = $2,
                provider = $3,
                provider_user_id = $4,
                access_token = $5,
                refresh_token = $6,
                expires_at = $7,
                profile_data = $8,
                _status = $9,
                updated_at = $10
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(identity.id)
            .bind(identity.user_id)
            .bind(identity.provider)
            .bind(identity.provider_user_id)
            .bind(identity.access_token)
            .bind(identity.refresh_token)
            .bind(identity.expires_at)
            .bind(identity.profile_data)
            .bind(identity.sync_status)
            .bind(identity.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<UserIdentity>> {
        let sql = "SELECT * FROM user_identities WHERE id = $1";
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
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

    pub async fn list_all(&self) -> Result<Vec<UserIdentity>> {
        let sql = "SELECT * FROM user_identities ORDER BY created_at DESC";
        sqlx::query_as::<_, UserIdentity>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM user_identities WHERE id = $1";
        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }
}
