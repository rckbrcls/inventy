use crate::features::customer::models::customer_model::CustomerGroupMembership;
use chrono::Utc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AssignCustomerGroupsDTO {
    pub customer_id: String,
    pub group_ids: Vec<String>,
}

impl AssignCustomerGroupsDTO {
    pub fn into_models(self) -> Vec<CustomerGroupMembership> {
        let now = Utc::now();
        self.group_ids
            .into_iter()
            .map(|group_id| CustomerGroupMembership {
                customer_id: self.customer_id.clone(),
                customer_group_id: group_id,
                sync_status: "created".to_string(),
                created_at: now,
                updated_at: now,
            })
            .collect()
    }
}
