import { invoke } from "@tauri-apps/api/core"

export type CustomerGroupMembership = {
  customer_id: string
  customer_group_id: string
  _status: string
  created_at: string
  updated_at: string
}

export type AssignCustomerGroupsDTO = {
  customer_id: string
  group_ids: string[]
}

export const CustomerGroupMembershipsRepository = {
  async listByCustomer(customerId: string): Promise<CustomerGroupMembership[]> {
    return invoke("list_customer_group_memberships_by_customer", { customerId })
  },

  async listByGroup(groupId: string): Promise<CustomerGroupMembership[]> {
    return invoke("list_customer_group_memberships_by_group", { groupId })
  },

  async assignGroups(payload: AssignCustomerGroupsDTO): Promise<CustomerGroupMembership[]> {
    return invoke("assign_customer_groups", { payload })
  },

  async deleteMembership(customerId: string, groupId: string): Promise<void> {
    return invoke("delete_customer_group_membership", { customerId, groupId })
  },
}
