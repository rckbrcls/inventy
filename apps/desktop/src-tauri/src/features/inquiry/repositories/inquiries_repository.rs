use crate::features::inquiry::models::inquiry_model::Inquiry;
use sqlx::{Result, SqlitePool};

pub struct InquiriesRepository {
    pool: SqlitePool,
}

impl InquiriesRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, inquiry: Inquiry) -> Result<Inquiry> {
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

        sqlx::query_as::<_, Inquiry>(sql)
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
            .fetch_one(&self.pool)
            .await
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
            .bind(inquiry.id) // $1
            .bind(inquiry.protocol_number) // $2
            .bind(inquiry.r#type) // $3
            .bind(inquiry.status) // $4
            .bind(inquiry.priority) // $5
            .bind(inquiry.source) // $6
            .bind(inquiry.customer_id) // $7
            .bind(inquiry.requester_data) // $8
            .bind(inquiry.department) // $9
            .bind(inquiry.assigned_staff_id) // $10
            .bind(inquiry.subject) // $11
            .bind(inquiry.related_order_id) // $12
            .bind(inquiry.related_product_id) // $13
            .bind(inquiry.metadata) // $14
            .bind(inquiry.sla_due_at) // $15
            .bind(inquiry.resolved_at) // $16
            .bind(inquiry.sync_status) // $17
            .bind(inquiry.updated_at) // $18
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM inquiries WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE id = $1";
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Inquiry>> {
        let sql = "SELECT * FROM inquiries ORDER BY created_at DESC";
        sqlx::query_as::<_, Inquiry>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Inquiry>> {
        let sql = r#"
            SELECT DISTINCT i.*
            FROM inquiries i
            LEFT JOIN orders o ON i.related_order_id = o.id
            LEFT JOIN products p ON i.related_product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE
                o.shop_id = $1
                OR c.shop_id = $1
                OR b.shop_id = $1
            ORDER BY i.created_at DESC
        "#;

        sqlx::query_as::<_, Inquiry>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Transaction-aware methods (for use in services)
    // ============================================================

    pub async fn create_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        inquiry: Inquiry,
    ) -> Result<Inquiry> {
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

        sqlx::query_as::<_, Inquiry>(sql)
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
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn get_by_id_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: &str,
    ) -> Result<Option<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE id = $1";
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(id)
            .fetch_optional(&mut **tx)
            .await
    }

    pub async fn update_status_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: &str,
        status: &str,
    ) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET status = $2, updated_at = $3 WHERE id = $1 RETURNING *
        "#;
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(id)
            .bind(status)
            .bind(chrono::Utc::now())
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn resolve_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: &str,
    ) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET
                status = 'resolved',
                resolved_at = $2,
                updated_at = $2
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(id)
            .bind(chrono::Utc::now())
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn assign_staff_with_tx(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: &str,
        staff_id: &str,
    ) -> Result<Inquiry> {
        let sql = r#"
            UPDATE inquiries SET
                assigned_staff_id = $2,
                updated_at = $3
            WHERE id = $1
            RETURNING *
        "#;
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(id)
            .bind(staff_id)
            .bind(chrono::Utc::now())
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn find_by_status(&self, status: &str) -> Result<Vec<Inquiry>> {
        let sql = "SELECT * FROM inquiries WHERE status = $1 ORDER BY created_at DESC";
        sqlx::query_as::<_, Inquiry>(sql)
            .bind(status)
            .fetch_all(&self.pool)
            .await
    }
}
