use sqlx::{SqlitePool, Result};
use crate::models::user::{User, UserIdentity, UserSession, UserRole};

pub struct UserRepository {
    pool: SqlitePool,
}

impl UserRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        user: User,
        identities: Vec<UserIdentity>,
        roles: Vec<UserRole>,
    ) -> Result<User> {
        let mut tx = self.pool.begin().await?;

        let sql = r#"
            INSERT INTO users (
                id, email, phone, password_hash, security_stamp, is_email_verified,
                is_phone_verified, failed_login_attempts, lockout_end_at, mfa_enabled,
                mfa_secret, mfa_backup_codes, last_login_at, last_login_ip, _status,
                created_at, updated_at, profile_type, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *
        "#;

        let created_user = sqlx::query_as::<_, User>(sql)
            .bind(&user.id)
            .bind(&user.email)
            .bind(&user.phone)
            .bind(&user.password_hash)
            .bind(&user.security_stamp)
            .bind(&user.is_email_verified)
            .bind(&user.is_phone_verified)
            .bind(&user.failed_login_attempts)
            .bind(&user.lockout_end_at)
            .bind(&user.mfa_enabled)
            .bind(&user.mfa_secret)
            .bind(&user.mfa_backup_codes)
            .bind(&user.last_login_at)
            .bind(&user.last_login_ip)
            .bind(&user.status_internal)
            .bind(&user.created_at)
            .bind(&user.updated_at)
            .bind(&user.profile_type)
            .bind(&user.status)
            .fetch_one(&mut *tx)
            .await?;

        for identity in identities {
            let id_sql = r#"
                INSERT INTO user_identities (
                    id, user_id, provider, provider_user_id, access_token,
                    refresh_token, expires_at, profile_data, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#;
            sqlx::query(id_sql)
                .bind(&identity.id)
                .bind(&created_user.id)
                .bind(&identity.provider)
                .bind(&identity.provider_user_id)
                .bind(&identity.access_token)
                .bind(&identity.refresh_token)
                .bind(&identity.expires_at)
                .bind(&identity.profile_data)
                .bind(&identity.sync_status)
                .bind(&identity.created_at)
                .bind(&identity.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        for role in roles {
            let role_sql = r#"
                INSERT INTO user_roles (
                    user_id, role_id, _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5)
            "#;
            sqlx::query(role_sql)
                .bind(&created_user.id)
                .bind(&role.role_id)
                .bind(&role.sync_status)
                .bind(&role.created_at)
                .bind(&role.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;
        Ok(created_user)
    }

    pub async fn update(&self, user: User) -> Result<User> {
        let sql = r#"
            UPDATE users SET
                email = $2,
                phone = $3,
                password_hash = $4,
                security_stamp = $5,
                is_email_verified = $6,
                is_phone_verified = $7,
                failed_login_attempts = $8,
                lockout_end_at = $9,
                mfa_enabled = $10,
                mfa_secret = $11,
                mfa_backup_codes = $12,
                last_login_at = $13,
                last_login_ip = $14,
                _status = $15,
                updated_at = $16,
                profile_type = $17,
                status = $18
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, User>(sql)
            .bind(user.id)
            .bind(user.email)
            .bind(user.phone)
            .bind(user.password_hash)
            .bind(user.security_stamp)
            .bind(user.is_email_verified)
            .bind(user.is_phone_verified)
            .bind(user.failed_login_attempts)
            .bind(user.lockout_end_at)
            .bind(user.mfa_enabled)
            .bind(user.mfa_secret)
            .bind(user.mfa_backup_codes)
            .bind(user.last_login_at)
            .bind(user.last_login_ip)
            .bind(user.status_internal)
            .bind(user.updated_at)
            .bind(user.profile_type)
            .bind(user.status)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        sqlx::query("DELETE FROM user_identities WHERE user_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM user_roles WHERE user_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM user_sessions WHERE user_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<User>> {
        let sql = "SELECT * FROM users WHERE id = $1";
        sqlx::query_as::<_, User>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_identities(&self, user_id: &str) -> Result<Vec<UserIdentity>> {
        let sql = "SELECT * FROM user_identities WHERE user_id = $1";
        sqlx::query_as::<_, UserIdentity>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_sessions(&self, user_id: &str) -> Result<Vec<UserSession>> {
        let sql = "SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY last_active_at DESC";
        sqlx::query_as::<_, UserSession>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_roles(&self, user_id: &str) -> Result<Vec<UserRole>> {
        let sql = "SELECT * FROM user_roles WHERE user_id = $1";
        sqlx::query_as::<_, UserRole>(sql)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<User>> {
        let sql = "SELECT * FROM users ORDER BY created_at DESC";
        sqlx::query_as::<_, User>(sql)
            .fetch_all(&self.pool)
            .await
    }
}
