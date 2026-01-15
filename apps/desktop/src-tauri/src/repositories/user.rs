use sqlx::{SqlitePool, Result};
use crate::models::user::User;

pub struct UserRepository {
    pool: SqlitePool,
}

impl UserRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, user: User) -> Result<User> {
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
            .bind(user.created_at)
            .bind(user.updated_at)
            .bind(user.profile_type)
            .bind(user.status)
            .fetch_one(&self.pool)
            .await
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

    pub async fn get_by_id(&self, id: &str) -> Result<Option<User>> {
        let sql = "SELECT * FROM users WHERE id = $1";
        sqlx::query_as::<_, User>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }
}
