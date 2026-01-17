use crate::features::customer_group_membership::dtos::customer_group_membership_dto::AssignCustomerGroupsDTO;
use crate::features::customer::models::customer_model::CustomerGroupMembership;
use crate::features::customer_group_membership::repositories::customer_group_memberships_repository::CustomerGroupMembershipsRepository;
use sqlx::SqlitePool;

pub struct CustomerGroupMembershipService {
    repo: CustomerGroupMembershipsRepository,
}

impl CustomerGroupMembershipService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CustomerGroupMembershipsRepository::new(pool);
        Self { repo }
    }

    pub async fn assign_groups(
        &self,
        payload: AssignCustomerGroupsDTO,
    ) -> Result<Vec<CustomerGroupMembership>, String> {
        let customer_id = payload.customer_id.clone();
        let memberships = payload.into_models();

        self.repo
            .delete_by_customer_id(&customer_id)
            .await
            .map_err(|e| format!("Failed to clear customer group memberships: {}", e))?;

        if memberships.is_empty() {
            return Ok(Vec::new());
        }

        self.repo
            .create_many(memberships)
            .await
            .map_err(|e| format!("Failed to assign customer groups: {}", e))
    }

    pub async fn list_by_customer(
        &self,
        customer_id: &str,
    ) -> Result<Vec<CustomerGroupMembership>, String> {
        self.repo
            .find_by_customer_id(customer_id)
            .await
            .map_err(|e| format!("Failed to list memberships by customer: {}", e))
    }

    pub async fn list_by_group(
        &self,
        group_id: &str,
    ) -> Result<Vec<CustomerGroupMembership>, String> {
        self.repo
            .find_by_group_id(group_id)
            .await
            .map_err(|e| format!("Failed to list memberships by group: {}", e))
    }

    pub async fn delete_membership(
        &self,
        customer_id: &str,
        group_id: &str,
    ) -> Result<(), String> {
        self.repo
            .delete(customer_id, group_id)
            .await
            .map_err(|e| format!("Failed to delete group membership: {}", e))
    }
}
