use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditLogFilterDTO {
    pub table_name: Option<String>,
    pub record_id: Option<String>,
    pub action: Option<String>,
    pub page: Option<u32>,
    pub per_page: Option<u32>,
}
