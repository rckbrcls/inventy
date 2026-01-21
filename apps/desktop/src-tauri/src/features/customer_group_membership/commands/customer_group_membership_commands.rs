use crate::features::customer_group_membership::dtos::customer_group_membership_dto::AssignCustomerGroupsDTO;
use crate::features::customer::models::customer_model::CustomerGroupMembership;
use crate::features::customer_group_membership::services::customer_group_membership_service::CustomerGroupMembershipService;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn assign_customer_groups(
    pool: State<'_, SqlitePool>,
    payload: AssignCustomerGroupsDTO,
) -> Result<Vec<CustomerGroupMembership>, String> {
    let service = CustomerGroupMembershipService::new(pool.inner().clone());
    service.assign_groups(payload).await
}

#[tauri::command]
pub async fn list_customer_group_memberships_by_customer(
    pool: State<'_, SqlitePool>,
    customer_id: String,
) -> Result<Vec<CustomerGroupMembership>, String> {
    let service = CustomerGroupMembershipService::new(pool.inner().clone());
    service.list_by_customer(&customer_id).await
}

#[tauri::command]
pub async fn list_customer_group_memberships_by_group(
    pool: State<'_, SqlitePool>,
    group_id: String,
) -> Result<Vec<CustomerGroupMembership>, String> {
    let service = CustomerGroupMembershipService::new(pool.inner().clone());
    service.list_by_group(&group_id).await
}

#[tauri::command]
pub async fn delete_customer_group_membership(
    pool: State<'_, SqlitePool>,
    customer_id: String,
    group_id: String,
) -> Result<(), String> {
    let service = CustomerGroupMembershipService::new(pool.inner().clone());
    service
        .delete_membership(&customer_id, &group_id)
        .await
}
