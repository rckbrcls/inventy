use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Location {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    #[sqlx(rename = "type")]
    pub type_: String, // warehouse, store, transit, virtual
    pub is_sellable: bool,
    pub address_data: Option<String>, // JSONB stored as TEXT
}
