use crate::features::customer_group::dtos::customer_group_dto::{CreateCustomerGroupDTO, UpdateCustomerGroupDTO};
use crate::features::customer_group::models::customer_group_model::CustomerGroup;
use crate::features::customer_group_membership::repositories::customer_group_memberships_repository::CustomerGroupMembershipsRepository;
use crate::features::customer_group::repositories::customer_groups_repository::CustomerGroupsRepository;
use sqlx::SqlitePool;

pub struct CustomerGroupService {
    repo: CustomerGroupsRepository,
    memberships_repo: CustomerGroupMembershipsRepository,
}

impl CustomerGroupService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CustomerGroupsRepository::new(pool.clone());
        let memberships_repo = CustomerGroupMembershipsRepository::new(pool);
        Self {
            repo,
            memberships_repo,
        }
    }

    pub async fn create_group(
        &self,
        payload: CreateCustomerGroupDTO,
    ) -> Result<CustomerGroup, String> {
        let group = payload.into_model();
        self.repo
            .create(group)
            .await
            .map_err(|e| format!("Failed to create customer group: {}", e))
    }

    pub async fn update_group(
        &self,
        payload: UpdateCustomerGroupDTO,
    ) -> Result<CustomerGroup, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch customer group: {}", e))?
            .ok_or_else(|| format!("Customer group not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update customer group: {}", e))
    }

    pub async fn delete_group(&self, id: &str) -> Result<(), String> {
        self.memberships_repo
            .delete_by_group_id(id)
            .await
            .map_err(|e| format!("Failed to delete group memberships: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete customer group: {}", e))
    }

    pub async fn get_group(&self, id: &str) -> Result<Option<CustomerGroup>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch customer group: {}", e))
    }

    pub async fn list_groups(&self) -> Result<Vec<CustomerGroup>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list customer groups: {}", e))
    }
}
