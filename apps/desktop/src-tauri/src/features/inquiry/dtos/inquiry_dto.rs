use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use crate::features::inquiry::models::inquiry_model::{Inquiry, InquiryMessage};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInquiryDTO {
    pub r#type: Option<String>,
    pub priority: Option<String>,
    pub source: Option<String>,
    pub customer_id: Option<String>,
    pub requester_data: String,
    pub department: Option<String>,
    pub subject: Option<String>,
    pub related_order_id: Option<String>,
    pub related_product_id: Option<String>,
    pub metadata: Option<String>,
    pub first_message: String,
}

impl CreateInquiryDTO {
    pub fn into_models(self) -> (Inquiry, Vec<InquiryMessage>) {
        let inquiry_id = Uuid::new_v4().to_string();
        let protocol_number = format!("INQ-{}", &Uuid::new_v4().to_string()[..8].to_uppercase());
        let now = Utc::now();

        let inquiry = Inquiry {
            id: inquiry_id.clone(),
            protocol_number,
            r#type: self.r#type,
            status: Some("open".to_string()),
            priority: self.priority.or(Some("medium".to_string())),
            source: self.source.or(Some("manual".to_string())),
            customer_id: self.customer_id,
            requester_data: self.requester_data,
            department: self.department,
            assigned_staff_id: None,
            subject: self.subject,
            related_order_id: self.related_order_id,
            related_product_id: self.related_product_id,
            metadata: self.metadata,
            sla_due_at: None,
            resolved_at: None,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        };

        let message = InquiryMessage {
            id: Uuid::new_v4().to_string(),
            inquiry_id: inquiry_id.clone(),
            sender_type: "customer".to_string(),
            sender_id: None,
            body: Some(self.first_message),
            is_internal_note: Some(false),
            attachments: None,
            external_id: None,
            read_at: None,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        };

        (inquiry, vec![message])
    }
}
