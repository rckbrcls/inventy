import { invoke } from '@tauri-apps/api/core'
import type {
  CustomerGroup,
  CreateCustomerGroupDTO,
  UpdateCustomerGroupDTO,
} from '@uru/types'

export const CustomerGroupsRepository = {
  async listByShop(shopId: string): Promise<CustomerGroup[]> {
    return invoke('list_customer_groups_by_shop', { shopId })
  },

  async getById(shopId: string, id: string): Promise<CustomerGroup | null> {
    return invoke('get_customer_group', { shopId, id })
  },

  async create(payload: CreateCustomerGroupDTO): Promise<CustomerGroup> {
    return invoke('create_customer_group', { payload })
  },

  async update(payload: UpdateCustomerGroupDTO): Promise<CustomerGroup> {
    return invoke('update_customer_group', { payload })
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke('delete_customer_group', { shopId, id })
  },
}
