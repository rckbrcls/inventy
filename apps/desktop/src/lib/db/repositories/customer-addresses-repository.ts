import { invoke } from '@tauri-apps/api/core'
import type {
  CustomerAddress,
  CreateCustomerAddressDTO,
  UpdateCustomerAddressDTO,
} from '@uru/types'

export const CustomerAddressesRepository = {
  async listByShop(shopId: string): Promise<CustomerAddress[]> {
    if (!shopId) {
      throw new Error('shopId is required for list_customer_addresses')
    }
    return invoke('list_customer_addresses', { shopId })
  },

  async listByCustomer(shopId: string, customerId: string): Promise<CustomerAddress[]> {
    return invoke('list_customer_addresses_by_customer', { shopId, customerId })
  },

  async getById(shopId: string, id: string): Promise<CustomerAddress | null> {
    return invoke('get_customer_address', { shopId, id })
  },

  async create(shopId: string, payload: CreateCustomerAddressDTO): Promise<CustomerAddress> {
    return invoke('create_customer_address', { shopId, payload })
  },

  async update(shopId: string, payload: UpdateCustomerAddressDTO): Promise<CustomerAddress> {
    return invoke('update_customer_address', { shopId, payload })
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke('delete_customer_address', { shopId, id })
  },
}
