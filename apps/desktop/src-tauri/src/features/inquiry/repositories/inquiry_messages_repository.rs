use crate::features::inquiry::models::inquiry_model::InquiryMessage;
use sqlx::{Result, SqlitePool};

pub struct InquiryMessagesRepository {
    pool: SqlitePool,
}

impl InquiryMessagesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_many(&self, messages: Vec<InquiryMessage>) -> Result<Vec<InquiryMessage>> {
        let mut tx = self.pool.begin().await?;
        let mut created_messages = Vec::new();

        for msg in messages {
            let msg_sql = r#"
                INSERT INTO inquiry_messages (
                    id, inquiry_id, sender_type, sender_id, body,
                    is_internal_note, attachments, external_id, read_at,
                    _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            "#;
            let created_msg = sqlx::query_as::<_, InquiryMessage>(msg_sql)
                .bind(msg.id)
                .bind(msg.inquiry_id)
                .bind(msg.sender_type)
                .bind(msg.sender_id)
                .bind(msg.body)
                .bind(msg.is_internal_note)
                .bind(msg.attachments)
                .bind(msg.external_id)
                .bind(msg.read_at)
                .bind(msg.sync_status)
                .bind(msg.created_at)
                .bind(msg.updated_at)
                .fetch_one(&mut *tx)
                .await?;

            created_messages.push(created_msg);
        }

        tx.commit().await?;
        Ok(created_messages)
    }

    pub async fn delete_by_inquiry_id(&self, inquiry_id: &str) -> Result<()> {
        let sql = "DELETE FROM inquiry_messages WHERE inquiry_id = $1";
        sqlx::query(sql)
            .bind(inquiry_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_by_inquiry_id(&self, inquiry_id: &str) -> Result<Vec<InquiryMessage>> {
        let sql = "SELECT * FROM inquiry_messages WHERE inquiry_id = $1 ORDER BY created_at ASC";
        sqlx::query_as::<_, InquiryMessage>(sql)
            .bind(inquiry_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods (for use in services)
    // ============================================================

    pub async fn create_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        message: InquiryMessage,
    ) -> Result<InquiryMessage> {
        let msg_sql = r#"
            INSERT INTO inquiry_messages (
                id, inquiry_id, sender_type, sender_id, body,
                is_internal_note, attachments, external_id, read_at,
                _status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        "#;
        sqlx::query_as::<_, InquiryMessage>(msg_sql)
            .bind(&message.id)
            .bind(&message.inquiry_id)
            .bind(&message.sender_type)
            .bind(&message.sender_id)
            .bind(&message.body)
            .bind(&message.is_internal_note)
            .bind(&message.attachments)
            .bind(&message.external_id)
            .bind(&message.read_at)
            .bind(&message.sync_status)
            .bind(&message.created_at)
            .bind(&message.updated_at)
            .fetch_one(&mut **tx)
            .await
    }
}
