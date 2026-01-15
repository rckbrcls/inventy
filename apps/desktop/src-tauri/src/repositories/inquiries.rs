use crate::models::inquiry::{Inquiry, InquiryMessage};
use sqlx::{SqlitePool, Result};

pub struct InquiriesRepository {
    pool: SqlitePool,
}

impl InquiriesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, inquiry: Inquiry, messages: Vec<InquiryMessage>) -> Result<Inquiry> {
        let mut tx = self.pool.begin().await?;

        let sql = r#"
            INSERT INTO inquiries (
                id, protocol_number, type, status, priority, source,
                customer_id, requester_data, department, assigned_staff_id,
                subject, related_order_id, related_product_id, metadata,
                sla_due_at, resolved_at, _status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *
        "#;

        let created_inquiry = sqlx::query_as::<_, Inquiry>(sql)
            .bind(&inquiry.id)
            .bind(&inquiry.protocol_number)
            .bind(&inquiry.r#type)
            .bind(&inquiry.status)
            .bind(&inquiry.priority)
            .bind(&inquiry.source)
            .bind(&inquiry.customer_id)
            .bind(&inquiry.requester_data)
            .bind(&inquiry.department)
            .bind(&inquiry.assigned_staff_id)
            .bind(&inquiry.subject)
            .bind(&inquiry.related_order_id)
            .bind(&inquiry.related_product_id)
            .bind(&inquiry.metadata)
            .bind(&inquiry.sla_due_at)
            .bind(&inquiry.resolved_at)
            .bind(&inquiry.sync_status)
            .bind(&inquiry.created_at)
            .bind(&inquiry.updated_at)
            .fetch_one(&mut *tx)
            .await?;

        for msg in messages {
            let msg_sql = r#"
                INSERT INTO inquiry_messages (
                    id, inquiry_id, sender_type, sender_id, body,
                    is_internal_note, attachments, external_id, read_at,
                    _status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            "#;
            sqlx::query(msg_sql)
                .bind(&msg.id)
                .bind(&created_inquiry.id)
                .bind(&msg.sender_type)
                .bind(&msg.sender_id)
                .bind(&msg.body)
                .bind(&msg.is_internal_note)
                .bind(&msg.attachments)
                .bind(&msg.external_id)
                .bind(&msg.read_at)
                .bind(&msg.sync_status)
                .bind(&msg.created_at)
                .bind(&msg.updated_at)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;
        Ok(created_inquiry)
    }

    pub async fn update(&self, inquiry: Inquiry) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET
                protocol_number = $2,
                type = $3,
                status = $4,
                priority = $5,
                source = $6,
                customer_id = $7,
                requester_data = $8,
                department = $9,
                assigned_staff_id = $10,
                subject = $11,
                related_order_id = $12,
                related_product_id = $13,
                metadata = $14,
                sla_due_at = $15,
                resolved_at = $16,
                _status = $17,
                updated_at = $18
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Inquiry>(sql)
            .bind(inquiry.id)                  // $1
            .bind(inquiry.protocol_number)     // $2
            .bind(inquiry.r#type)              // $3
            .bind(inquiry.status)              // $4
            .bind(inquiry.priority)            // $5
            .bind(inquiry.source)              // $6
            .bind(inquiry.customer_id)         // $7
            .bind(inquiry.requester_data)      // $8
            .bind(inquiry.department)          // $9
            .bind(inquiry.assigned_staff_id)   // $10
            .bind(inquiry.subject)             // $11
            .bind(inquiry.related_order_id)    // $12
            .bind(inquiry.related_product_id)  // $13
            .bind(inquiry.metadata)            // $14
            .bind(inquiry.sla_due_at)          // $15
            .bind(inquiry.resolved_at)         // $16
            .bind(inquiry.sync_status)         // $17
            .bind(inquiry.updated_at)          // $18
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        sqlx::query("DELETE FROM inquiry_messages WHERE inquiry_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("DELETE FROM inquiries WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE id = $1";
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn get_messages(&self, inquiry_id: &str) -> Result<Vec<InquiryMessage>> {
        let sql = "SELECT * FROM inquiry_messages WHERE inquiry_id = $1 ORDER BY created_at ASC";
        sqlx::query_as::<_, InquiryMessage>(sql)
            .bind(inquiry_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Inquiry>> {
        let sql = "SELECT * FROM inquiries ORDER BY created_at DESC";
        sqlx::query_as::<_, Inquiry>(sql)
            .fetch_all(&self.pool)
            .await
    }
}
